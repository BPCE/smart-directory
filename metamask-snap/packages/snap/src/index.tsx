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
      SmartDirectoryConfig, SmartDirectoryConfigEntry,
      SmartDirectoryConfigExpandedEntry,
      getChainIds, getChainIdFromName,
      getChainNameFromId, getRpcUrlFromId
    } from './chain_utils';


const smartDirectoryConfigExample: SmartDirectoryConfig = [
  [
    getChainIdFromName("Polygon Amoy"),
    "Polygon Amoy",
    'https://polygon-amoy.drpc.org',
    '0x88CBa1e32db10CE775210C80A39F407EAA982E0D',
  ],
  [
     getChainIdFromName("Holesky"),
    "Holesky",
    'https://holesky.drpc.org',
    '0x6CC5Aa35253fA17064Af37cB6DD56692f7ee68F6',
  ],
];

//var smartDirectoryConfig: SmartDirectoryConfig = [];

//vérifier si l'adresse commence par 0x
const sanitizeAddress = (address: string): `0x${string}` => {
  return address.startsWith('0x') ? address as `0x${string}` : `0x${address}` as `0x${string}`;
};

const getFromStateSmartDirectoryConfigRawString = async () => {
  const state =
    (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get', encrypted: false },
    })) || {};
  return state.smartDirectoryConfig;
};

// const state =
// (await snap.request({
//   method: 'snap_manageState',
//   params: { operation: 'get', encrypted: false },
// })) || {};
// if (!state.smartDirectoryConfig) {
// return;
// }

const getFromStateSmartDirectoryConfig = async (): Promise<SmartDirectoryConfigEntry[]> => {
  const state = await getFromStateSmartDirectoryConfigRawString();
  console.log('getFromStateSmartDirectoryConfig state:', state);
  if (!state) {
    console.log('getFromStateSmartDirectoryConfig state is null returning []');
    return smartDirectoryConfigExample;
    //return [];
  }
  const smartDirectoryConfig = JSON.parse(state as string);
  return smartDirectoryConfig;
};

const addToStateSmartDirectoryConfig = async (newConfig: [number, string, string, `0x${string}`]) => {
  const currentState = await getFromStateSmartDirectoryConfigRawString();
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
  const afterState = await getFromStateSmartDirectoryConfig();
  return afterState;
};

const removeFromStateSmartDirectoryConfig = async (index: number) => {
  console.log('removeFromMemorySmartDirectoryConfig index:', index);
  const state =
    (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get', encrypted: false },
    })) || {};
    if (!state.smartDirectoryConfig) {
      return;
    }
  console.log('removeFromMemorySmartDirectoryConfig initial state config', state.smartDirectoryConfig);
  const smartDirectoryConfig = state ? JSON.parse(state.smartDirectoryConfig as unknown as string) : [];
  smartDirectoryConfig.splice(index, 1);
  console.log('removeFromMemorySmartDirectoryConfig resultant config', JSON.stringify(smartDirectoryConfig));
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
  const smartDirectoryConfig = await getFromStateSmartDirectoryConfig();
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


function create2(){
  console.log('create2');
  return (
    <Box>
      <Heading>Smart Directory Configuration</Heading>
      <Text> Smart Directory Configurations Found create2:</Text>
    </Box>
  );
}

export const onHomePage: OnHomePageHandler = async () => {
  const smartDirectoryConfig = await getFromStateSmartDirectoryConfig();
  console.log('onHomePage is active with smartDirectoryConfig', smartDirectoryConfig);
  const entries = await expandEntries(smartDirectoryConfig);
  console.log('onHomePage entries', JSON.stringify(entries, null, 2));
  console.log('createHomePageUI called');
  return {
    content: createHomePageUI(entries)
  };
};

async function expandEntries(entries: SmartDirectoryConfigEntry[]): Promise<SmartDirectoryConfigExpandedEntry[]> {
  return  await Promise.all(
    entries.map(async (entry: SmartDirectoryConfigEntry) => {
      const customClient = await createCustomClient(entry[0]);
      const smDirUri = await getSmDirUri(entry[3], customClient);
      const smDirTitle = smDirUri ? await getTitle(smDirUri) : 'No URI for this smart directory';
      return {
        smDirTitle: smDirTitle,
        smDirUri: smDirUri,
        chainId: entry[0],
        chainName: entry[1],
        rpcUrl: entry[2],
        smDirAddress: entry[3],
      };
    })
  );
}

function createHomePageUI(smartDirectoryExpandedEntries: SmartDirectoryConfigExpandedEntry[]) {
  console.log('createHomePageUI with smartDirectoryConfig', JSON.stringify(smartDirectoryExpandedEntries));
  return (
    <Homepage smartDirectoryConfig_param={smartDirectoryExpandedEntries} />
  );
}

export const onUserInput: OnUserInputHandler = async ({ id, event }): Promise<void> => {
  if (event.type === UserInputEventType.FormSubmitEvent) {
    console.log('onUserInput is active, event:', JSON.stringify(event));
    //------- Supprimer un Smart Directory
    if (event.name.startsWith('delete-form-')) {
      console.log('onUserInput removing a smart directory');
      const index = Number(event.name.replace('delete-form-', ''));
      await removeFromStateSmartDirectoryConfig(index);
      const smartDirectoryConfig = await getFromStateSmartDirectoryConfig();
      console.log('onUserInput refreshing homepage from state', JSON.stringify(smartDirectoryConfig));
      const entries = await expandEntries(smartDirectoryConfig);
      console.log('onUserInput refreshing homepage after removal', JSON.stringify(entries));
      await snap.request({
        method: 'snap_updateInterface',
        params: {
          id,
          ui: createHomePageUI(entries),
        },
      });
      return;
    }
    //------- Ajouter un nouveau Smart Directory
    if (event.name.startsWith('form-add-smart-directory')) {
      console.log('onUserInput adding a new smart directory');
      if (event.value.chainId !== undefined && event.value.smartDirectoryAddress !== undefined) {
        const currentState = await addToStateSmartDirectoryConfig([
          Number(event.value.chainId),
          getChainNameFromId(Number(event.value.chainId))!,
          getRpcUrlFromId(Number(event.value.chainId))!,
          sanitizeAddress(event.value.smartDirectoryAddress as string),
        ]);
        console.log("adding to memory smartDirectoryConfig", currentState);
        const smartDirectoryConfig = await getFromStateSmartDirectoryConfig();
        console.log('onUserInput refreshing homepage from state', JSON.stringify(smartDirectoryConfig));
        const entries = await expandEntries(smartDirectoryConfig);
        console.log('onUserInput refreshing homepage after addition', JSON.stringify(entries));
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: createHomePageUI(entries),
          },
        });
      }
    }
  }
};

export const onInstall: OnInstallHandler = async () => {
  console.log('Initializing smartDirectoryConfig on install');
  const smartDirectoryConfig = smartDirectoryConfigExample; // Initialize with example config
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { smartDirectoryConfig: JSON.stringify(smartDirectoryConfig) },
      encrypted: false,
    },
  });
};
