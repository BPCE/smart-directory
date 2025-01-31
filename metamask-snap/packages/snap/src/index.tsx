import type { OnTransactionHandler } from "@metamask/snaps-sdk";
import { Box, Heading, Text, Bold, Address } from "@metamask/snaps-sdk/jsx";

import { createPublicClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { abi } from './abi';

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http("https://polygon-amoy.drpc.org"),
});

const getReferenceLastStatus = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`) => {
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

const getRegistrantUri = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`) => {
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
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const SMdirAddress = "0x88CBa1e32db10CE775210C80A39F407EAA982E0D";
  const referenceInfo = await getReferenceLastStatus(SMdirAddress, transaction.to as `0x${string}`)
  const registrantUri = await getRegistrantUri(SMdirAddress, transaction.to as `0x${string}`)
  console.log(referenceInfo)
  
  return {
    content: (
      <Box>
        <Heading>{referenceInfo !== null ? "✅🔐" : "⛔️⛔️⛔️ Unknown Smartcontract ⛔️⛔️⛔️"}</Heading>
        <Text>

          You are interacting with <Bold>{transaction.to as `0x${string}`}</Bold> {referenceInfo? "which is part of the SmartDirectory.": ""}
            {referenceInfo !== null ? " The reference status is: " + JSON.stringify(referenceInfo) : " This address is not part of the smartdirectory."}
            {registrantUri !== null ? " The registrant URI is : " + registrantUri : ""}
        </Text>
      </Box>
    ),
  };
};