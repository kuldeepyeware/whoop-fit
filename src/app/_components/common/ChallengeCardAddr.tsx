/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { type Challenge } from "@/schemas/types/challengeTypes";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { ClockIcon } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "../ui/use-toast";

type ChallengeCardProps = {
  challenge: Challenge;
  address: string;
  onClaimComplete: () => void;
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  address,
  onClaimComplete,
}) => {
  const { toast } = useToast();

  const { data: winnerAddress } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getChallengeWinner",
    args: [challenge.challengeId],
  });

  const {
    data: claimHash,
    isPending,
    writeContractAsync: claimChallenge,
  } = useWriteContract({});

  const { isSuccess, isLoading: isClaimLoading } = useWaitForTransactionReceipt(
    {
      hash: claimHash,
    },
  );

  const handleClaim = async (challenge: Challenge) => {
    await claimChallenge({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "claim",
      args: [challenge.challengeId],
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Claim Rewarded Successfully!",
      });
    }
    onClaimComplete();
  }, [isSuccess]);

  return (
    <Card className="mb-4 w-[320px] rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {getChallengeTypeString(challenge.challengeType)}
          </h3>
          <Badge
            className="rounded-md px-2 py-1 text-xs"
            variant={getBadgeVariant(challenge.status)}
          >
            {getBadgeVariant(challenge.status)}
          </Badge>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Target:</span>{" "}
            {challenge.challengeTarget.toString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Amount:</span>{" "}
            {challenge.challengerAmount.toString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Two Sided:</span>{" "}
            {challenge.isTwoSided ? "Yes" : "No"}
          </p>
          {challenge.status == (4 || 3) && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Target Reached:</span>{" "}
              {challenge.targetReached ? "Yes" : "No"}
            </p>
          )}
          <p className="text-sm text-gray-600">
            <ClockIcon className="mr-1 inline-block h-4 w-4 text-gray-500" />
            {formatTimeRemaining(challenge.endTime)}
          </p>

          <p className="text-sm text-gray-600">
            <span className="font-semibold">Challenger:</span>{" "}
            {challenge.challenger.slice(0, 6)}...
            {challenge.challenger.slice(-4)}
          </p>

          <p className="text-sm text-gray-600">
            <span className="font-semibold">Challenged:</span>{" "}
            {challenge.challenged.slice(0, 6)}...
            {challenge.challenged.slice(-4)}
          </p>

          {formatTimeRemaining(challenge.endTime) == "Ended" &&
            winnerAddress != 0x0000000000000000000000000000000000000000 && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Winner:</span>{" "}
                {winnerAddress
                  ? `${(winnerAddress as string).slice(0, 6)}...${(winnerAddress as string).slice(-4)}`
                  : "N/A"}
              </p>
            )}
        </div>

        {address === winnerAddress && challenge.status == 3 && (
          <button
            onClick={() => handleClaim(challenge)}
            disabled={isPending || isClaimLoading}
            className="mt-2 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {isPending || isClaimLoading ? "Claiming" : "Claim Reward"}
          </button>
        )}
      </div>
    </Card>
  );
};

export default ChallengeCard;
