var SmartDirectoryLib = artifacts.require("./SmartDirectoryLib.sol");
var SmartDirectory = artifacts.require("./SmartDirectory.sol");

module.exports = async function (deployer, network) {
    // Déployer la bibliothèque
    await deployer.deploy(SmartDirectoryLib);
    deployer.link(SmartDirectoryLib, SmartDirectory);

    // Déployer le contrat principal
    const parent1 = process.env.QAXH_ADDRESS;
    const parent2 = process.env.HAMZA_ADDRESS;
    const contractUri = "https://github.com/BPCE/smart-directory/wiki/Home-examples-smart-directory-administrator-page";
    const adminCode = 0; // 0 pour parentsAuthorized, 1 pour selfDeclaration

    console.log(`Déploiement en cours sur le réseau : ${network}`);
    await deployer.deploy(SmartDirectory, parent1, parent2, contractUri, adminCode);
    const smartDirectoryInstance = await SmartDirectory.deployed();

    console.log("SmartDirectory déployé à l'adresse :", smartDirectoryInstance.address);

    await smartDirectoryInstance.setActivationCode(1);

    // Ajouter des registrants
    const registrant1 = parent1; 
    const registrant2 = parent2; 

    try {
        console.log("Ajout des registrants...");
        await smartDirectoryInstance.createRegistrant(registrant1, { from: parent1 });
        console.log(`Registrant ajouté : ${registrant1}`);
        
        await smartDirectoryInstance.createRegistrant(registrant2, { from: parent1 });
        console.log(`Registrant ajouté : ${registrant2}`);
    } catch (error) {
        console.error("Erreur lors de l'ajout des registrants :", error);
    }

    try {
        await smartDirectoryInstance.updateRegistrantUri("https://github.com/BPCE/smart-directory/wiki/Fournisseur%E2%80%90de%E2%80%90service%E2%80%90de%E2%80%90confiance%E2%80%901", { from: registrant1 });
        await smartDirectoryInstance.updateRegistrantUri("https://github.com/BPCE/smart-directory/wiki/Fournisseur%E2%80%90de%E2%80%90service%E2%80%90de%E2%80%90confiance%E2%80%902", { from: registrant2 });
        console.log("URI des registrants mise à jour");
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'URI des registrants :", error);
    }

    // Ajouter des références pour chaque registrant
    console.log("Ajout des références pour les registrants...");
    const reference1 = "0x10d9cE25AA88673c7ff6243eE5555E22f96165B3";
    const reference2 = "0x7D06eB0F5A3122cBD5283Ab18ddaBebE0B5537d1";

    try {
        await smartDirectoryInstance.createReference(
            reference1,          // Adresse de la référence
            "Service1",          // ID du projet
            "Type1",             // Type de la référence
            "Version1.0",        // Version de la référence
            "INIT",              // Statut initial
            { from: registrant1 } // Transaction depuis le registrant 1
        );
        console.log("Référence ajoutée pour le registrant 1 avec statut INIT");
    } catch (error) {
        console.error("Erreur lors de l'ajout de la référence pour le registrant 1 :", error);
    }

    try {
        await smartDirectoryInstance.createReference(
            reference2,
            "Lock&gain",
            "Type2",
            "Version1.0",
            "INIT",
            { from: registrant2 }
        );
        console.log("Référence ajoutée pour le registrant 2 avec statut INIT");
    } catch (error) {
        console.error("Erreur lors de l'ajout de la référence pour le registrant 2 :", error);
    }

    // Mettre à jour les statuts des références
    console.log("Mise à jour des statuts des références...");
    await smartDirectoryInstance.updateReferenceStatus(
        reference1,
        "IN USE",             
        { from: registrant1 } 
    );
    console.log(`Statut de la référence ${reference1} mis à jour à IN USE`);

    await smartDirectoryInstance.updateReferenceStatus(
        reference2,
        "IN USE",
        { from: registrant2 }
    );
    console.log(`Statut de la référence ${reference2} mis à jour à IN USE`);

    // Ajouter un statut final
    await smartDirectoryInstance.updateReferenceStatus(
        reference1,
        "DEPRECATED",
        { from: registrant1 }
    );
    console.log(`Statut de la référence ${reference1} mis à jour à DEPRECATED`);

    // Vérifier les statuts actuels
    console.log("Récupération des statuts actuels des références...");
    const status1 = await smartDirectoryInstance.getReferenceStatus(reference1);
    console.log(`Statut actuel de la référence ${reference1}: ${JSON.stringify(status1)}`);

    const status2 = await smartDirectoryInstance.getReferenceStatus(reference2);
    console.log(`Statut actuel de la référence ${reference2}: ${JSON.stringify(status2)}`);
};
