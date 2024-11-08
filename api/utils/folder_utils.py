import web3
from flask import jsonify
import logging
import json
from solcx import (link_code, get_solc_version, get_installed_solc_versions, get_solcx_install_folder, set_solc_version)
# our stuff
import utils.db as db
import utils.custom_variables

from utils.api_utils import check_args
from utils.w3_utils import deserialize_json, toChecksumAddress

logger = logging.getLogger(__name__)

set_solc_version('0.8.17')
def folderregister(request, w3, folder_class_name, folder_type):
    route = str(request.url_rule)
    logging.info("enter api: %s" % route)
    args = request.args
    logging.debug("args: %s" % str(args))
    variant = args.get("variant", "")
    if (variant.casefold() == "fhe"):
        folder_class_name = folder_class_name + "FHE"
    response = {}
    return_code = 400
    try:
        check_args(args, ['folderaddress',
                          'qapitoken',
                          'hatchaddress'])
    except ValueError as e:
        return_code = 400
        response['message'] = str(e)
        response['return_code'] = return_code
        return_json = json.dumps(response)
        logging.info(route + " returns: " + return_json)
        return jsonify(response), return_code

    logging.info(route + " folderaddress: " + args['folderaddress'])
    if checkFolderActivation(w3, folder_class_name, args['folderaddress']) == True:
        cid = db.getCustomerId(args['qapitoken'])
        if cid == None:
            return_code = 401
            response['message'] = "error 401 no customer ID from qapiToken: "\
                + str(args['qapitoken'])
            response['return_code'] = return_code
            logging.info("response: %s" % json.dumps(response))
            return jsonify(response), return_code
        else:
            cid = int(cid)
            return_code = 200
            try:
                tx_hash = insertSafeInSchemeHatch(w3, args['folderaddress'],
                                                  folder_type,
                                                  cid, 0,
                                                  args['hatchaddress'])
            except web3.exceptions.ContractLogicError as e:
                message = "Contract exception: %s" % e
                return_code = 401
                response['message'] = message
                response['return_code'] = return_code
                logging.info("response: %s" % json.dumps(response))
                return jsonify(response), return_code

            logging.info("returncode: 200, tx_hash: " + tx_hash)
            response["tx_hash"] = tx_hash
    else:
        return_code = 470
        response['message'] = "folder is not activated: %s" % str(
            args['folderaddress'])
    response["return_code"] = return_code
    logging.info("response: %s" % json.dumps(response))
    return jsonify(response), return_code


def insertSafeInSchemeHatch(w3, safe, safeType, CID, money,
                            schemeAddr):
    logging.info("start insertSafeInSchemeHatch: %s" % schemeAddr)
    hatch_abi = deserialize_json("HatchSafe")["abi"]
    scheme = w3.eth.contract(schemeAddr, abi=hatch_abi)
    chain_id = w3.eth.chain_id
    tx_hash = scheme.functions.registerSafe(toChecksumAddress(safe),
                                            safeType, CID, 0).transact()

    return tx_hash.hex()


def checkFolderActivation(w3, folder_type, address):
    chain_id = w3.eth.chain_id
    abi, bytecode = load_folder_abi(folder_type, chain_id)
    folder = w3.eth.contract(address=toChecksumAddress(address),
                             abi=abi)
    folderActivation = folder.functions.getFolderActivation().call()
    return folderActivation == 1


# does linking with libraries
def load_folder_abi(folder_class_name, network_id):
    network_id = str(network_id)
    logging.info("Entering load_folder_abi for: " + folder_class_name +
                    " on network: " + network_id)
    compiled_sol = deserialize_json(folder_class_name)
    abi = compiled_sol['abi']
    logging.info("red abi length: %d" % len(json.dumps(abi)))
    bytecode = compiled_sol['bytecode']
    logging.info("red bytecode length: %d" % len(json.dumps(bytecode)))

    LibFolder_data = deserialize_json("Lib" + folder_class_name)
    LibQaxhFolder_data = deserialize_json("LibQaxhFolder")
    LibQaxhParameters_data = deserialize_json("LibQaxhParameters")
    libs = {"Lib" + folder_class_name: LibFolder_data['networks']
            [network_id]['address'],
            'LibQaxhFolder': LibQaxhFolder_data['networks']
            [network_id]['address'],
            'LibQaxhParameters': LibQaxhParameters_data['networks']
            [network_id]['address']}
    logging.info("available solc versions in path %s: %s" % (str(get_solcx_install_folder()), str(get_installed_solc_versions())))
    logging.info("linking using version: %s with addresses from network: %s"
                 % (get_solc_version(), str(network_id)))
    logging.info("Libs: %s" % str(libs))
    bytecode = link_code(unlinked_bytecode=bytecode,
                         libraries=libs, solc_version="0.8.17")
    if bytecode == None:
        logging.error(folder_class_name + " link failure")
    logging.info("resulting abi length: %d" % len(json.dumps(abi)))
    logging.info("resulting bytecode length: %d" % len(json.dumps(bytecode)))
    # else:
    #    logger.info("hash of bytecode: %s" % w3.keccak(hexstr=bytecode).hex())
    return (abi, bytecode)

# does linking with libraries
def load_folder_with_variant_abi(folder_class_name, network_id, variant=""):
    network_id = str(network_id)
    logging.info("Entering load_folder_with_variant_abi for: %s V: %s " %
                    (folder_class_name, variant) +
                    " on network: " + network_id)
    compiled_sol = deserialize_json(folder_class_name + variant)
    abi = compiled_sol['abi']
    logging.info("info: abi length: %d" % len(json.dumps(abi)))
    bytecode = compiled_sol['bytecode']

    LibFolder_data = deserialize_json("Lib" + folder_class_name)
    LibQaxhFolder_data = deserialize_json("LibQaxhFolder")
    LibQaxhParameters_data = deserialize_json("LibQaxhParameters")
    libs = {"Lib" + folder_class_name: LibFolder_data['networks']
            [network_id]['address'],
            'LibQaxhFolder': LibQaxhFolder_data['networks']
            [network_id]['address'],
            'LibQaxhParameters': LibQaxhParameters_data['networks']
            [network_id]['address']}
    if variant:
        LibFolderVariant_data = deserialize_json("Lib" + folder_class_name +
                                                 variant)
        libs["Lib" + folder_class_name + variant] = \
            LibFolderVariant_data['networks'][network_id]['address']

    logging.info("available solc versions in path %s: %s" % (str(get_solcx_install_folder()), str(get_installed_solc_versions())))
    logging.info("linking using version: %s with addresses from network: %s"
                 % (get_solc_version(), str(network_id)))
    logging.info("Libs: %s" % str(libs))
    bytecode = link_code(unlinked_bytecode=bytecode,
                         libraries=libs, solc_version="0.8.17")
    if bytecode == None:
        logging.error(folder_class_name + variant + " link failure")
    # else:
    #    logger.info("hash of bytecode: %s" % w3.keccak(hexstr=bytecode).hex())
    return (abi, bytecode)
