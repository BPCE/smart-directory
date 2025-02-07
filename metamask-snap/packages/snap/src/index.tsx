import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import { Box, Heading, Text, Bold } from '@metamask/snaps-sdk/jsx';
import { Chain, createPublicClient, http } from 'viem';
import { polygonAmoy, holesky } from 'viem/chains';
import { abi } from './abi';

//TODO: Demander à l'utilisateur de renseigner les informations de configuration (address, chain, url) pour chaque réseau

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

const createCustomClient = (chainId: number) => {
  // Correction de l'opérateur d'égalité
  const [id, clientObject, url, SMDirAddress] =
    smartDirectoryConfig.find(([configId]) => configId = chainId) ?? [];
  try {
    if (!id) {
      throw new Error('Invalid chainId');
    }
    return createPublicClient({
      chain: clientObject,
      transport: http(url),
    });
  } catch (error) {
    return String(error);
  }
};

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

// Gestionnaire des transactions sortantes.
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  // Correction de la recherche de SMdirAddress
  const SMdirAddress = smartDirectoryConfig.find(
    ([configId]) => configId = (chainId as unknown as number)
  )?.[3] as `0x${string}`;

  const customClient = createCustomClient(chainId as unknown as number);
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

  // ──────────────────────────────────────────────
  // GESTION DU STOCKAGE : stocker smartDirectoryConfig dans l'état du Snap
  // ──────────────────────────────────────────────

  // 1. Récupérer l'état actuel (ou un objet vide si inexistant)
  const state =
    (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get', encrypted: false },
    })) || {};

  // 2. Vérifier si smartDirectoryConfig a déjà été stocké
  if (!state.smartDirectoryConfig) {
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: { ...state, smartDirectoryConfig: JSON.stringify(smartDirectoryConfig) },
        encrypted: false,
      },
    });
    // On met à jour la variable state pour l'affichage
    state.smartDirectoryConfig = JSON.stringify(smartDirectoryConfig);
  }

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
        {typeof state.smartDirectoryConfig === 'string' && JSON.parse(state.smartDirectoryConfig).map((entry: any, index: number) => (
          <Text key={`config-${index}`}>{JSON.stringify(entry)}</Text>
        ))}
      </Box>
    ),
  };
};
