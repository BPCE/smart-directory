import os
import platform
import traceback
import time
import random
import string
import binascii
import json
import logging

import requests

from typing import (
    Callable,
    Any,
    Dict,
    Optional,
    Tuple,
)
from time import sleep
import web3
from web3 import Web3
from web3.providers.auto import (
    load_provider_from_uri,
)
from web3.types import (RPCEndpoint, RPCResponse)
from web3.exceptions import ValidationError
from eth_typing import (
    URI,
)
from web3.middleware import (
    geth_poa_middleware,
    construct_sign_and_send_raw_middleware,
)

from eth_abi import __version__ as eth_abi__version__
if eth_abi__version__ != '2.2.0':
    from eth_abi import encode as encode_abi
else:
    from eth_abi import encode_abi
from eth_utils import decode_hex, remove_0x_prefix
from eth_utils.abi import function_abi_to_4byte_selector, collapse_if_tuple
from eth_utils.toolz import assoc
from eth_keys import keys, exceptions

from .constants import (PATH_DIR_CONTRACTS_JSON,
                        PATH_DIR_NODE,
                        STR_NULL_ADDRESS,
                        PATH_DIR_DIAMOND_CONTRACTS_JSON)

import utils.custom_variables as custom_variables

import utils.globals as globals

# Global values and environment setup:

os.environ["WEB3_INFURA_SCHEME"] = "https"

logger = logging.getLogger(__name__)


def build_infura_url(domain: str) -> URI:
    scheme = os.environ.get("WEB3_INFURA_SCHEME", "wss")
    key = os.environ.get("WEB3_INFURA_PROJECT_ID", "no_infura_id")
    secret = os.environ.get("WEB3_INFURA_API_SECRET", "no_infura_api_secret")

    if scheme == "wss" and secret != "":
        return URI(f"{scheme}://:{secret}@{domain}/ws/v3/{key}")
    elif scheme == "wss" and secret == "":
        return URI(f"{scheme}://{domain}/ws/v3/{key}")
    elif scheme == "https":
        return URI(f"{scheme}://{domain}/v3/{key}")
    else:
        raise ValidationError(f"Cannot connect to Infura with scheme {scheme!r}")


def build_http_headers() -> Optional[Dict[str, Tuple[str, str]]]:
    secret = os.environ.get("WEB3_INFURA_API_SECRET", "no_infura_api_secret")
    if secret:
        headers = {"auth": ("", secret)}
        return headers
    return None

_infura_mainnet_url = build_infura_url("mainnet.infura.io")
_infura_polygon_amoy_url = "https://rpc-amoy.polygon.technology/"
_infura_polygon_mainnet_url = build_infura_url("polygon-mainnet.infura.io")
_infura_goerli_url = build_infura_url("goerli.infura.io")
_infura_sepolia_url = build_infura_url("sepolia.infura.io")
_fhenix_testnet_url = "https://api.testnet.fhenix.zone:7747"
_zama_devnet_url = "https://devnet.zama.ai"
_xrpl_test_url = "https://rpc-evm-sidechain.xrpl.org"
_hardhat_url = "http://127.0.0.1:8545/"
_mekong_devnet_url = "https://rpc.mekong.ethpandaops.io"
_holesky_testnet_url = "https://ethereum-holesky-rpc.publicnode.com"

_headers = build_http_headers()

def set_poa_chain(w): #for poa eg. rinkeby polygon
    w.middleware_onion.inject(geth_poa_middleware, layer=0)

def get_gasstation(chain_id):
    if int(chain_id) ==  1:
        etherscan_gasstation_api_key = os.environ["ETHERSCAN_GASSTATION_API_KEY"]
        return "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" + etherscan_gasstation_api_key
    elif int(chain_id) == 5:
        return "https://gas-station.qaxh.io/goerli-ethereum"
    elif int(chain_id) == 11155111:
        return "https://gas-station.qaxh.io/sepolia-ethereum"
    elif int(chain_id) == 137:
        return "https://gasstation.polygon.technology/v2"
    elif int(chain_id) == 8009:
        return "https://gas-station.qaxh.io/dev-zama"
    elif int(chain_id) == 49069:
        return "https://gas-station.qaxh.io/testnet-fhenix"
    elif int(chain_id) == 80002:
        return "https://gasstation-testnet.polygon.technology/v2"
    elif int(chain_id) == 1440002:
       return "https://gas-station.qaxh.io/dev-xrpl"
    elif int(chain_id) == 7078815900:
        return "https://gas-station.qaxh.io/dev-mekong"
    elif int(chain_id) == 17000:
        return "https://gas-station.qaxh.io/holesky-ethereum"
    else:
        return ""

