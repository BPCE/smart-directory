export const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_parent1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_parent2",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_contractUri",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "_adminCode",
                "type": "uint8"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_referenceAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_projectId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_referenceType",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_referenceVersion",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_status",
                "type": "string"
            }
        ],
        "name": "createReference",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "createRegistrant",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "disableRegistrant",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getActivationCode",
        "outputs": [
            {
                "internalType": "enum SmartDirectoryLib.ActivationCode",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAdminCode",
        "outputs": [
            {
                "internalType": "enum SmartDirectoryLib.AdminCode",
                "name": "adminCode",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractType",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractUri",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDisabledRegistrants",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "disabledRegistrantsList",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getParent1",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getParent2",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_referenceAddress",
                "type": "address"
            }
        ],
        "name": "getReference",
        "outputs": [
            {
                "internalType": "address",
                "name": "registrantAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "registrantIndex",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "referenceAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "projectId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "referenceType",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "referenceVersion",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "status",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timeStamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_referenceAddress",
                "type": "address"
            }
        ],
        "name": "getReferenceLastStatusIndex",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "lastStatusIndex",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_referenceAddress",
                "type": "address"
            }
        ],
        "name": "getReferenceStatus",
        "outputs": [
            {
                "internalType": "string",
                "name": "status",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timeStamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_referenceAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "getReferenceStatusAtIndex",
        "outputs": [
            {
                "internalType": "string",
                "name": "status",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timeStamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "getReferencesLists",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "referenceAddresses",
                "type": "address[]"
            },
            {
                "internalType": "string[]",
                "name": "projectIds",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_registrantIndex",
                "type": "uint256"
            }
        ],
        "name": "getRegistrantAtIndex",
        "outputs": [
            {
                "internalType": "address",
                "name": "registrantAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "registrantUri",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "getRegistrantIndex",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRegistrantLastIndex",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "getRegistrantReferencesCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "getRegistrantUri",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registrantAddress",
                "type": "address"
            }
        ],
        "name": "isValidRegistrant",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum SmartDirectoryLib.ActivationCode",
                "name": "_activationCode",
                "type": "uint8"
            }
        ],
        "name": "setActivationCode",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_referenceAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_status",
                "type": "string"
            }
        ],
        "name": "updateReferenceStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_registrantUri",
                "type": "string"
            }
        ],
        "name": "updateRegistrantUri",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "version",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    }
] as const;