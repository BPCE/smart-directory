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

// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const SMdirAddress = "0x623a73351159c85cdb0d3cd8665ab13dbf42f4f2";
  const referenceInfo = await getReferenceLastStatus(SMdirAddress, transaction.to as `0x${string}`)
  console.log(referenceInfo)
  
  return {
    content: (
      <Box>
        <Heading>{referenceInfo !== null ? "✅🔐" : "⛔️⛔️⛔️ Unknown Smartcontract ⛔️⛔️⛔️"}</Heading>
        <Text>

          You are interacting with <Bold>{transaction.to as `0x${string}`}</Bold> {referenceInfo? "which is part of th SmartDirectory.": ""}.
            {referenceInfo !== null ? " The reference status is: " + JSON.stringify(referenceInfo) : " This address is not part of the smartdirectory."}
        </Text>
      </Box>
    ),
  };
};