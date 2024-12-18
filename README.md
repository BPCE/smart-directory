

## Ce smart contract est-il légitime ?

Confronté à la prolifération des adresses, l'utilisateur à besoin de s'assurer de leur authenticité lorsqu'il s'apprete à effectuer une transaction d'importance qu'elle soit monétaire ou de confiance.

La solution que nous proposons: le "smart directory" est une liste blanche administrée.

Le smart directory est constitué de 2 listes:
- une liste d'adresses de fournisseurs de services sur la blockchain dite "liste des registrants"
- une liste d'adresses de smart contracts émis par ces fournisseurs dite "liste des references"

Le smart directory est lui meme un smart contract au sens d'une EVM Ethereum, le deployeur du smart directory designe les administrateurs (2 adresses possibles), possiblement lui-meme. Les administrateurs peuvent agir sur la liste des registrants: ajouter ou invalider un registrant.

Un registrant est un fournisseur de service qui obtient l'agrément aupres de l'administrateur. Un exemple d'utilisation par une administration publique serait l'enregistrement des adresses sur les chaines des PSAN par l'AMF. D'autres exemples sont donnés en fin de document.

Une fois le registrant (c'est à dire son adresse d'origine des deploiements) dans la liste, celui-ci peut commencer a:
- deployer les smart contracts correspondants aux services qu'il propose.
- enregistrer les adresses de ces smart contracts dans la liste des references.
Le registrant 


## Problématique : la multiplication des smartContracts

La vision autour des smartContracts a fortement évolué dans l’écosystème Blockchain, principalement Ethereum. Initialement ils étaient perçus comme des artefacts quasi-uniques dont l’utilisation est garantie par la connaissance de l’adresse du smartContract. Une telle sécurité d’utilisation nécessite que chaque utilisateur gère par ses propres moyens, la liste des adresses à laquelle il fait confiance.

Cette approche pose un réel souci dès lors que le nombre de smartContracts utilisés par chaque utilisateur augmente. Par ailleurs, ceci oblige à mettre l’adresse des smartContracts en dur dans le code d’autres smartContracts dès lors que certains processus nécessitent une vérification on-chain impliquant plusieurs smartContracts.

Depuis 2 à 3 ans,deux nouvelles orientations sont considérées comme inévitables : 
l’account abstraction, qui va permettre une meilleure interaction utilisateur (paiement de GAS par un tiers, protection contre la perte de clés privées),
la tokenisation de l’économie qui nécessite une représentation des actifs du monde réel sous forme de token fongibles ou non fongibles.

Ces deux orientations vont nécessiter : 
la création de smartContracts en grands nombres pour les actifs et les utilisateurs,
la création de smartContracts liés à la gestion des processus des actifs, en nombre guère plus restreint, avec un besoin de contrôles des smartContracts précédents dans toutes les étapes de leur propre exécution.

En synthèse, nous identifions les besoins génériques suivants : 
-  une facilité de déploiement de nouveaux smartContracts,
-  une capacité de contrôle de la validité de ces smartContracts par un utilisateur externe à la blockchain,
-  une capacité de contrôle de la validité de ces smartContracts par un autre smartContract,
-  une nécessité d’identifier des écosystèmes de smartContracts pour en faire une analyse,
-  une capacité de maintenir à jour ces écosystèmes.

## Le composant central de la solution proposée : le smartDirectory

Le smartDirectory est un smartContract qui va permettre de conserver de façon partagée sur la blockchain des  listes d’adresses, soit EOA soit smartContracts. Fonctionnellement, ces listes représentent les tables des matières des différents écosystèmes.

Une entité, **le déclarant **, munie d’un accès blockchain avec capacité de signature pourra écrire un ou plusieurs enregistrements dans le smartDirectory permettant la constitution de ces listes. Pour laisser de la  latitude aux utilisateurs, le fonctionnement du smartDirectory reste le plus basique possible avec principalement deux structures logiques : les référencements et les déclarants.
