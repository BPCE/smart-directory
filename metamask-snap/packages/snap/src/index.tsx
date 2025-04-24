import { OnTransactionHandler, OnHomePageHandler, OnUserInputHandler, UserInputEventType, OnInstallHandler } from '@metamask/snaps-sdk';
import { Box, Heading, Text, Bold, Section, Form, Field, Input, Button, Option, Dropdown } from '@metamask/snaps-sdk/jsx';
import { Chain, createPublicClient, http } from 'viem';
import { polygonAmoy, holesky, sepolia } from 'viem/chains';
import { abi } from './abi';


const chainArray = [polygonAmoy, holesky, sepolia];

const smartDirectoryConfig: [number, Chain, string, `0x${string}`][] = [
  [
    polygonAmoy.id,
    polygonAmoy,
    'https://polygon-amoy.drpc.org',
    '0x88CBa1e32db10CE775210C80A39F407EAA982E0D',
  ],
  [
    holesky.id,
    holesky,
    'https://holesky.drpc.org',
    '0x6CC5Aa35253fA17064Af37cB6DD56692f7ee68F6',
  ],
];

//vérifier si l'adresse commence par 0x
const sanitizeAddress = (address: string): `0x${string}` => {
  return address.startsWith('0x') ? address as `0x${string}` : `0x${address}` as `0x${string}`;
};


const createCustomClient = async (chainId: number) => {
  // Récupérer la chaîne à partir de chainArray, et non pas de la config stockée
  const chainObject = chainArray.find((chain) => chain.id === chainId);
  if (!chainObject) {
    throw new Error(`Chain with id ${chainId} not found`);
  }
  try {
    return createPublicClient({
      chain: chainObject,
      transport: http(chainObject.rpcUrls.default.http[0]),
    });
  } catch (error) {
    return String(error);
  }
};


const getFromMemorySmartDirectoryConfig = async () => {
  const state =
    (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get', encrypted: false },
    })) || {};
  return state.smartDirectoryConfig;
};

const getFromMemorySDConfigJSON = async () => {
  const state = await getFromMemorySmartDirectoryConfig();
  if (!state) {
    return [];
  }
  const smartDirectoryConfig = JSON.parse(state as string);
  return smartDirectoryConfig.map(([chainId, chainObject, rpcUrl, smDirAddress]: [number, Chain, string, `0x${string}`]) => ({
    chainId,
    chainName: chainObject.name,
    rpcUrl,
    smDirAddress,
  }));
};

const addToMemorySmartDirectoryConfig = async (newConfig: [number, Chain, string, `0x${string}`]) => {
  const currentState = await getFromMemorySmartDirectoryConfig();
  const smartDirectoryConfig = currentState ? JSON.parse(currentState as unknown as string) : [];
  smartDirectoryConfig.push(newConfig);
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { smartDirectoryConfig: JSON.stringify(smartDirectoryConfig) },
      encrypted: false,
    },
  });
  const afterState = await getFromMemorySmartDirectoryConfig();
  return afterState;
};

const removeFromMemorySmartDirectoryConfig = async (index: number) => {
  const state =
    (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get', encrypted: false },
    })) || {};
  if (!state.smartDirectoryConfig) {
    return;
  }
  const smartDirectoryConfig = JSON.parse(state.smartDirectoryConfig as string);
  smartDirectoryConfig.splice(index, 1);
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { ...state, smartDirectoryConfig: JSON.stringify(smartDirectoryConfig) },
      encrypted: false,
    },
  });
};

// ──────────────────────────────────────────────
// FONCTIONS DE LECTURE DE CONTRAT
// ──────────────────────────────────────────────

const getReferenceLastStatus = async (
  SMDirAddress: `0x${string}`,
  referenceAddress: `0x${string}`,
  customClient: any,
) => {
  const client = customClient;
  let referenceStatus: string | null = null;
  try {
    const ReferenceStatuslastIndex = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getReferenceLastStatusIndex',
      args: [referenceAddress],
    });

    const referenceStatusResult = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getReferenceStatusAtIndex',
      args: [referenceAddress, ReferenceStatuslastIndex],
    });
    referenceStatus = referenceStatusResult[0];
  } catch (error) {
    console.error(error);
    referenceStatus = null;
  }
  console.log(referenceStatus);
  return referenceStatus;
};