# how to send transactions: https://web3py.readthedocs.io/en/stable/transactions.html

def get_transaction_dict(from_add = None, w3 = None):
    if w3 == None:
        w3 = globals.w3
    logger.log(logging.DEBUG,"transaction dict chain_id: %s" % str(w3.eth.chain_id))
    if from_add == None:
        from_add = check_address(custom_variables.QAXH_PVK)
    nonce = w3.eth.get_transaction_count(from_add)
    chain_id = w3.eth.chain_id
    result = {"nonce": nonce,
               "from": from_add,
               "chainId": chain_id}
    latest_block = globals.w3.eth.get_block("latest")
    base_fee = latest_block.get('baseFeePerGas')
    the_maxPriorityFee = None

    if base_fee is None: # very unlikely
        base_fee = 14 # from historical data
        the_maxPriorityFee = 2 * 1000000000 # 1Gwei
        result['maxPriorityFeePerGas'] = the_maxPriorityFee
        result['maxFeePerGas'] = the_maxPriorityFee + 2 * base_fee
        return result

    url = get_gasstation(chain_id)

    if len(url) == 0: # random chains assume no gas stations
        if base_fee is None:
            base_fee = 14 # from historical data
        the_maxPriorityFee = 2 * 1000000000 # 1Gwei
        result['maxPriorityFeePerGas'] = the_maxPriorityFee
        result['maxFeePerGas'] = the_maxPriorityFee + 2 * base_fee
        return result

    # call gas station
    try:
        logging.info("gas station url: " + url)
        resp = requests.get(url=url, params={})
        data = resp.json()
        if 'fast' in data: # polygon gas station
            logging.info ("polygon gas station")
            base_fee = int(data['estimatedBaseFee']*1000000000)
            result['maxPriorityFeePerGas'] = int(
                data['standard']['maxPriorityFee']*1000000000)
            result['maxFeePerGas'] = int(
                data['standard']['maxFee']*1000000000)
            while (result['maxPriorityFeePerGas'] > result['maxFeePerGas']):
                result['maxFeePerGas'] = result['maxFeePerGas'] + 2 * base_fee
            logging.info (str(result))
            return result
        elif 'result' in data:
            logging.info ("etherscan or our gasstation")
            fee_data = data['result']
            base_fee = int(fee_data['suggestBaseFee']*1000000000)
            the_maxPriorityFee = int(
                (fee_data['ProposeGasPrice']-fee_data['maxPriorityFee'])*1000000000)
            if the_maxPriorityFee == 0:
                the_maxPriorityFee = 1000000000;
            result['maxPriorityFeePerGas'] = the_maxPriorityFee
            result['maxFeePerGas'] = the_maxPriorityFee + 2 * base_fee
            logging.info (str(result))
            return result
    except requests.exceptions.ConnectionError as e:
        the_maxPriorityFee = 50 * 1000000000
        logging.warning(url + " not responding using 50Gwei " +
                        "as priority fee")
    logger.log(logging.DEBUG,"gasstation malfunction of unknown chain_id: %s" % str(w3.eth.chain_id))
    if the_maxPriorityFee is not None:
        result['maxPriorityFeePerGas'] = the_maxPriorityFee
        result['maxFeePerGas'] = the_maxPriorityFee + 2 * base_fee
        return result

