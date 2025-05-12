import {  OnTransactionHandler, OnHomePageHandler, 
          OnUserInputHandler, UserInputEventType, 
          OnInstallHandler } from '@metamask/snaps-sdk';
import { Address, Avatar, Banner, Bold, Box, Button, Card, Checkbox, Container,
          Dropdown, Field, Footer, Form, Heading, Icon, Image, Input, Italic,
          Link, Row, Section, Skeleton, Text, Value, 
          Option} from '@metamask/snaps-sdk/jsx';

import { abi } from './abi';

import {
  Homepage,
  Insight,
} from './components';

import { getSmDirUri, getTitle, createCustomClient, 
      SmartDirectoryConfig, getChainIdFromName,
      getChainNameFromId, getRpcUrlFromId
    } from './chain_utils';


const smartDirectoryConfigExample: SmartDirectoryConfig = [
  [
    getChainIdFromName('polygonAmoy'),
    "polygonAmoy",
    'https://polygon-amoy.drpc.org',
    '0x88CBa1e32db10CE775210C80A39F407EAA982E0D',
  ],
  [
     getChainIdFromName('holesky'),
    "holesky",
    'https://holesky.drpc.org',
    '0x6CC5Aa35253fA17064Af37cB6DD56692f7ee68F6',
  ],
];

var smartDirectoryConfig: SmartDirectoryConfig;

//vérifier si l'adresse commence par 0x
const sanitizeAddress = (address: string): `0x${string}` => {
  return address.startsWith('0x') ? address as `0x${string}` : `0x${address}` as `0x${string}`;
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
  return smartDirectoryConfig;
};

const addToMemorySmartDirectoryConfig = async (newConfig: [number, string, string, `0x${string}`]) => {
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
    (entry) => entry[0] === (chainId as unknown as number))?.[3] as `0x${string}`;
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

export const onHomePage: OnHomePageHandler = async () => {
  console.log('onHomePage is active');
  const smartDirectoryConfig = await getFromMemorySDConfigJSON();
  return {
    content: (createHomePageUI(smartDirectoryConfig).then((ui) => ui) as unknown) as any,
  };
};

async function createHomePageUI(smartDirectoryConfig: SmartDirectoryConfig) {
  <Homepage smartDirectoryConfig={smartDirectoryConfig} 
  />
}

export const onUserInput: OnUserInputHandler = async ({ id, event }): Promise<void> => {
  if (event.type === UserInputEventType.FormSubmitEvent) {
    //------- Supprimer un Smart Directory
    if (event.name.startsWith('delete-form-')) {
      const index = Number(event.name.replace('delete-form-', ''));
      await removeFromMemorySmartDirectoryConfig(index);
      const newState = await getFromMemorySmartDirectoryConfig();
      const smartDirectoryConfig = await getFromMemorySDConfigJSON();
      await snap.request({
        method: 'snap_updateInterface',
        params: {
          id,
          ui: createHomePageUI(smartDirectoryConfig).then((ui) => ui) as any,
        },
      });
      return;
    }
    //------- Ajouter un nouveau Smart Directory
    if (event.value.chainid !== undefined && event.value.smartDirectoryAddress !== undefined) {
      const currentState = await addToMemorySmartDirectoryConfig([
        Number(event.value.chainid),
        getChainNameFromId(Number(event.value.chainid))!,
        getRpcUrlFromId(Number(event.value.chainid))!,
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
