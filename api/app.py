import sys
import getopt
from os import path as os_path

from web3 import __version__ as web3__version__
from web3 import __file__ as web3__file__
from web3.exceptions import BadFunctionCallOutput, ContractLogicError, ContractCustomError
from eth_utils import remove_0x_prefix

from flask import Flask, redirect, request, session, render_template, jsonify
from flask import __version__ as flask__version__
from flask import __file__ as flask__file__

import json
import logging
import hashlib

from solcx import (link_code, get_solc_version, get_installed_solc_versions, get_solcx_install_folder, set_solc_version)

from urllib.parse import unquote

import binascii

set_solc_version('0.8.17')

# our imports

import utils.custom_variables as custom_variables
import utils.globals as globals

from utils.w3_utils import (check_address, init_w3,
                            deserialize_json, get_signed_raw,
                            transact_using_raw,
                            diagnose_error_if_needed,
                            toChecksumAddress, logging_setup,
                            check_nft_exists,
                            deploy_contract, deploy_contract_from_name)
                            
from utils.custom_variables import QAXH_PVK
from utils.api_utils import check_args

# Logging setup
flaskPATH = os_path.abspath(os_path.split(__file__)[0])
#logging_setup(flaskPATH + "/log/log.txt")
logging.info("API restarting")

logger = logging.getLogger()
logger.setLevel(logging.INFO) # setting DEBUG here will output the eth RPC traces
logger.addHandler(logging.StreamHandler())
logger.addHandler(logging.FileHandler('./log/log.txt'))

#  version verification

logging.info("flask version: " + flask__version__ + " from: " + flask__file__)
logging.info("web3.py version: " + web3__version__ + " from: " + web3__file__)

app = Flask(__name__)


#
# API ROUTES
#

@app.route("/smart-directory/ping", methods=['GET', 'POST'])
def smart_directory_ping():
    return "smart-directory ping success\n"


@app.route("/smart-directory/smartdirectorycreate", methods=['GET', 'POST'])
def smart_directory_create():
    route = str(request.url_rule)
    logging.info("enter api: %s" % route)
    response = {}
    return_code = 200
    args = request.args

    w3 = globals.w3

    try:
        check_args(args, [
                                    'parent_address1',
                                    'parent_address2',
                                    'contract_uri',
                                    'mint_code',
                                    'chain_id'
                                    ]
                        )
    except ValueError as e:
        return_code = 400
        response['message'] = str(e)
        response['return_code'] = return_code
        return_json = json.dumps(response)
        logging.info(route + " returns: " + return_json)
        return jsonify(response), return_code

    abi, bytecode = load_smart_directory_abi(w3.eth.chain_id)

    try:
        to_be_deployed = globals.w3.eth.contract(abi=abi, bytecode=bytecode)
    except binascii.Error:
        return_code = 400;
        message = "***Error: %s bytecode link failure" % (folder_class_name +                                                                                                                                                                                                                                                    
                            variant)
        logging.critical(message)
        response['message'] = message                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        response["retcode"] = return_code
        return_json = json.dumps(response)
        logging.info(route + " returns: " + return_json)
        return jsonify(response), return_code

    params = [  
                toChecksumAddress(args['parent_address1']),
                toChecksumAddress(args['parent_address2']),
                args['contract_uri'],
                int(args['mint_code'])
             ]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    return deploy_contract(globals.w3, to_be_deployed, params)

                                                                                                                                 
#                                                                
def load_smart_directory_abi(network_id):
    network_id = str(network_id)
    logging.info("Entering load_directory_abi on network: " + network_id)
    compiled_sol = deserialize_json("SmartDirectory")
    abi = compiled_sol['abi']
    logging.info("red abi length: %d" % len(json.dumps(abi)))
    bytecode = compiled_sol['bytecode']
    logging.info("red bytecode length: %d" % len(json.dumps(bytecode)))

    SmartDirectoryLib_data = deserialize_json("SmartDirectoryLib")

    libs = {
            'SmartDirectoryLib': SmartDirectoryLib_data['networks']
                [network_id]['address']
            }
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
    return (abi, bytecode)

# MAIN PROGRAM #
if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:],
                                   "p:c:", ["port=", "chain_id="])
    except getopt.GetoptError:
        print("python app.py -p <port> -c <chain_id>")

    for opt, arg in opts:
        if opt in ("-c", "--chain_id"):
            chain_id = arg
        elif opt in ("-p", "--port"):
            port = arg

    app.config['CHAIN_ID'] = chain_id
    custom_variables.init(chain_id)
    globals.w3 = init_w3(chain_id)
    app.run(debug=True, port=port)

