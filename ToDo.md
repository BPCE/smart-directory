@José, @Cyril => J'ai fait une nouvelle version de la SmartDirectoryLib : 1.17 avec quelques améliorations (nouveaux modifiers, simplification de code).
A redéployer donc. Je l'ai testée (cf. ci-dessous) mais pas les smartTokens.


**SmartDirectoryLib : passage à la version 1.17**

    @Cyril => Possible évolution future (hors périmètre de la livraison du 01/01) : ajouter une possibilité de réactiver un registrant, si nécessaire ?

    Tests effectués avec remix :
        - mode permissioné OK
        - mode permissionless OK
    Makefile utilisé pour générer les interfaces java
    Qaxh_ETH 889 compile sans erreur sur cette version de la librairie (J'ai adapté smartTokenERC20AGetType, cf. ci-dessous).J'ai fait la demande de merge et Qaxh_ETH 889 est disponible sur le drive pour Cyril

**SmartDirectory.sol :**

    RAS, pas de changements. On reste en v 1.09

**ISmartDirectory.sol**

    RAS, pas de changements.

**SmartToken721.sol : passage à la version "DT721_1.02"**

    -> Ajout de 2 fonctions basiques :

        function mint(address to) public activeRegistrant {}

        function transfer(
                address from,
                address to,
                uint256 tokenId
            ) public activeRegistrant {}

    -> Les tests restent à faire

**ISmartToken721.sol : mise à jour pour déclarer les 2 fonctions "mint" et "transfer"**

**SmartTokenERC20A.sol : passage à la version "DTERC20A_1.02"**

    J'ai transformé la constante TYPE en variables uint8 "tokenType" pour choisir au déploiement si on est en ERC20 ou ERC20A.

    -> tokenType = 21, le token déployé est alors un ERC20 classique qui ne peut pas avoir de balance négative.
        Si ce TYPE est choisi à l'initialisation alors les adresses _parent1 et _parent2 sont créditées chacunes
        d'1000000 de tokens.
        Les balances négatives sont interdites dans _transfer et _mint.
    -> tokenType = 22, le token déployé est alors un ERC20A comptable et peut avoir des balances négatives.
        Si ce TYPE est choisi à l'initialisation alors les adresses _parent1 et _parent2 n'ont pas besoin de se voir
        créditer des tokens.
    -> Les tests restent à faire

**ISmartTokenERC20.sol**

    RAS, pas de changements.

**ISmartTokenERC20Metadata.sol**

    RAS, pas de changements.