const getRegistrantUri = async (
  SMDirAddress: `0x${string}`,
  referenceAddress: `0x${string}`,
  customClient: any,
) => {
  const client = customClient;
  let registrantAddress: `0x${string}` | null = null;
  try {
    const registrantUriResult = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getReference',
      args: [referenceAddress],
    });
    registrantAddress = (registrantUriResult[0] as `0x${string}`) ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }

  let registrantUri: string | null = null;
  try {
    const registrantUriResult = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getRegistrantUri',
      args: [registrantAddress!],
    });
    registrantUri = registrantUriResult ?? null;
  } catch (error) {
    console.error(error);
    registrantUri = String(error);
  }
  console.log(registrantUri);
  return registrantUri;
};

const getSmDirUri = async (
  SMDirAddress: `0x${string}`,
  customClient: any,
) => {
  try {
    const contractURI = await customClient.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getContractUri',
    });
    // Si le résultat est vide, on renvoie null
    if (!contractURI || contractURI === '0x') {
      return "null";
    }
    return contractURI;
  } catch (error) {
    console.error("Erreur lors de la lecture de l'URI du contrat :", error);
    return null;
  }
};

// ──────────────────────────────────────────────
// FONCTIONS AUTRES
// ──────────────────────────────────────────────

//fonction pour récupérer le title d'une url donnée
const getTitle = async (url: string) => {
  try {
    console.log('Fetching title for:', url);
    const response = await fetch(url);
    const text = await response.text();
    const title = text.match(/<title>(.*?)<\/title>/);
    return title ? title[1] : 'No title found';
  } catch (error) {
    console.error('Error fetching title:', error);
    return JSON.stringify(error);
  }
};
// ──────────────────────────────────────────────
// HANDLERS
// ──────────────────────────────────────────────

// Gestionnaire des transactions sortantes.
export const onTransaction: OnTransactionHandler = async ({ transaction, chainId }) => {

  // Correction de la recherche de SMdirAddress
  const SMdirAddress = smartDirectoryConfig.find(
    ([configId]) => configId = (chainId as unknown as number)
  )?.[3] as `0x${string}`;

  const customClient = await createCustomClient(chainId as unknown as number);
  const referenceInfo = await getReferenceLastStatus(
    SMdirAddress,
    transaction.to as `0x${string}`,
    customClient,
  );
  const registrantUri = await getRegistrantUri(
    SMdirAddress,
    transaction.to as `0x${string}`,
    customClient,
  );

  // Récupérer l'état actuel (ou un objet vide si inexistant)
  const state = getFromMemorySmartDirectoryConfig

  // ──────────────────────────────────────────────
  // AFFICHAGE DU CONTENU : inclusion du tableau smartDirectoryConfig stocké
  // ──────────────────────────────────────────────
  return {
    content: (
      <Box>
        <Heading>
          {referenceInfo !== null
            ? '✅🔐'
            : '⛔️⛔️⛔️ Unknown Smartcontract ⛔️⛔️⛔️'}
        </Heading>
        <Text>
          You are interacting with{' '}
          <Bold>{transaction.to as `0x${string}`}</Bold>{' '}
          {referenceInfo
            ? 'which is part of the SmartDirectory.'
            : 'which is not part of the smartdirectory.'}
        </Text>
        <Text>
          {referenceInfo !== null
            ? 'The reference status is: ' + JSON.stringify(referenceInfo)
            : ''}
        </Text>
        <Text>
          {registrantUri !== null
            ? 'The registrant URI is: ' + registrantUri
            : ''}
        </Text>
        <Heading>Smart Directory Configuration</Heading>
        {/* Affichage de chaque élément stocké */}
        {typeof state === 'string' && JSON.parse(state).map((entry: any, index: number) => (
          <Text key={`config-${index}`}>{JSON.stringify(entry)}</Text>
        ))}
      </Box>
    ),
  };
};


