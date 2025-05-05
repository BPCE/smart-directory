import { OnTransactionHandler, OnHomePageHandler, OnUserInputHandler, UserInputEventType, OnInstallHandler } from '@metamask/snaps-sdk';
import { Address, Avatar, Banner, Bold, Box, Button, Card, Checkbox, Container,
          Dropdown, Field, Footer, Form, Heading, Icon, Input, Italic,
          Link, Row, Section, Skeleton, Text, Value,
          Option} from '@metamask/snaps-sdk/jsx';
import { Chain, createPublicClient, http } from 'viem';
import { polygonAmoy, holesky, sepolia } from 'viem/chains';
import { abi } from './abi';

import {
  Insight,
} from './components';

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

function normalizeChainId(id: string | number): number {
  if (typeof id === 'number') return id;
  // Remove 'eip155:' prefix if present and convert to number
  return parseInt(id.replace(/^eip155:/, ''), 10);
}

const createCustomClient = async (chainId: any) => {
  // Récupérer la chaîne à partir de chainArray, et non pas de la config stockée
  const chainObject = chainArray.find((chain) => normalizeChainId(chain.id) === normalizeChainId(chainId));
  if (!chainObject) {
    let message =  `Chain with id ${chainId} not in smart directories`;
    console.log(message);
    //console.log('chainArray', JSON.stringify(chainArray, null, 2));
    return message;
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
    // Utilisation de l'API Microlink pour récupérer le title meme si l'url n'accepte pas les requetes CORS
    // Il faut ajouter le header "Access-Control-Allow-Origin" pour que la reponse a une demande directe a l'URL passe
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
    });
    console.log('Response:',  JSON.stringify(response, null, 2));
    const data = await response.json(); // not using microlink use: response.text();
    const title = data.data.title; // not using microlink  parse: data.match(/<title>(.*?)<\/title>/);
    return title ? title : 'No title found';
  } catch (error) {
    console.error('Error fetching title:', error);
    return JSON.stringify(error);
  }
};
// ──────────────────────────────────────────────
// HANDLERS
// ──────────────────────────────────────────────

// Gestionnaire des transactions sortantes.
// export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
//   const { from, to } = transaction;

//   const interfaceId = await snap.request({
//     method: 'snap_createInterface',
//     params: {
//       ui: <Insight from={from} to={to} />,
//       context: { transaction },
//     },
//   });

//   return { id: interfaceId };
// };

export const onTransaction: OnTransactionHandler = async ({ transaction, chainId }) => {
  console.log('onTransaction is active', transaction.toString());
  // Correction de la recherche de SMdirAddress
  const { from, to } = transaction;
  const SMdirAddress = smartDirectoryConfig.find(
    ([configId]) => configId = (chainId as unknown as number)
  )?.[3] as `0x${string}`;

  const customClient = await createCustomClient(chainId as unknown as number);
  var referenceInfo: string | null | any = null;
  var registrantUri: any | null = null;
  if (typeof customClient === 'string'){
    referenceInfo = null;
  } else { 
    referenceInfo = await getReferenceLastStatus(
      SMdirAddress,
      transaction.to as `0x${string}`,
      customClient,
    );
    registrantUri = await getRegistrantUri(
      SMdirAddress,
      transaction.to as `0x${string}`,
      customClient,
    );
  }

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: <Insight from={from} referenceInfo={referenceInfo} registrantUri={registrantUri}/>,
      context: { transaction },
    },
  });

  return { id: interfaceId };
}

//   // Récupérer l'état actuel (ou un objet vide si inexistant)
//   const state = getFromMemorySmartDirectoryConfig



//   // ──────────────────────────────────────────────
//   // AFFICHAGE DU CONTENU : inclusion du tableau smartDirectoryConfig stocké
//   // ──────────────────────────────────────────────
//   return {
//     content: (
//       <Box>
//         <Heading>
//           {referenceInfo !== null
//             ? '✅🔐'
//             : '⛔️⛔️⛔️ Unknown Smartcontract ⛔️⛔️⛔️'}
//         </Heading>
//         <Text>
//           You are interacting with{' '}
//           <Bold>{transaction.to as `0x${string}`}</Bold>{' '}
//           {referenceInfo
//             ? 'which has been approved by the SmartDirectory authority.'
//             : 'which is unknown to the smartdirectory authorities.'}
//         </Text>
//         <Text>
//           {referenceInfo !== null
//             ? 'The reference status is: ' + JSON.stringify(referenceInfo)
//             : ''}
//         </Text>
//         <Text>
//           {registrantUri !== null
//             ? 'The registrant URI is: ' + registrantUri
//             : ''}
//         </Text>
//         <Heading>Smart Directory Configuration</Heading>
//         {/* Affichage de chaque élément stocké */}
//         {typeof state === 'string' && JSON.parse(state).map((entry: any, index: number) => (
//           <Box>
//           <Text key={`config-${index}`}>{JSON.stringify(entry)}</Text>
//           </Box>
//         ))}
//       </Box>
//     ),
//   };
// };

function buildCaip10Address(
  namespace: string,
  chainId: string,
  accountAddress: string
): `${string}:${string}:${string}` {
  if (!namespace || !chainId || !accountAddress) {
    throw new Error('All CAIP-10 components must be non-empty strings');
  }
  if (namespace === 'eip155' && !accountAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid EVM address format');
  }
  return `${namespace}:${chainId}:${accountAddress}` as `${string}:${string}:${string}`;
}

export const onHomePage: OnHomePageHandler = async () => {
  console.log('onHomePage is active');
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
        <Heading>List of the configured Smart Directories</Heading>
        {/* Affichage de chaque élément stocké */}
        {await Promise.all(smartDirectoryConfig.map(async (entry: { chainId: number; chainName: string; rpcUrl: string; smDirAddress: `0x${string}` }, index: number) => {
          const customClient = await createCustomClient(entry.chainId);
          const registrantUri = await getSmDirUri(entry.smDirAddress, customClient);
          const registrantTitle = registrantUri ? await getTitle(registrantUri) : 'No uri for this registrant';
          return (
            <Section key={`config-${index}`}>
              <Box>
              <Text>{registrantTitle || "no registrant title"}</Text>
              <Link href={registrantUri ? registrantUri : "no registrant URI"}>{registrantUri ? registrantUri : "no registrant URI"}</Link>
              <Address address={buildCaip10Address("eip155",entry.chainId.toString(),entry.smDirAddress)}></Address>
              <Text>{entry.rpcUrl}</Text>
              <Form name={`delete-form-${index}`}>
                <Input name="deleteConfig" value={index.toString()} />
                <Button type="submit">Delete 🚮</Button>
              </Form>
              </Box>
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