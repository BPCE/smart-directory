import type { OnTransactionHandler } from "@metamask/snaps-sdk";
import { Box, Heading, Text, Bold, Address } from "@metamask/snaps-sdk/jsx";

import { Chain, createPublicClient, http } from 'viem';
import { polygonAmoy, sepolia } from 'viem/chains';
import { abi } from './abi';

const smartDirectoryConfig: [number, Chain, string, `0x${string}`][] = [
  [polygonAmoy.id, polygonAmoy, "https://polygon-amoy.drpc.org", "0x88CBa1e32db10CE775210C80A39F407EAA982E0D"],
  [sepolia.id, sepolia, "https://sepolia.drpc.org", "0x88CBa1e32db10CE775210C80A39F407EAA982E0D"],
];

const createCustomClient = (chainId: number) => {
  const [id, clientObject, url, SMDirAddress] = smartDirectoryConfig.find(([configId]) => configId = chainId) ?? [];
  try {
    if (!id) {
      throw new Error("Invalid chainId");
    }
    return createPublicClient({
      chain: clientObject,
      transport: http(url),
    });
  } catch (error) {
    return String(error);
  }
}

const getReferenceLastStatus = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`, customClient: any) => {
  const client = customClient;
  var referenceStatus: string | null = null;
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
}

const getRegistrantUri = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`, customClient: any) => {
  const client = customClient;
  var registrantAddress: `0x${string}` | null = null;
  try {
    const registrantUriResult = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getReference',
      args: [referenceAddress],
    });
    registrantAddress = registrantUriResult[0] as `0x${string}` ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }

  var registrantUri: string | null = null;
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
}


// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction, chainId }) => {
  const SMdirAddress = "0x88CBa1e32db10CE775210C80A39F407EAA982E0D";
  const customClient = createCustomClient(chainId as unknown as number);
  const referenceInfo = await getReferenceLastStatus(SMdirAddress, transaction.to as `0x${string}`, customClient)
  const registrantUri = await getRegistrantUri(SMdirAddress, transaction.to as `0x${string}`, customClient)

  return {
    content: (
      <Box>
        <Heading>{referenceInfo !== null ? "✅🔐" : "⛔️⛔️⛔️ Unknown Smartcontract ⛔️⛔️⛔️"}</Heading>
        <Text>

          You are interacting with <Bold>{transaction.to as `0x${string}`}</Bold> {referenceInfo ? "which is part of the SmartDirectory." : ""}
          {referenceInfo !== null ? " The reference status is: " + JSON.stringify(referenceInfo) : " This address is not part of the smartdirectory."}
          {registrantUri !== null ? " The registrant URI is : " + registrantUri : ""}
        </Text>
      </Box>
    ),
  };
};