# some middleware documentation:
# https://snakecharmers.ethereum.org/web3py-internals-json-rpc-round-trips/
def gas_price_london_middleware(
    # this middleware is used for eth_sendTransaction, NOT eth_sendRawTransaction
    make_request: Callable[[RPCEndpoint, Any], Any], web3: "Web3"
) -> Callable[[RPCEndpoint, Any], RPCResponse]:
    """
    Includes a gas price using the polygon testnet gas station fast value
    """
    def middleware(method: RPCEndpoint, params: Any) -> RPCResponse:
        if method == 'eth_sendTransaction':
            logging.debug("London middleware inserting fees in tx: %s" % str(params))
            transaction = params[0]
            if not 'from' in transaction:
                transaction['from'] = check_address(custom_variables.QAXH_PVK)
            transaction_dict = get_transaction_dict(transaction['from'])
            transaction = assoc(transaction, 'maxPriorityFeePerGas',
                                    transaction_dict['maxPriorityFeePerGas'])
            transaction = assoc(transaction, 'maxFeePerGas',
                                    transaction_dict['maxFeePerGas'])
            return make_request(method, [transaction])
        return make_request(method, params)
    return middleware


def init_w3(new_chain_id):
    match new_chain_id.casefold():
        case "ethereum" "1":
            w3 = Web3(load_provider_from_uri(_infura_mainnet_url, _headers))
        case "polygon" | "137":
            w3 = Web3(load_provider_from_uri(_infura_polygon_mainnet_url, _headers))
            set_poa_chain(w3)
        case "goerli" | "5":
            w3 = Web3(load_provider_from_uri(_infura_goerli_url, _headers))
        case "amoy" | "80002":
             w3 = Web3(load_provider_from_uri(_infura_polygon_amoy_url, _headers))
             set_poa_chain(w3)
        case "local":
            w3 = Web3(Web3.IPCProvider(PATH_DIR_NODE + "bor.ipc", timeout=600))
            set_poa_chain(w3)
        case "xrpltest" | "1440002":
            w3 = Web3(load_provider_from_uri(_xrpl_test_url, _headers))
            set_poa_chain(w3)
        case "sepolia" | "11155111":
            w3 = Web3(load_provider_from_uri(_infura_sepolia_url, _headers))
        case "holesky" | "17000":
            w3 = Web3(load_provider_from_uri(_holesky_testnet_url, _headers))
        case "mekong" | "7078815900":
            w3 = Web3(load_provider_from_uri(_mekong_testnet_url, _headers))
        case "fhenixtestnet" | "42069":
            w3 = Web3(load_provider_from_uri(_fhenix_testnet_url, _headers))
            sleep(1)
            pk=w3.eth.call({ 'to': '0x0000000000000000000000000000000000000044'})
            with open("fhevm_pk.bin","wb") as fb:
                fb.write(pk)
        case "zamadevnet" | "8009":
            w3 = Web3(load_provider_from_uri(_zama_devnet_url, _headers))
            sleep(1)
            block = w3.eth.get_block_number()
            logger.log(logging.DEBUG,"latest block: %d" % block)
            sleep(1)
            try:
                version = w3.clientVersion
            except AttributeError as e:
                version = w3.client_version
            logger.log(logging.DEBUG,"version: %s" % version)
            sleep(1)
            pk=w3.eth.call({ 'to': '0x0000000000000000000000000000000000000044'})
            with open("fhevm_pk.bin","wb") as fb:
                fb.write(pk)
            logger.log(logging.DEBUG,"retrieved public key: %s" % os.popen('ls -l fhevm_pk.bin').read())
            logger.log(logging.DEBUG,'this is a log')
        case "hardhat":
            w3 = Web3(Web3.HTTPProvider(_hardhat_url, request_kwargs={'timeout': 70}))
        case _:
            raise ValueError("unknown blockchain")
    if new_chain_id.isdigit():
        assert (int(new_chain_id) == w3.eth.chain_id)
    # caching middleware for chain_id
    w3.middleware_onion.add(web3.middleware.simple_cache_middleware)
    # sign and send must be inserted before the gasprice middleware
    w3.middleware_onion.add(construct_sign_and_send_raw_middleware(custom_variables.QAXH_PVK))
    try:
        w3.middleware_onion.remove('eip_1559_gasprice')
    except ValueError as e:
        print ("middleware eip_1559_gasprice was absent")
    w3.middleware_onion.add(gas_price_london_middleware, 'eip_1559_gasprice')
    print ("london middleware is deployed")
    try:
        logger.log(logging.DEBUG,"w3 connection: %r chain_id: %s" % (w3.is_connected(),str(w3.eth.chain_id)))
    except AttributeError:
        logger.log(logging.DEBUG,"w3 connection: %r chain_id: %s" % (w3.is_connected(),str(w3.eth.chain_id)))
    # traceback.print_stack(file=sys.stdout)
    return w3

