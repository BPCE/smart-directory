const SmartDirectory = artifacts.require("SmartDirectory");
const SmartDirectoryLib = artifacts.require("SmartDirectoryLib");

const Activation = { pending: 0, active: 1, closed: 2 };
const Admin = { parentsAuthorized: 0, selfDeclaration: 1 };

const CONTRACT_URI = "https://www.contract-uri.com";
const REFERANT_URI = "https://www.referant-uri.com";
const PROJECT_ID_1 = "id-1";
const PROJECT_ID_2 = "id-2";
const REFERENCE_TYPE = "ERC20";
const REFERENCE_VERSION = "v1.0.0";
const REFERENCE_STATUS = "active";
const NEW_REFERENCE_STATUS = "paused";

async function expectRevert(promise, expectedMessage) {
  try {
    await promise;
    assert.fail("Expected revert not received");
  } catch (error) {
    assert(
      error.message.includes(expectedMessage),
      `Expected revert including "${expectedMessage}" but got "${error.message}"`
    );
  }
}

async function getTimestamp(txOrReceipt) {
  const receipt = txOrReceipt.receipt ? txOrReceipt.receipt : txOrReceipt;
  const block = await web3.eth.getBlock(receipt.blockNumber);
  return Number(block.timestamp);
}

contract("SmartDirectory", (accounts) => {
  const [parent1, parent2, user1, user2, referenceAddress1, referenceAddress2] =
    accounts;

  let privateSmartDirectory;
  let publicSmartDirectory;
  let lib;

  const activateDirectory = (instance, from) =>
    instance.setActivationCode(Activation.active, { from });

  before(async () => {
    lib = await SmartDirectoryLib.new();
    await SmartDirectory.detectNetwork();
    await SmartDirectory.link("SmartDirectoryLib", lib.address);
  });

  beforeEach(async () => {
    privateSmartDirectory = await SmartDirectory.new(
      parent1,
      parent2,
      CONTRACT_URI,
      Admin.parentsAuthorized,
      { from: parent1 }
    );
    publicSmartDirectory = await SmartDirectory.new(
      parent1,
      parent2,
      CONTRACT_URI,
      Admin.selfDeclaration,
      { from: parent1 }
    );
  });

  describe("constructor", () => {
    it("parent1 must not be address 0", async () => {
      await expectRevert(
        SmartDirectory.new(
          "0x0000000000000000000000000000000000000000",
          parent2,
          CONTRACT_URI,
          Admin.parentsAuthorized,
          { from: parent1 }
        ),
        "Parent1 must not be address 0"
      );
    });

    it("parent2 must not be address 0", async () => {
      await expectRevert(
        SmartDirectory.new(
          parent1,
          "0x0000000000000000000000000000000000000000",
          CONTRACT_URI,
          Admin.parentsAuthorized,
          { from: parent1 }
        ),
        "Parent2 must not be address 0"
      );
    });

    it("parents must be different", async () => {
      await expectRevert(
        SmartDirectory.new(
          parent1,
          parent1,
          CONTRACT_URI,
          Admin.parentsAuthorized,
          { from: parent1 }
        ),
        "Parent1 and Parent2 must be different addresses"
      );
    });

    it("admin code must be < 2", async () => {
      await expectRevert(
        SmartDirectory.new(parent1, parent2, CONTRACT_URI, 2, {
          from: parent1,
        }),
        "adminCode value too large"
      );
    });

    it("deploys correctly", async () => {
      const instance = await SmartDirectory.new(
        parent1,
        parent2,
        CONTRACT_URI,
        Admin.parentsAuthorized,
        { from: parent1 }
      );

      const receipt = await web3.eth.getTransactionReceipt(
        instance.transactionHash
      );
      const topic = web3.utils.keccak256(
        "SmartDirectoryCreated(address,address,uint256)"
      );
      const event = receipt.logs.find((log) => log.topics[0] === topic);
      assert.ok(event, "SmartDirectoryCreated not emitted");

      assert.equal(await instance.version(), "SD 1.09SDL 1.17");
      assert.equal((await instance.getContractType()).toString(), "42");

      assert.equal(await instance.getParent1(), parent1);
      assert.equal(await instance.getParent2(), parent2);
      assert.equal(await instance.getContractUri(), CONTRACT_URI);

      assert.equal(
        (await instance.getActivationCode()).toNumber(),
        Activation.pending
      );
      assert.equal(
        (await instance.getAdminCode()).toNumber(),
        Admin.parentsAuthorized
      );
    });
  });

  describe("activation code", () => {
    it("only parents can modify activation code", async () => {
      await expectRevert(
        privateSmartDirectory.setActivationCode(Activation.active, {
          from: user1,
        }),
        "unauthorized access: only a parent may call this function"
      );
    });

    it("cannot modify activation code when closed", async () => {
      await privateSmartDirectory.setActivationCode(Activation.closed, {
        from: parent1,
      });
      await expectRevert(
        privateSmartDirectory.setActivationCode(Activation.active, {
          from: parent1,
        }),
        "SmartDirectory activation code cannot be modified"
      );
    });

    it("cannot set activation code to pending", async () => {
      await expectRevert(
        privateSmartDirectory.setActivationCode(Activation.pending, {
          from: parent1,
        }),
        "invalid activation value"
      );
    });

    it("pending to active emits event", async () => {
      const tx = await privateSmartDirectory.setActivationCode(
        Activation.active,
        { from: parent1 }
      );
      const event = tx.receipt.logs.find(
        (log) => log.event === "SmartDirectoryActivationUpdated"
      );
      assert.ok(event, "SmartDirectoryActivationUpdated not emitted");
      assert.equal(event.args.from, parent1);
      assert.equal(event.args.activationCode.toNumber(), Activation.active);
    });

    it("pending to closed emits event", async () => {
      const tx = await privateSmartDirectory.setActivationCode(
        Activation.closed,
        { from: parent1 }
      );
      const event = tx.receipt.logs.find(
        (log) => log.event === "SmartDirectoryActivationUpdated"
      );
      assert.ok(event, "SmartDirectoryActivationUpdated not emitted");
      assert.equal(event.args.activationCode.toNumber(), Activation.closed);
    });

    it("active to closed emits event", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      const tx = await privateSmartDirectory.setActivationCode(
        Activation.closed,
        { from: parent1 }
      );
      const event = tx.receipt.logs.find(
        (log) => log.event === "SmartDirectoryActivationUpdated"
      );
      assert.ok(event, "SmartDirectoryActivationUpdated not emitted");
      assert.equal(event.args.activationCode.toNumber(), Activation.closed);
    });
  });

  describe("create registrant", () => {
    it("must be a parent to create a registrant", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await expectRevert(
        privateSmartDirectory.createRegistrant(user1, { from: user1 }),
        "unauthorized access: only a parent may call this function"
      );
    });

    it("smartDirectory must be active", async () => {
      await expectRevert(
        privateSmartDirectory.createRegistrant(user1, { from: parent1 }),
        "SmartDirectory is not active"
      );
    });

    it("must be parentsAuthorized mode to create manually", async () => {
      await activateDirectory(publicSmartDirectory, parent1);
      await expectRevert(
        publicSmartDirectory.createRegistrant(user1, { from: parent1 }),
        "in selfDeclaration mode, just create a reference, registrant will be create from msg.sender"
      );
    });

    it("new registrant must be unknown", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.createRegistrant(user1, { from: parent1 }),
        "registrant already known"
      );
    });

    it("create registrant stores data", async () => {
      const tx = await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      const registrantIndex = await privateSmartDirectory.getRegistrantIndex(
        user1
      );
      const registrantData = await privateSmartDirectory.getRegistrantAtIndex(
        registrantIndex
      );
      const uri = await privateSmartDirectory.getRegistrantUri(user1);
      const referencesCount =
        await privateSmartDirectory.getRegistrantReferencesCount(user1);
      const lastIndex = await privateSmartDirectory.getRegistrantLastIndex();
      const valid = await privateSmartDirectory.isValidRegistrant(user1);
      const notValid = await privateSmartDirectory.isValidRegistrant(user2);

      assert.equal(registrantIndex.toNumber(), 1);
      assert.equal(registrantData.registrantAddress, user1);
      assert.equal(registrantData.registrantUri, "");
      assert.equal(uri, "");
      assert.equal(referencesCount.toNumber(), 0);
      assert.equal(lastIndex.toNumber(), 1);
      assert.equal(valid, true);
      assert.equal(notValid, false);
    });
  });

  describe("update registrant", () => {
    it("must be active to update registrant uri", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.setActivationCode(Activation.closed, {
        from: parent1,
      });

      await expectRevert(
        privateSmartDirectory.updateRegistrantUri(REFERANT_URI, {
          from: user1,
        }),
        "SmartDirectory is not active"
      );
    });

    it("only registrant can modify uri", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.updateRegistrantUri(REFERANT_URI, {
          from: user2,
        }),
        "unknown registrant"
      );
    });

    it("update registrant uri is ok", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      const tx = await privateSmartDirectory.updateRegistrantUri(REFERANT_URI, {
        from: user1,
      });
      const event = tx.receipt.logs.find(
        (log) => log.event === "RegistrantUriUpdated"
      );
      assert.ok(event, "RegistrantUriUpdated not emitted");
      assert.equal(event.args.registrant, user1);
      assert.equal(
        event.args.registrantUri,
        web3.utils.keccak256(REFERANT_URI),
        "indexed uri hash mismatch"
      );

      const registrant = await privateSmartDirectory.getRegistrantAtIndex(1);
      assert.equal(registrant.registrantAddress, user1);
      assert.equal(registrant.registrantUri, REFERANT_URI);
    });
  });

  describe("disable registrant", () => {
    it("must be a parent", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.disableRegistrant(user1, { from: user2 }),
        "unauthorized access: only a parent may call this function"
      );
    });

    it("smartDirectory must be active", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.setActivationCode(Activation.closed, {
        from: parent1,
      });
      await expectRevert(
        privateSmartDirectory.disableRegistrant(user1, { from: parent1 }),
        "SmartDirectory is not active"
      );
    });

    it("must be parentsAuthorized mode", async () => {
      await activateDirectory(publicSmartDirectory, parent1);
      await publicSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      await expectRevert(
        publicSmartDirectory.disableRegistrant(user1, { from: parent1 }),
        "SmartDirectory must be in parentsAuthorized mode"
      );
    });

    it("cannot disable unknown registrant", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await expectRevert(
        privateSmartDirectory.disableRegistrant(user1, { from: parent1 }),
        "Registrant not found or disabled"
      );
    });

    it("cannot disable disabled registrant", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.disableRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.disableRegistrant(user1, { from: parent1 }),
        "Registrant not found or disabled"
      );
    });

    it("disable registrant clears index", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      const tx = await privateSmartDirectory.disableRegistrant(user1, {
        from: parent1,
      });
      const event = tx.receipt.logs.find(
        (log) => log.event === "RegistrantDisabled"
      );
      assert.ok(event, "RegistrantDisabled not emitted");
      assert.equal(event.args.registrant, user1);

      await expectRevert(
        privateSmartDirectory.getRegistrantAtIndex(1),
        "unknown registrant"
      );
      const index = await privateSmartDirectory.getRegistrantIndex(user1);
      assert.equal(index.toNumber(), 0);
    });

    it("getDisabledRegistrants returns disabled registrants", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createRegistrant(user2, { from: parent1 });
      await privateSmartDirectory.disableRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.disableRegistrant(user2, { from: parent1 });

      const disabled = await privateSmartDirectory.getDisabledRegistrants();
      assert.equal(disabled.length, 2);
      assert.equal(disabled[0], user1);
      assert.equal(disabled[1], user2);
    });
  });

  describe("create reference (parentsAuthorized)", () => {
    it("unknown registrant cannot create reference", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await expectRevert(
        privateSmartDirectory.createReference(
          referenceAddress1,
          PROJECT_ID_1,
          REFERENCE_TYPE,
          REFERENCE_VERSION,
          REFERENCE_STATUS,
          { from: user1 }
        ),
        "unknown or disabled registrant"
      );
    });

    it("disabled registrant cannot create reference", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.disableRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.createReference(
          referenceAddress1,
          PROJECT_ID_1,
          REFERENCE_TYPE,
          REFERENCE_VERSION,
          REFERENCE_STATUS,
          { from: user1 }
        ),
        "unknown or disabled registrant"
      );
    });
  });

  describe("create reference (selfDeclaration)", () => {
    it("self declaration flow creates registrant and reference", async () => {
      await activateDirectory(publicSmartDirectory, parent1);
      const tx1 = await publicSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      const t1 = await getTimestamp(tx1);

      const registrantIndex = await publicSmartDirectory.getRegistrantIndex(
        user1
      );
      const registrant = await publicSmartDirectory.getRegistrantAtIndex(
        registrantIndex
      );
      const reference = await publicSmartDirectory.getReference(
        referenceAddress1
      );

      assert.equal(registrant.registrantAddress, user1);
      assert.equal(registrant.registrantUri, "");

      assert.equal(reference.registrantAddress, user1);
      assert.equal(reference.registrantIndex.toNumber(), 1);
      assert.equal(reference.referenceAddress, referenceAddress1);
      assert.equal(reference.projectId, PROJECT_ID_1);
      assert.equal(reference.referenceType, REFERENCE_TYPE);
      assert.equal(reference.referenceVersion, REFERENCE_VERSION);
      assert.equal(reference.status, REFERENCE_STATUS);
      assert.equal(reference.timeStamp.toNumber(), t1);

      const tx2 = await publicSmartDirectory.createReference(
        referenceAddress2,
        PROJECT_ID_2,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      const lists = await publicSmartDirectory.getReferencesLists(user1);
      assert.equal(lists.referenceAddresses.length, 2);
      assert.equal(lists.projectIds.length, 2);
      assert.deepEqual(lists.referenceAddresses, [
        referenceAddress1,
        referenceAddress2,
      ]);
      assert.deepEqual(lists.projectIds, [PROJECT_ID_1, PROJECT_ID_2]);
    });
  });

  describe("create reference", () => {
    it("reference address cannot be zero", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.createReference(
          "0x0000000000000000000000000000000000000000",
          PROJECT_ID_1,
          REFERENCE_TYPE,
          REFERENCE_VERSION,
          REFERENCE_STATUS,
          { from: user1 }
        ),
        "reference must not be address 0"
      );
    });

    it("new reference must be unknown", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      await expectRevert(
        privateSmartDirectory.createReference(
          referenceAddress1,
          PROJECT_ID_1,
          REFERENCE_TYPE,
          REFERENCE_VERSION,
          REFERENCE_STATUS,
          { from: user1 }
        ),
        "reference already known"
      );
    });

    it("create reference stores data", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });

      const tx = await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      const creationTime = await getTimestamp(tx);
      const event = tx.receipt.logs.find(
        (log) => log.event === "ReferenceCreated"
      );
      assert.ok(event, "ReferenceCreated not emitted");
      assert.equal(event.args.registrant, user1);
      assert.equal(event.args.referenceAddress, referenceAddress1);

      const reference = await privateSmartDirectory.getReference(
        referenceAddress1
      );
      const lastStatusIndex =
        await privateSmartDirectory.getReferenceLastStatusIndex(
          referenceAddress1
        );
      const statusAt1 = await privateSmartDirectory.getReferenceStatusAtIndex(
        referenceAddress1,
        1
      );
      const statusLatest = await privateSmartDirectory.getReferenceStatus(
        referenceAddress1
      );
      const lists = await privateSmartDirectory.getReferencesLists(user1);

      assert.equal(reference.registrantAddress, user1);
      assert.equal(reference.registrantIndex.toNumber(), 1);
      assert.equal(reference.referenceAddress, referenceAddress1);
      assert.equal(reference.projectId, PROJECT_ID_1);
      assert.equal(reference.referenceType, REFERENCE_TYPE);
      assert.equal(reference.referenceVersion, REFERENCE_VERSION);
      assert.equal(reference.status, REFERENCE_STATUS);
      assert.equal(reference.timeStamp.toNumber(), creationTime);

      assert.equal(lastStatusIndex.toNumber(), 1);
      assert.equal(statusAt1.status, REFERENCE_STATUS);
      assert.equal(statusAt1.timeStamp.toNumber(), creationTime);
      assert.equal(statusLatest.status, REFERENCE_STATUS);
      assert.equal(statusLatest.timeStamp.toNumber(), creationTime);

      assert.equal(lists.referenceAddresses.length, 1);
      assert.equal(lists.projectIds.length, 1);
      assert.equal(lists.referenceAddresses[0], referenceAddress1);
      assert.equal(lists.projectIds[0], PROJECT_ID_1);
    });
  });

  describe("update reference", () => {
    it("smartDirectory must be active to update reference status", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      await privateSmartDirectory.setActivationCode(Activation.closed, {
        from: parent1,
      });
      await expectRevert(
        privateSmartDirectory.updateReferenceStatus(
          referenceAddress1,
          NEW_REFERENCE_STATUS,
          { from: user1 }
        ),
        "SmartDirectory is not active"
      );
    });

    it("must be a known registrant to update reference status", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      await expectRevert(
        privateSmartDirectory.updateReferenceStatus(
          referenceAddress1,
          NEW_REFERENCE_STATUS,
          { from: user2 }
        ),
        "unknown or disabled registrant"
      );
    });

    it("must be a valid registrant to update reference status", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      await privateSmartDirectory.disableRegistrant(user1, { from: parent1 });
      await expectRevert(
        privateSmartDirectory.updateReferenceStatus(
          referenceAddress1,
          NEW_REFERENCE_STATUS,
          { from: user1 }
        ),
        "unknown or disabled registrant"
      );
    });

    it("reference must exist to update status", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      await expectRevert(
        privateSmartDirectory.updateReferenceStatus(
          referenceAddress2,
          NEW_REFERENCE_STATUS,
          { from: user1 }
        ),
        "unknown reference"
      );
    });

    it("only reference owner or parents can update status", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(parent1, { from: parent1 });
      await privateSmartDirectory.createRegistrant(parent2, { from: parent1 });
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      await privateSmartDirectory.createRegistrant(user2, { from: parent1 });

      await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );

      await expectRevert(
        privateSmartDirectory.updateReferenceStatus(
          referenceAddress1,
          NEW_REFERENCE_STATUS,
          { from: user2 }
        ),
        "Unauthorized access: only reference owner or parents can call this function"
      );

      await privateSmartDirectory.updateReferenceStatus(
        referenceAddress1,
        NEW_REFERENCE_STATUS,
        { from: user1 }
      );
      await privateSmartDirectory.updateReferenceStatus(
        referenceAddress1,
        NEW_REFERENCE_STATUS,
        { from: parent1 }
      );
      await privateSmartDirectory.updateReferenceStatus(
        referenceAddress1,
        NEW_REFERENCE_STATUS,
        { from: parent2 }
      );
    });

    it("update reference status stores history", async () => {
      await activateDirectory(privateSmartDirectory, parent1);
      await privateSmartDirectory.createRegistrant(user1, { from: parent1 });
      const createTx = await privateSmartDirectory.createReference(
        referenceAddress1,
        PROJECT_ID_1,
        REFERENCE_TYPE,
        REFERENCE_VERSION,
        REFERENCE_STATUS,
        { from: user1 }
      );
      const createTime = await getTimestamp(createTx);

      const updateTx1 = await privateSmartDirectory.updateReferenceStatus(
        referenceAddress1,
        NEW_REFERENCE_STATUS,
        { from: user1 }
      );
      const updateTime1 = await getTimestamp(updateTx1);

      const updateTx2 = await privateSmartDirectory.updateReferenceStatus(
        referenceAddress1,
        REFERENCE_STATUS,
        { from: user1 }
      );
      const updateTime2 = await getTimestamp(updateTx2);

      const event = updateTx1.receipt.logs.find(
        (log) => log.event === "ReferenceStatusUpdated"
      );
      assert.ok(event, "ReferenceStatusUpdated not emitted");
      assert.equal(event.args.registrant, user1);
      assert.equal(event.args.referenceAddress, referenceAddress1);

      const reference = await privateSmartDirectory.getReference(
        referenceAddress1
      );
      const lastStatusIndex =
        await privateSmartDirectory.getReferenceLastStatusIndex(
          referenceAddress1
        );
      const statusAt1 = await privateSmartDirectory.getReferenceStatusAtIndex(
        referenceAddress1,
        1
      );
      const statusLatest = await privateSmartDirectory.getReferenceStatus(
        referenceAddress1
      );
      const lists = await privateSmartDirectory.getReferencesLists(user1);

      assert.equal(reference.registrantAddress, user1);
      assert.equal(reference.registrantIndex.toNumber(), 1);
      assert.equal(reference.referenceAddress, referenceAddress1);
      assert.equal(reference.projectId, PROJECT_ID_1);
      assert.equal(reference.referenceType, REFERENCE_TYPE);
      assert.equal(reference.referenceVersion, REFERENCE_VERSION);
      assert.equal(reference.status, REFERENCE_STATUS);
      assert.equal(reference.timeStamp.toNumber(), updateTime2);

      assert.equal(lastStatusIndex.toNumber(), 3);
      assert.equal(statusAt1.status, REFERENCE_STATUS);
      assert.equal(statusAt1.timeStamp.toNumber(), createTime);
      assert.equal(statusLatest.status, REFERENCE_STATUS);
      assert.equal(statusLatest.timeStamp.toNumber(), updateTime2);

      assert.equal(lists.referenceAddresses.length, 1);
      assert.equal(lists.projectIds.length, 1);
      assert.equal(lists.referenceAddresses[0], referenceAddress1);
      assert.equal(lists.projectIds[0], PROJECT_ID_1);
    });
  });
});
