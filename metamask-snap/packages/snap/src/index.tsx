import { OnTransactionHandler, OnHomePageHandler, OnUserInputHandler, UserInputEventType, OnInstallHandler } from '@metamask/snaps-sdk';
import { Address, Avatar, Banner, Bold, Box, Button, Card, Checkbox, Container,
          Dropdown, Field, Footer, Form, Heading, Icon, Image, Input, Italic,
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
  const smDirAddress = smartDirectoryConfig.find(
    ([configId]) => configId = (chainId as unknown as number)
  )?.[3] as `0x${string}`;
  const customClient = await createCustomClient(chainId as unknown as number);
  const smDirUri = await getSmDirUri(smDirAddress, customClient);
  const smDirTitle = smDirUri ? await getTitle(smDirUri) : 'No uri for this smart directory';

  var referenceInfo: string | null | any = null;
  var registrantUri: any | null = null;
  if (typeof customClient === 'string'){
    referenceInfo = null;
  } else { 
    referenceInfo = await getReferenceLastStatus(
      smDirAddress,
      transaction.to as `0x${string}`,
      customClient,
    );
    registrantUri = await getRegistrantUri(
      smDirAddress,
      transaction.to as `0x${string}`,
      customClient,
    );
  }

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: <Insight from={from} referenceInfo={referenceInfo} registrantUri={registrantUri} 
                   registrantTitle={await getTitle(registrantUri)} authorityTitle={smDirTitle}/>,
      context: { transaction },
    },
  });

  return { id: interfaceId };
}




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
              <Input name="smartDirectoryAddress" placeholder="Enter another smart directory address" />
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
          const smDirUri = await getSmDirUri(entry.smDirAddress, customClient);
          const smDirTitle = smDirUri ? await getTitle(smDirUri) : 'No uri for this smart directory';
          return (
            <Section key={`config-${index}`}>
              <Box alignment='center' direction='horizontal' >
                <Box>
                  <Text>{smDirTitle || "no smart directory title"}</Text>
                  <Link href={smDirUri ? smDirUri : "no smart directory URI"}>{smDirUri ? smDirUri : "no smart directory URI"}</Link>
                  <Address address={buildCaip10Address("eip155",entry.chainId.toString(),entry.smDirAddress)}></Address>
                  <Text>{entry.rpcUrl}</Text>
                </Box>
                <Form name={`delete-form-${index}`}>
                  <Section key={`delete-form`}>
                  <Button type="submit">
                  <Image src={trashCanSvgContent} alt="Delete"/>
                  </Button>
                  </Section>
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
    if (event.name.startsWith('delete-form-')) {
      const index = Number(event.name.replace('delete-form-', ''));
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

const trashCanSvgContent =  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="80" height="80" viewBox="0 0 256 256" xml:space="preserve">
<g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
	<path d="M 64.71 90 H 25.291 c -4.693 0 -8.584 -3.67 -8.859 -8.355 l -3.928 -67.088 c -0.048 -0.825 0.246 -1.633 0.812 -2.234 c 0.567 -0.601 1.356 -0.941 2.183 -0.941 h 59.002 c 0.826 0 1.615 0.341 2.183 0.941 c 0.566 0.601 0.86 1.409 0.813 2.234 l -3.928 67.089 C 73.294 86.33 69.403 90 64.71 90 z M 18.679 17.381 l 3.743 63.913 C 22.51 82.812 23.771 84 25.291 84 H 64.71 c 1.52 0 2.779 -1.188 2.868 -2.705 l 3.742 -63.914 H 18.679 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
	<path d="M 80.696 17.381 H 9.304 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 71.393 c 1.657 0 3 1.343 3 3 S 82.354 17.381 80.696 17.381 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
	<path d="M 58.729 17.381 H 31.271 c -1.657 0 -3 -1.343 -3 -3 V 8.789 C 28.271 3.943 32.214 0 37.061 0 h 15.879 c 4.847 0 8.789 3.943 8.789 8.789 v 5.592 C 61.729 16.038 60.386 17.381 58.729 17.381 z M 34.271 11.381 h 21.457 V 8.789 C 55.729 7.251 54.478 6 52.939 6 H 37.061 c -1.538 0 -2.789 1.251 -2.789 2.789 V 11.381 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
	<path d="M 58.33 74.991 c -0.06 0 -0.118 -0.002 -0.179 -0.005 c -1.653 -0.097 -2.916 -1.517 -2.819 -3.171 l 2.474 -42.244 c 0.097 -1.655 1.508 -2.933 3.171 -2.819 c 1.653 0.097 2.916 1.516 2.819 3.17 l -2.474 42.245 C 61.229 73.761 59.906 74.991 58.33 74.991 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
	<path d="M 31.669 74.991 c -1.577 0 -2.898 -1.23 -2.992 -2.824 l -2.473 -42.245 c -0.097 -1.654 1.165 -3.073 2.819 -3.17 c 1.646 -0.111 3.073 1.165 3.17 2.819 l 2.473 42.244 c 0.097 1.654 -1.165 3.074 -2.819 3.171 C 31.788 74.989 31.729 74.991 31.669 74.991 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
	<path d="M 45 74.991 c -1.657 0 -3 -1.343 -3 -3 V 29.747 c 0 -1.657 1.343 -3 3 -3 c 1.657 0 3 1.343 3 3 v 42.244 C 48 73.648 46.657 74.991 45 74.991 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
</g>
</svg>`;