export const onHomePage: OnHomePageHandler = async () => {
  const smartDirectoryConfig = await getFromMemorySDConfigJSON();
  return {
    content: (
      <Box>
        <Heading>Smart Directory Configuration</Heading>
        <Section>
          <Heading>adding a new SMdir :</Heading>
          <Form name="form-to-fill">
          <Field label="Smart Directory Address">
              <Input name="smartDirectoryAddress" placeholder="Enter your SMdir address" />
            </Field>
            <Text>In chain :</Text>
            <Dropdown name="chainid">
              {chainArray.map((chain, index) => (
                <Option key={`chain-${index}`} value={chain.id.toString()}>
                  {chain.name}
                </Option>
              ))}
            </Dropdown>
            <Button type="submit">Add</Button>
          </Form>
        </Section>
        <Heading>Smart Directory Configuration</Heading>
        {/* Affichage de chaque élément stocké */}
        {await Promise.all(smartDirectoryConfig.map(async (entry: { chainId: number; chainName: string; rpcUrl: string; smDirAddress: `0x${string}` }, index: number) => {
          const customClient = await createCustomClient(entry.chainId);
          const SmDirUri = await getSmDirUri(entry.smDirAddress, customClient);
          // const title = SmDirUri ? await getTitle(SmDirUri) : 'No title found';
          return (
            <Section key={`config-${index}`}>
              <Text>{entry.chainId.toString()}</Text>
              <Text>{entry.chainName}</Text>
              <Text>{entry.rpcUrl}</Text>
              <Text>{entry.smDirAddress}</Text>
              <Text>{SmDirUri ? SmDirUri : "no Uri attached to this contract"}</Text>
              <Text>{(await getTitle("http://127.0.0.1:3000")) || "no title found"}</Text>
              <Form name={`delete-form-${index}`}>
                <Input name="deleteConfig" value={index.toString()} />
                <Button type="submit">Delete 🚮</Button>
              </Form>
            </Section>
          );
        }))}
      </Box>
    ),
  };
};

export const onUserInput: OnUserInputHandler = async ({ id, event }): Promise<void> => {
  if (event.type === UserInputEventType.FormSubmitEvent) {
    //------- Supprimer un Smart Directory
    if (event.value.deleteConfig !== undefined) {
      const index = Number(event.value.deleteConfig);
      await removeFromMemorySmartDirectoryConfig(index);
      const newState = await getFromMemorySmartDirectoryConfig();
      await snap.request({
        method: 'snap_updateInterface',
        params: {
          id,
          ui: (
            <Box>
              <Heading>Smart Directory Configuration</Heading>
              {newState &&
                JSON.parse(newState as string).map((entry: any, index: number) => (
                  <Section key={`config-${index}`}>
                    <Text>{entry.toString()}</Text>
                  </Section>
                ))}
            </Box>
          ),
        },
      });
      return;
    }
    //------- Ajouter un nouveau Smart Directory
    if (event.value.chainid !== undefined && event.value.smartDirectoryAddress !== undefined) {
      const currentState = await addToMemorySmartDirectoryConfig([
        Number(event.value.chainid),
        chainArray.find((chain) => chain.id === Number(event.value.chainid))!,
        chainArray.find((chain) => chain.id === Number(event.value.chainid))!.blockExplorers.default.url,
        sanitizeAddress(event.value.smartDirectoryAddress as string),
      ]);
      console.log("adding")
      await snap.request({
        method: 'snap_updateInterface',
        params: {
          id,
          ui: (
            <Box>
              <Heading>Smart Directory Configuration</Heading>
              {/* Affichage de chaque élément stocké */}
              {currentState && JSON.parse(currentState as string).map((entry: any, index: number) => (
                <Section>
                  <Text key={`config-${index}`}>{entry.toString()}</Text>
                </Section>
              ))}
            </Box>
          ),
        },
      });
    }
  }
};

export const onInstall: OnInstallHandler = async () => {
  // ──────────────────────────────────────────────
  // GESTION DU STOCKAGE : stocker smartDirectoryConfig dans l'état du Snap
  // ──────────────────────────────────────────────
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { smartDirectoryConfig: JSON.stringify(smartDirectoryConfig) },
      encrypted: false,
    },
  });
};