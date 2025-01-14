import { createPublicClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { abi } from '@/lib/abi/abi';

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http("https://polygon-amoy.drpc.org"),
});

export const getAllRegistrants = async (SMDirAddress: `0x${string}`) => {
  if (SMDirAddress === '0x0000000000000000000000000000000000000000') {
    return
  }

  SMDirAddress = `0x${SMDirAddress.slice(2).trimEnd()}` as `0x${string}`;

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


export const getReferenceStatus = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`) => {
  // Appel de la fonction getReferenceStatus
  const ReferenceStatuslastIndex = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getReferenceLastStatusIndex',
    args: [referenceAddress],
  });
  console.log('ReferenceStatuslastIndex:', ReferenceStatuslastIndex);
  const referenceStatusTab = [];
  
  for (let i = 1; i < ReferenceStatuslastIndex + BigInt(1); i++) {
    // Appel de la fonction getReferenceStatusAtIndex
    const referenceStatus = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getReferenceStatusAtIndex',
      args: [referenceAddress, BigInt(i)],
    });
    console.log('referenceStatus:', referenceStatus);
    referenceStatusTab.push(referenceStatus);
  }
  
  console.log('referenceStatusTab:', referenceStatusTab);
  
  return referenceStatusTab;
}

export const getReferenceLastStatus = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`) => {
  // Appel de la fonction getReferenceLastStatusIndex
  const ReferenceStatuslastIndex = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getReferenceLastStatusIndex',
    args: [referenceAddress],
  });
  console.log('ReferenceStatuslastIndex:', ReferenceStatuslastIndex);
  const referenceStatus = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getReferenceStatusAtIndex',
    args: [referenceAddress, ReferenceStatuslastIndex],
  });
  console.log('referenceStatus:', referenceStatus);
  return referenceStatus;
}

export const getAllReferences = async (SMDirAddress: `0x${string}`, registrantAddress: `0x${string}`) => {
  // Appel de la fonction getReferencesLists
  const referenceDataTab = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getReferencesLists',
    args: [registrantAddress],
  });
  console.log('referenceDataTab:', referenceDataTab);

  const referenceDataTabComplete = [];
  for (let i = 0; i < referenceDataTab[0].length; i++) {
    // Appel de la fonction getReference
    const referenceData = await client.readContract({
      address: SMDirAddress,
      abi,
      functionName: 'getReference',
      args: [referenceDataTab[0][i]],
    });
    console.log('referenceData:', referenceData);

    // Appel de la fonction getReferenceLastStatus pour obtenir le dernier statut
    const referenceAddress = referenceData[2] as `0x${string}`;
    const referenceStatus = await getReferenceLastStatus(SMDirAddress, referenceAddress);

    // Ajout du dernier statut à l'array de la référence
    const completeReferenceData = [...referenceData, ...referenceStatus];
    referenceDataTabComplete.push(completeReferenceData);
  }

  console.log('referenceDataTabComplete:', referenceDataTabComplete);

  return referenceDataTabComplete;
};

export const getReference = async (SMDirAddress: `0x${string}`, referenceAddress: `0x${string}`) => {
  // Appel de la fonction getReference
  const referenceData = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getReference',
    args: [referenceAddress],
  });
  console.log('referenceData:', referenceData);
  return [referenceData];
};

export const getRegistrant = async (SMDirAddress: `0x${string}`, registrantAddress: `0x${string}`) => {
  // Appel de la fonction getAllRegistrants
  const registrantDataTab = await getAllRegistrants(SMDirAddress);
  console.log('registrantDataTab:', registrantDataTab);

  // Recherche du registrant
  const registrantData = registrantDataTab?.find((registrant) => registrant[0] === registrantAddress);
  console.log('registrantData:', registrantData);
  return [registrantData];
};

export const getContractURI = async (SMDirAddress: `0x${string}`) => {

  SMDirAddress = `0x${SMDirAddress.slice(2).trimEnd()}` as `0x${string}`;
  // Appel de la fonction getContractURI
  const contractURI = await client.readContract({
    address: SMDirAddress,
    abi,
    functionName: 'getContractUri',
  });
  console.log('contractURI:', contractURI);
  return contractURI;
};