logger = logging.getLogger(__name__)
logging.getLogger(__name__).setLevel(logging.DEBUG)


def logging_setup(LOG_FILENAME=None):
    # LOG_FORMAT = (
    #    '\n[%(levelname)s/%(name)s:%(lineno)d] %(asctime)s (%(processName)s/%(threadName)s)\n    > %(message)s')

    LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    logging.basicConfig(level=logging.INFO,
                        # format=LOG_FORMAT,
                        datefmt=LOG_DATE_FORMAT,
                        handlers=[logging.FileHandler(LOG_FILENAME),
                                  logging.StreamHandler()])


class Logger():
    def __init__(self, logActive=False):
        self.logActive = logActive

    def log(self, log_msg):
        if self.logActive:
            logging.info(log_msg)

    def activate_logs(self):
        self.logActive = True


# Format the abi so that it can be passed
# to web3.eth.contract method and into SQL queries
def format_abi(abi):
    return abi.replace("'", '"').replace("False", "false").replace("True", "true")


# Return the transaction receipt of tx_hash.
# Returns None if the receipt could not be
# obtained before the timer reaches out.
def wait_for_receipt(tx_hash, timer=600):
    receipt = None
    try:
        receipt = globals.w3.eth.wait_for_transaction_receipt(
                            tx_hash , timeout=timer)
    except web3.exceptions.ContractLogicError as e:
        logging.info("Exception while waiting: %s" % str(e))
    except web3.exceptions.TimeExhausted as e:
        logging.info("Timeout while waiting: %s" % str(e))
    return receipt


# Cancel a pending transaction sent by the address sender by
# sending from the sender's address another transaction with
# the same nonce and a higher gasPrice.
def cancel_transaction(sender, password, nonce):
    globals.w3.eth.sendTransaction({
        "from": sender,
        "to": STR_NULL_ADDRESS,
        "data": "0x",
        "value": 0,
        "nonce": nonce
    })



# Deserialize the content of <PATH_DIR_CONTRACTS_JSON><name>.json
# into a python object.
def deserialize_json_internal(path):
    with open(path,"rb") as f:
        data = f.read()
        return json.loads(data.decode('utf8'))

def deserialize_json(*names, base_path='') :
    if not base_path:
        base_path=PATH_DIR_CONTRACTS_JSON
    name = names[0]
    return deserialize_json_internal(os.path.join(base_path, name + ".json"))

# Deserialize the content of <PATH_DIR_DIAMOND_CONTRACTS_JSON><name>.json into a python object.
def deserialize_diamond_json(name) :
    return deserialize_json(name, base_path=PATH_DIR_DIAMOND_CONTRACTS_JSON)

def deserialize_test_json(name) :
    return deserialize_json(name, base_path=PATH_DIR_TEST_CONTRACTS_JSON)


def check_address(priv_hex):
    priv_key_bytes = decode_hex(priv_hex)
    priv_key = keys.PrivateKey(priv_key_bytes)
    pub_key = priv_key.public_key
    add = pub_key.to_checksum_address()
    return add

def transact_using_raw(transac_to_execute, priv, transaction_dict = None):
    w3 = globals.w3
    signed_txn = get_signed_raw(transac_to_execute, priv, transaction_dict)
    return w3.eth.send_raw_transaction(signed_txn.rawTransaction).hex()

def get_signed_raw(transac_to_execute, priv, transaction_dict = None):
    w3 = globals.w3
    if None == transaction_dict:
        transaction_dict = get_transaction_dict(check_address(priv))
    tx = transac_to_execute.build_transaction(transaction_dict)
    signed_tx = w3.eth.account.sign_transaction(
        tx, private_key=decode_hex(priv))
    return signed_tx


