

import { abi } from './abi';
import { createPublicClient, http, Chain } from 'viem';
import { polygonAmoy, holesky, sepolia } from 'viem/chains';

const chainArray = [polygonAmoy, holesky, sepolia];

export type SmartDirectoryConfigEntry = [number, string , string,  `0x${string}`]
export type SmartDirectoryConfigExpandedEntry = {
  smDirTitle: string;
  smDirUri: string;
  chainId: number;
  chainName: string;
  rpcUrl: string;
  smDirAddress: `0x${string}`;
};
export type SmartDirectoryConfig = SmartDirectoryConfigEntry[];

export function buildCaip10Address(
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

export const getSmDirUri = async (
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
        return "no URI";
      }
      return contractURI;
    } catch (error) {
      console.error("Erreur lors de la lecture de l'URI du contrat :", error);
      return "error reading URI";
    }
  };

  //fonction pour récupérer le title d'une url donnée
export const getTitle = async (url: string) => {
    // Vérification de l'URL
    if (!url || url.includes('no URI for')) {
      return '';
    }
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

  function normalizeChainId(id: string | number): number {
    if (typeof id === 'number') return id;
    // Remove 'eip155:' prefix if present and convert to number
    return parseInt(id.replace(/^eip155:/, ''), 10);
  }

  export const getChainIdFromName = (name: string): number  => {
    if (chainArray.length === 0) {
      console.error('chainArray is empty');
      console.trace();
      return 0;
    }
    const names = chainArray.map((chain) => chain.name);
    console.log('Chain names:', names);
    const chain = chainArray.find((chain) => chain.name === name);
    if (chain) {
      return chain.id;
    } else {
      console.error(`Chain with name ${name} not found`);
      console.trace();
      console.log('chainArray', JSON.stringify(chainArray, null, 2));
      return 0;
    }
  };

  export const getChainNameFromId = (id: number): string => {
    console.log('getChainNameFromId id', id);
    const chain = chainArray.find((chain) => chain.id === id); 
    return chain ? chain.name : "Internal error: chain not found";
  };


  export const getChainIds =(): number[] => {
    return chainArray.map((chain) => chain.id);
  };

  export const getRpcUrlFromId = (id: number): string  => {
    const chain = chainArray.find((chain) => chain.id === id);
    if (chain) {
      return chain.rpcUrls.default.http[0];
    } else {
      console.error(`Chain with id ${id} not found`);
      return "Internal error: chain not found";
    }
  };

  export const createCustomClient = async (chainId: any) => {
    // Récupérer la chaîne à partir de chainArray, et non pas de la config stockée
    const chainObject = chainArray.find((chain) => 
                    normalizeChainId(chain.id) === normalizeChainId(chainId));
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
  