import platform
import os
import utils.globals as globals
from dotenv import load_dotenv

load_dotenv()

PATH_DATABASE = "/home/qaxh_admin/hatch_db/user_database.db"
PATH_HATCH_DATABASE = "/home/qaxh_admin/hatch_db/hatch_database.db"


if platform.system() == 'Windows':
    base_path='C:/Users/josel/work/qaxh3_dev'
elif platform.system() == 'Linux':
    if 'microsoft-standard' in platform.uname().release:
        base_path='/mnt/c/Users/josel/work/qaxh3_dev'
    else:
        base_path='/var/www'
elif platform.system() == 'Darwin':
    base_path='/Users/thnab/miniconda3/BPCE_QAXH.IO'
else:
    raise Exception("OS not supported")
    

PATH_DIR_CONTRACTS_JSON = os.path.normpath(base_path + '/smart-directory/build/contracts/')
PATH_DIR_DIAMOND_CONTRACTS_JSON = PATH_DIR_CONTRACTS_JSON

PATH_DIR_NODE = "/var/lib/bor/"


QAXH_ADDRESS = "0x88D65F27e269b4f92CE2Ccf124eAE8648635a67A"
QAXH_PVK = os.environ.get("QAXH_PVK", "missing QAXH_PVK private key")
print ("QAXH_PVK %s" % QAXH_PVK)

QAXHU_AMOY = "0xCa3902357025C7134bad6236eEA679a8009e6767"
QAXHU_ZAMA = "0xe6684FdE48705782a0691865e2e52d7B77aC636E"
FHEQAXHU_ZAMA = "0x4c96f01B92b6006AD30318C41B0805AE8Aa59A4d"
QAXHU_XRPL = "0xB45140391AeBd9058797772C082b5aC2846658DC"

QAXHA_AMOY = "0x57713F18A0A719fcD513C910cCd65c0f49E64F91"
QAXHA_ZAMA = "0xF84f79f8F74D7A1f443fD985683D6E3BcFd20B2c"
FHEQAXHA_ZAMA = "0x6D5ddfb2a986fE6e079d046F634A3F614b4c437e"
QAXHA_XRPL = "0x3921294a19F720357397B186891cda3Df6Edf593"

# used for our internal signatures, may or not be the same on different chains
# private key is in qaxhauth
AUTH_ADDRESS_AMOY = "0xb36994e37B0CF7e4B6aB6e7Af95f0b2191798B0b"
AUTH_ADDRESS_ZAMA = "0xb36994e37B0CF7e4B6aB6e7Af95f0b2191798B0b"
AUTH_ADDRESS_XRPL = ""

AUTH_ACCESS_URL_AMOY = "https://qaxhauth-amoy.qaxh.io/qaxhaccess"
AUTH_ACCESS_URL_ZAMADEV = "https://qaxhauth-zamadev.qaxh.io/qaxhaccess"
AUTH_ACCESS_URL_XRPLTEST = "https://qaxhauth-xrpltest.qaxh.io/qaxhaccess"

FILESERVER_RETURN_URL_AMOY = "https://fileserver-amoy.qaxh.io/nftserver/qaxhlogin/"
FILESERVER_RETURN_URL_ZAMADEV = "https://fileserver-zamadev.qaxh.io/nftserver/qaxhlogin/"
FILESERVER_RETURN_URL_XRPLTEST = "https://filserver-xrpltest.qaxh.io/nftserver/qaxhlogin/"

SERVICE_CID_TEST = 13

qaxhCustomer1  = "QT44432328939118828591234014009433994608"
qaxhCustomer2  = "QT785211541968615435860304501514841822759"
qaxhCustomer3  = "QT294678832566631516884216084512325461136"
qaxhCustomer4  = "QT331725256022177223195426733805254412802"
qaxhCustomer5  = "QT156162891985793871796935183552189293161"
qaxhCustomer6  = "QT281855438443003113845242185605570803489"
qaxhCustomer7  = "QT218929390573138331907672552730324168944"
qaxhCustomer8  = "QT311828282375567593783583547572618225846"
qaxhCustomer9  = "QT169398666409787798371667309897268718524"
qaxhCustomer10 = "QT14868278347901534470935291924540755688"
qaxhCustomer11 = "QT54515755743289375192025018228693339063"
qaxhCustomer12 = "QT141651777326116913910567290125943970376"
qaxhCustomer13 = "QT165741026059440390566741165574069784448"
qaxhCustomer14 = "QT101587205697620669656186002319481017167"
qaxhCustomer15 = "QT131238127358903370187228720031510957429"
qaxhCustomer16 = "QT331087831905133516977073658247031882667"
qaxhCustomer17 = "QT220336479995010542651134531527670449497"
qaxhCustomer18 = "QT332380221608868221822438179075259339962"
qaxhCustomer19 = "QT103988925109233669615155873016103116072"
qaxhCustomer20 = "QT146185432562755862338645581452432331715"

STR_NULL_ADDRESS = "0x0000000000000000000000000000000000000000"

def init(blockchain_id):
    globals.SERVICE_CID = SERVICE_CID_TEST
    match str(blockchain_id):
        case "80002":
            globals.QAXHU = QAXHU_AMOY
            globals.QAXHA = QAXHA_AMOY
            globals.AUTH_ADDRESS = AUTH_ADDRESS_AMOY
            globals.AUTH_ACCESS_URL = AUTH_ACCESS_URL_AMOY
            globals.FILESERVER_RETURN_URL = FILESERVER_RETURN_URL_AMOY
        case "8009":
            globals.QAXHU = QAXHU_ZAMA
            globals.QAXHA = QAXHA_ZAMA
            globals.AUTH_ADDRESS = AUTH_ADDRESS_ZAMA
            globals.AUTH_ACCESS_URL = AUTH_ACCESS_URL_ZAMADEV
            globals.FILESERVER_RETURN_URL = FILESERVER_RETURN_URL_ZAMADEV
        case "1440002":
            globals.QAXHU = QAXHU_XRPL
            globals.QAXHA = QAXHA_XRPL
            globals.AUTH_ADDRESS = AUTH_ADDRESS_XRPL
            globals.AUTH_ACCESS_URL = AUTH_ACCESS_URL_XRPLTEST
            globals.FILESERVER_RETURN_URL = FILESERVER_RETURN_URL_XRPLTEST
        case _:
            raise NotImplementedError(str(blockchain_id))