def toChecksumAddress(address):
    return Web3.to_checksum_address(address)

def transfer_wei(w3, how_many_wei, from_address, to):
    transaction_dict = get_transaction_dict(from_address, w3)
    transaction_dict["value"] = how_many_wei
    transaction_dict["to"] = to
    gas = w3.eth.estimate_gas(transaction_dict)
    transaction_dict["gas"] = gas

    logger.log(logging.DEBUG,"Charging tx: %s gas: %s" % (json.dumps(transaction_dict),str(gas)))
    signed_tx = w3.eth.account.sign_transaction(transaction_dict, custom_variables.QAXH_PVK)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.log(logging.DEBUG,"Charged tx_hash: %s" % tx_hash.hex())
    return tx_hash.hex()


def deploy_contract(w3, contract_struct, constructor_params, name = ""):
    tx_hash = None
    response = {"name": name}

    try:
        logging.debug("address %s is deploying contract" %
                                        check_address(custom_variables.QAXH_PVK))
        signed_tx = get_signed_raw(
                    contract_struct.constructor(*constructor_params),
                    custom_variables.QAXH_PVK)
        if True: # deploy contract using a raw transaction
            tx_hash = w3.eth.send_raw_transaction(
                                        signed_tx.rawTransaction)
        else:
            transaction_dict = get_transaction_dict(check_address(custom_variables.QAXH_PVK))
            tx_hash = contract_struct.constructor(*constructor_params)\
                        .transact(transaction_dict)

        tx_hash = tx_hash.hex()

    except ValueError as err:
        message = "deployment failed " + format(err)
        logging.info(message)
        return_code = 515
        response["tx_hash"] =  None
        response["error"] = message
        response["return_code"] = return_code
        return  response

    logging.info("deployment tx_hash: " + tx_hash)
    return_code = 200
    response["tx_hash"] =  tx_hash
    response["return_code"] = return_code
    logging.info("response: %s" % json.dumps(response))
    return response


# Deploy the contract <name>.json
def deploy_contract_from_name(w3, name, constructor_params):
    logging.info("in deploy_contract %s parameters %s" % (name, json.dumps(constructor_params)))
    # Retrieve the data ABI and bytecode, then build the contract class:
    response = {"name" : name}
    compilation_result = deserialize_json(name)
    abi = compilation_result["abi"]
    bytecode = compilation_result["bytecode"]

    try:
        to_be_deployed = w3.eth.contract(abi=abi, bytecode=bytecode)
    except binascii.Error:
        return_code = 400;
        message = "***Error: %s bytecode link failure" % "should not happen"
        logging.critical(message)
        response["tx_hash"] =  None
        response['message'] = message
        response["return_code"] = return_code
        return response
    return deploy_contract(w3, to_be_deployed, constructor_params)


# ONLY USE WHEN THERE'S """ONE""" MODULE
# see CreateAndAddModules.sol, line 20 if you want to make it better
def createAndAddModulesData(dataArray):
    data = dataArray[2:]
    length_data = len(data) // 2
    padding = 64 - len(data) % 64
    bytes_array = "0x" + \
        (64 - len(hex(length_data)[2:])) * '0' + \
        hex(length_data)[2:] + data + '0' * padding
    return bytes_array


# Convert a binary tx_hash to its hexadecimal representation in string
def bin2hex_address(binaryAddress):
    return "0x" + binascii.b2a_hex(binaryAddress).decode("utf-8")


