
## Ce smart contract est-il légitime ?
[Documentation complète](SmartDirectory_Specifications.md)

[Déploiement du projet](<##Déploiement du projet>)

Confronté à la prolifération des adresses, l'utilisateur à besoin de s'assurer de leur authenticité lorsqu'il s'apprete à effectuer une transaction d'importance qu'elle soit monétaire ou de confiance.

Nous proposons une structuration de l'offre: le "smart directory" est une liste blanche administrée.

Le smart directory est constitué de 2 listes:
- une liste d'adresses de fournisseurs de services sur la blockchain dite "liste des registrants"
- une liste d'adresses de smart contracts émis par ces fournisseurs dite "liste des references"

Le smart directory est lui meme un smart contract au sens d'une EVM Ethereum, le deployeur du smart directory designe les administrateurs (2 adresses possibles), possiblement lui-meme. Les administrateurs peuvent agir sur la liste des registrants: ajouter ou invalider un registrant.

Un registrant est un fournisseur de service qui après avoir obtenu un agrément auprès de l'administrateur est inscrit par ce dernier. Un exemple d'utilisation par une administration publique serait l'enregistrement des adresses sur des PSAN par l'AMF. D'autres exemples sont donnés en fin de document.

Une fois que le registrant (c'est à dire son adresse d'origine des déploiements) est présent dans la liste, celui-ci peut commencer à:
- deployer les smart contracts correspondants aux services qu'il propose.
- enregistrer les adresses de ces smart contracts dans la liste des références.
Le registrant renseigne aussi sa propre URL (seul lui peut le faire), celle ci-sera consultable par les clients et leur permettra de consulter les termes du service et de s'enregister (signer le contrat de service à distance, etc ...)
Lorsque le service est très simple, par exemple achat/échange/création de NFT, l'URL permet au client d'identifier le service et ainsi verifier que ce service a été agréé par l'autorité administrative.


Les listes du smartDirectory étant sur la blockchain, elles sont consultables par le code des smart contracts qui peuvent effectuer des contrôles supplémentaires. Un possibilité d'utilisation est d'enregistrer dans la liste des références une liste blanche des EOA ou contrats autorisés à déposer ou recevoir des tokens ou des ethers. Un emetteur comme Circle pourrait émettre des stable coins reservés à des institutionnels et enregistrerait les adresses des institutionnels dans la liste des references, les smart contracts d'echange pourraient alors verifier que l'institutionnel est bien autorisé à envoyer des tokens et que le receveur est bien autorisé à les recevoir.


## Déploiement du projet

Le projet est composé de 4 éléments :

* un jeu de smart-contracts solidity constituant le SmartDirectory,

* le serveur de déploiement,

* une Application Android de démonstration du smartDirectory (alpha),

* une application web de supervision d'un SmartDirectory.


## Pré-requis : 

* Installer git 2.3.10 ou supérieur.
* Ouvrir une session de terminal unix ou WSL (Windows System for Linux) et cloner ce dépôt :

```bash
git clone https://github.com/BPCE/smart-directory.git
```

## Compilation des smartContracts
Se positionner dans le dossier "smart-directory"et executer le script "install.sh" :

```bash
cd smart-directory
./install.sh
```
puis :

```Bash
truffle compile && truffle-abi
```
Une interaction directe avec les smart-contracts peut être faite en utilisant l'environnement online Remix 
(https://remix.ethereum.org/) :
* installer le démon "remixd"

```Bash
npm install -g @remix-project/remixd
```
* lancer le démon

```Bash
npm install -g @remix-project/remixd
```
* se rendre sur le site [remix.ethereum.org](https://remix.ethereum.org/) et activer le plugin "REMIXD". Les 
smart-contracts seront déployables et manipulables en mode "localhost (cf. la documentation [remixd](https://remix-ide.readthedocs.io/en/latest/remixd.html).

## Le serveur de déploiement
* Installer l'utilitaire screen 4.9 ou supérieur avec le gestionnaire de paquet de votre distribution.
* Se positionner dans le dossier "api" et exécuter le script "install.sh" :

```Bash
cd api
./install.sh
```
puis :

```Bash
./init.sh
```
Plus d'informations dans la section "[Le serveur de déploiement]()" de la 
[documentation complète](SmartDirectory_Specifications.md).

## Application Android de démonstration du smartDirectory (alpha)

Une application smartphone Android permet d'utiliser les fonctions du SmartDirectory.

Son code source est fourni dans le répertoire "smart-directory/android" sous forme du fichier "AE_Qaxh131.aia".

L'application est à installer sur smartphone en téléchargeant son fichier "AE_Qaxh131.apk" depuis le dossier 
"smart-directory/android".

Les informations permettant de consulter le code source de l'application (et de le compiler) ainsi que le descriptif des
fonctions disponibles sont dans la section [Application Android de démonstration du smartDirectory (alpha)]() de la 
[documentation complète](SmartDirectory_Specifications.md).

## Application web de supervision d'un SmartDirectory

Un frontend web a été développé pour permettre de consulter les smartContracts et les déclarants enregistrés dans un 
SmartDirectory.
Le code source de cette application de supervision se trouve dans le dossier "front" de ce dépôt.

Un [README spécifique](/front/README.md) décrit les pré-requis, l'installation et l'interface utilisateur de 
l'application.