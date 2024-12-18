import { createPublicClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { abi } from '@/lib/abi/abi';

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http("https://polygon-amoy.drpc.org"),
});

export const getAllRegistrants = async (SMDirAddress: `0x${string}`) => {
  // Appel de la fonction getRegistrantLastIndex
  const lastIndexData = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getRegistrantLastIndex',
  });
  const lastIndex = lastIndexData ? Number(lastIndexData) : 0;
  console.log('lastIndex:', lastIndex);

  const registrantDataTab = [];

  for (let i = 1; i < lastIndex+1; i++) {
    // Appel de la fonction getRegistrantAtIndex
    const registrantData = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getRegistrantAtIndex',
      args: [BigInt(i)],
    });
    console.log('registrantData:', registrantData);
    registrantDataTab.push(registrantData);
  }
  console.log('registrantDataTab:', registrantDataTab);
  return registrantDataTab;
};

export const getAllReferences = async (SMDirAddress: `0x${string}`, registrantAddress: `0x${string}`) => {
    // Appel de la fonction getReferencesLists
    const referenceDataTab = await client.readContract({
        address: SMDirAddress,
        abi,
        functionName: 'getReferencesLists',
        args: [registrantAddress],
    });
    console.log('referenceDataTab:', referenceDataTab);

    return referenceDataTab;
    }

export const getReferenceStatus = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`) => {
    // Appel de la fonction getReferenceStatus
    const referenceStatusTab = await client.readContract({
        address: SMDirAddress,
        abi,
        functionName: 'getReferenceStatus',
        args: [referenceAddress],
    });
    console.log('referenceStatus:', referenceStatusTab);

    return referenceStatusTab;
    }