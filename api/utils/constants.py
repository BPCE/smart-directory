# README ######################################################################
#                                                                             #
# The goal of this file and others like qx_account is to make any upgrade in  #
# the project architecture easier to setup: since it is in common with        #
# all the python scripts                                                      #
#   1.) Path format : PATH_[DIR_]<file>                                       #
#   2.) Constant values format : <type>_<name> ; example : SZ_SUB for sub size#
#                                                                             #
###############################################################################


# /!\ Since this file has been added to git, it must not contain confidential
# --- informations (e.g. qaxh private key, list of domain names...).

# SERVER SPECIFIC VARIABLES

# Full path of the sqlite3 database which contains:
#   1.) The safes addresses and their related sub identifier.
#   2.) The deployed smart contracts addresses, name and abi.
# NB: No need to record the appInventor keys in this database since they're
# already saved in their associated Qaxh Safe.
from .custom_variables import PATH_DATABASE

#Path of the directory containing the <contract>.json files. Each json file has:
#   1.) The contract ABI.
#   2.) The contract bytecode.
from .custom_variables import PATH_DIR_CONTRACTS_JSON

from .custom_variables import PATH_DIR_DIAMOND_CONTRACTS_JSON

from .custom_variables import PATH_HATCH_DATABASE

# Datadir path of Geth running instance
from .custom_variables import PATH_DIR_NODE


# CONSTANT VALUES

# Size needed to save the hash of a sub (e.g. Ethereum adress) into a string.
# NB: It is not the size of the sub (e.g. address) in bytes but the double of
# the size in bytes since it requires 2 characters (e.g. bytes) to represent
# one byte written into its hexadecimal form.
# Example : `0x10` contains only one byte in base 16 (`00010000` in base 2) but
# requires 2 characters to be saved as a string in its hexadecimal representation
# if we ignore the header `0x`).

NFT_FOLDER_TYPE = 13
NFTFHE_FOLDER_TYPE = 18
ACCESS_FOLDER_TYPE = 17
NFT_BARTER_TYPE = 20
STR_NULL_ADDRESS = "0x0000000000000000000000000000000000000000"
