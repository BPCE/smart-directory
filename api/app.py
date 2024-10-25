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

from urllib.parse import unquote

import binascii

# our imports

from utils.custom_variables import QAXH_PVK

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

#

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
    app.run(debug=True, port=port)