# Print a function call in a lisible way: <function_signature>\n[<32_bytes>\n]
def print_function_call(function_call):
    print(function_call[:10])
    args_length = len(function_call) - 10
    for i in range(args_length // 64):
        print(function_call[10 + 64 * i: 10 + 64 * (i + 1)])
    print(function_call[10 + args_length - args_length % 64:])


# Print a bytes array in a lisible way: 32 bytes per line.
def print_bytes_array(array):
    array = array[2:]
    for i in range(len(array) // 64):
        print(array[64 * i: 64 * (i + 1)])
    print(array[len(array) - len(array) % 64:])


def random_string(length):
    return ''.join(random.choice(string.ascii_letters) for i in range(length))


###############################################################################
############################  DIAMOND UTILITY FUNCTIONS  ######################
###############################################################################
FacetCutAction = {
    'Add': 0,
    'Replace': 1,
    'Remove': 2
}


def get_named_function_selectors(python_contract):
    selectors = []
    for field in python_contract.abi:
        if field['type'] == 'function':
            function_selector = function_abi_to_4byte_selector(field)
            selectors.append([function_selector.hex(), field['name']])
    return selectors


def get_selectors(python_contract):
    selectors = []
    for field in python_contract.abi:
        if field['type'] == 'function':
            function_selector = function_abi_to_4byte_selector(field)
            selectors.append('0x' + function_selector.hex())
    return selectors


def set_contract_cut_array(action_type, contract_facet):
    logging.info([contract_facet.address,
                 FacetCutAction[action_type], get_selectors(contract_facet)])
    return [contract_facet.address, FacetCutAction[action_type], get_selectors(contract_facet)]

    # get the address of a deployed facet.
    # deployment should have been done with 'truffle deploy' in order to have the address
    # stored in the JSON file


def get_contract_address(contract_json_data, network_id):
    return contract_json_data['networks'][str(network_id)]['address']


def get_usersafe_facet_instance(usersafe_address=None, facet_name=None):
    # find the corresponding JSON file of the function_name
    facet_abi = deserialize_diamond_json(facet_name)['abi']
    return globals.w3.eth.contract(address=usersafe_address, abi=facet_abi)


def run_raw_transaction(transaction_params, function_signature=None, args_types=[], args_list=[]):
    function_selector = globals.w3.keccak(text=function_signature)[0:4]
    print("Send transaction to Diamond usersafe address ==> " +
          transaction_params["destination_address"])
    calldata = function_selector + (encode_abi(args_types, args_list))
    usersafe_transaction = {
        "from": transaction_params["sender_address"],
        "to": transaction_params["destination_address"],
        "gasPrice": transaction_params["gasPrice"],
        # "gasPrice": globals.w3.toWei("30", "gwei"),
        "data": calldata
    }
    return globals.w3.eth.sendTransaction(usersafe_transaction)

def diagnose_error_if_needed(receipt):
    w3 = globals.w3
    if receipt.status != 1:
        tx = w3.eth.get_transaction(receipt.transactionHash)
        # build a new transaction to replay:
        replay_tx = {
            'to': tx['to'],
            'from': tx['from'],
            'value': tx['value'],
            'data': tx['input'],
        }
        # replay the transaction locally:
        w3.eth.call(replay_tx, tx.blockNumber - 1)

#from eth_utils.abi import function_abi_to_4byte_selector, collapse_if_tuple
def decode_custom_error(w3, contract_abi, error_data):
    for error in [abi for abi in contract_abi if abi["type"] == "error"]:
        # Get error signature components
        name = error["name"]
        data_types = [collapse_if_tuple(abi_input) for abi_input in error.get("inputs", [])]
        error_signature_hex = function_abi_to_4byte_selector(error).hex()
        # Find match signature from error_data
        if error_signature_hex.casefold() == str(error_data)[2:10].casefold():
            params = ','.join([str(x) for x in w3.codec.decode(data_types,
                                        bytes.fromhex(str(error_data)[10:]))])
            decoded = "%s(%s)" % (name , str(params))
            return decoded
    return None #try other contracts until result is not None since error may be raised from another called contract

def check_nft_exists(w3, filehash, contract = None, folder_address = None):

    if contract == None:
        NFTFolder_contract = w3.eth.contract(address=folder_address,
                                abi=deserialize_json("NftFolder")["abi"])
    else:
        NFTFolder_contract = contract
    try:
        nftFileHash = NFTFolder_contract.functions.getTokenFileHash(
                                    int(remove_0x_prefix(filehash),16)).call()
    except ValueError as e:
        return False
    return int.from_bytes(nftFileHash,"little") != 0

