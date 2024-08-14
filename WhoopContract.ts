export const WhoopTokenAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ChallengeAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "targetReached",
        type: "bool",
      },
    ],
    name: "ChallengeCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "challenger",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "challenged",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum WhoopieChallengeContract.ChallengeStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum WhoopieChallengeContract.ChallengeType",
        name: "challengeType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeTarget",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isTwoSided",
        type: "bool",
      },
    ],
    name: "ChallengeCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ChallengeRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeesCollected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "targetReached",
        type: "bool",
      },
    ],
    name: "SelfChallengeCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum WhoopieChallengeContract.ChallengeStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum WhoopieChallengeContract.ChallengeType",
        name: "challengeType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeTarget",
        type: "uint256",
      },
    ],
    name: "SelfChallengeCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_startTime",
        type: "uint256",
      },
    ],
    name: "acceptChallenge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "accumulatedFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "challengeCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "challengeWinners",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "challenges",
    outputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "challenger",
        type: "address",
      },
      {
        internalType: "address",
        name: "challenged",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "challengerAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "enum WhoopieChallengeContract.ChallengeStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "enum WhoopieChallengeContract.ChallengeType",
        name: "challengeType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "challengeTarget",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "targetReached",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isTwoSided",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "collectFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_challenged",
        type: "address",
      },
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endTime",
        type: "uint256",
      },
      {
        internalType: "enum WhoopieChallengeContract.ChallengeType",
        name: "_challengeType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_challengeTarget",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isTwoSided",
        type: "bool",
      },
    ],
    name: "createChallenge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getAcceptedChallengesBy",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "getAccumulatedFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
    ],
    name: "getChallengeWinner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getChallengesCreatedBy",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getEndedChallengesForUser",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_challengeIds",
        type: "uint256[]",
      },
    ],
    name: "getMultipleChallengeDetails",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
    ],
    name: "getPendingChallengeById",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getPendingChallengesForUser",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getRejectedChallengesBy",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "challenger",
            type: "address",
          },
          {
            internalType: "address",
            name: "challenged",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "challengerAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum WhoopieChallengeContract.ChallengeType",
            name: "challengeType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "challengeTarget",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetReached",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isTwoSided",
            type: "bool",
          },
        ],
        internalType: "struct WhoopieChallengeContract.Challenge[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
    ],
    name: "isTwoSidedChallenge",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
    ],
    name: "rejectChallenge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "selfChallengeCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "selfChallenges",
    outputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "enum WhoopieChallengeContract.ChallengeStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "enum WhoopieChallengeContract.ChallengeType",
        name: "challengeType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "challengeTarget",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "targetReached",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_challengeId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_targetReached",
        type: "bool",
      },
    ],
    name: "updateTargetStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userCreatedChallenges",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userReceivedChallenges",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const WhoopTokenAddress = "0xF2bC81f7C336E815f51166B4d70f1FA4C151101c";
