interface Challenge {
  challengeId: bigint;
  challenger: string;
  challenged: string;
  tokenAddress: string;
  challengerAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  status: number;
  challengeType: number;
  challengeTarget: bigint;
  isCompleted: boolean;
  targetReached: boolean;
  isTwoSided: boolean;
}

interface SelfChallenge {
  challengeId: bigint;
  user: string;
  startTime: bigint;
  endTime: bigint;
  status: number;
  challengeType: number;
  challengeTarget: bigint;
  targetReached: boolean;
}

export { type Challenge, type SelfChallenge };
