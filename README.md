
## Ce smart contract est-il légitime ?
[Documentation complète](SmartDirectory_Specifications.md)

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




