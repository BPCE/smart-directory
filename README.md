
## Ce smart contract est-il légitime ?

Confronté à la prolifération des adresses, l'utilisateur à besoin de s'assurer de leur authenticité lorsqu'il s'apprete à effectuer une transaction d'importance qu'elle soit monétaire ou de confiance.

La solution que nous proposons: le "smart directory" est une liste blanche administrée.

Le smart directory est constitué de 2 listes:
- une liste d'adresses de fournisseurs de services sur la blockchain dite "liste des registrants"
- une liste d'adresses de smart contracts émis par ces fournisseurs dite "liste des references"

Le smart directory est lui meme un smart contract au sens d'une EVM Ethereum, le deployeur du smart directory designe les administrateurs (2 adresses possibles), possiblement lui-meme. Les administrateurs peuvent agir sur la liste des registrants: ajouter ou invalider un registrant.

Un registrant est un fournisseur de service qui obtient l'agrément aupres de l'administrateur. Un exemple d'utilisation par une administration publique serait l'enregistrement des adresses sur des PSAN par l'AMF. D'autres exemples sont donnés en fin de document.

Une fois que le registrant (c'est à dire son adresse d'origine des deploiements) est présent dans la liste, celui-ci peut commencer à:
- deployer les smart contracts correspondants aux services qu'il propose.
- enregistrer les adresses de ces smart contracts dans la liste des references.
Le registrant renseigne aussi son URL (seul lui peut le faire), celle ci-sera consultable par les clients et leur permettra de consulter les termes du service et de s'enregister (signer le contrat de service à distance, etc ...)
Lorsque le service est très simple, par exemple achat/échange/création de NFT, l'URL permet au client d'identifier le service et la certification implicite donnée par l'autorité administrative.


Les listes du smartDirectory étant sur la blockchain, elles sont consultables par le code des smart contracts qui peuvent effectuer des controles supplementaires. Un possibilité d'utilisation est d'enregistrer dans la liste des references une liste blanche des EOA ou contrats autorisés à déposer ou recevoir des tokens ou des ethers. Un emetteur comme Circle pourrait emettre des stable coins reservés à des institutionnels et enregistrerait les adresses des institutionnels dans la liste des references, les smart contracts d'echange pourraient alors verifier que l'institutionnel est bien autorisé à envoyer des tokens et que le receveur est bien autorisé à les recevoir.





