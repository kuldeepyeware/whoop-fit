/* eslint-disable @typescript-eslint/await-thenable */

"use client";

import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { type Challenge } from "@/schemas/types/challengeTypes";
import { useReadContract } from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { ClockIcon } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { encodeFunctionData } from "viem";
import { useState } from "react";
import { Button } from "../ui/button";
import useParticipantsCache from "@/hooks/usersName";
import { getParticipantNameByAddress } from "@/lib/participant";

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
  const [isPending, setIsPending] = useState(false);

  const { smartAccountAddress, smartAccountReady, sendUserOperation } =
    useSmartAccount();

  const participants = useParticipantsCache();

  const { toast } = useToast();

  const { data: winnerAddress } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getChallengeWinner",
    args: [challenge.challengeId],
  });

  const handleClaim = async (challenge: Challenge) => {
    if (!smartAccountReady || !smartAccountAddress) {
      toast({
        title: "Smart account is not ready",
        description: "Please wait for the smart account to initialize",
        variant: "destructive",
      });
      return;
    }

    setIsPending(true);

    const callData = encodeFunctionData({
      abi: WhoopTokenAbi,
      functionName: "claim",
      args: [challenge.challengeId],
    });

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await sendUserOperation({
        to: WhoopTokenAddress,
        data: callData,
      });

      toast({
        title: "Claim Rewarded successfully!",
      });

      setIsPending(false);

      await onClaimComplete();
    } catch (error) {
      console.error("Error sending transaction:", error);

      setIsPending(false);

      toast({
        title: "Error while claiming reward",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-4 w-[310px] rounded-lg border-none bg-white/10 p-6 text-white shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-lg">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold">
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
          {!challenge.isTwoSided && (
            <p className="text-sm">
              <span className="font-semibold">Target:</span>{" "}
              {[4, 5, 6].includes(challenge.challengeType)
                ? `${challenge.challengeTarget.toString()}% Improvement`
                : challenge.challengeTarget.toString()}
            </p>
          )}
          <p className="text-sm">
            <span className="font-semibold">Amount:</span>{" "}
            {challenge.challengerAmount.toString()} USDC
          </p>
          <p className="text-sm">
            <span className="font-semibold">1v1:</span>{" "}
            {challenge.isTwoSided ? "Yes" : "No"}
          </p>
          {challenge.status == (4 || 3) && (
            <p className="text-sm">
              <span className="font-semibold">Target Reached:</span>{" "}
              {challenge.targetReached ? "Yes" : "No"}
            </p>
          )}
          <p className="flex items-center text-sm">
            <ClockIcon className="mr-1 inline-block h-4 w-4" />
            {formatTimeRemaining(challenge.endTime)}
          </p>

          <p className="text-sm">
            <span className="font-semibold">Challenger:</span>{" "}
            {getParticipantNameByAddress(participants, challenge.challenger)}
          </p>

          <p className="text-sm">
            <span className="font-semibold">Challenged:</span>{" "}
            {getParticipantNameByAddress(participants, challenge.challenged)}
          </p>

          {formatTimeRemaining(challenge.endTime) == "Ended" &&
            winnerAddress != 0x0000000000000000000000000000000000000000 && (
              <p className="text-sm">
                <span className="font-semibold">Winner:</span>{" "}
                {winnerAddress ? (
                  <>
                    {getParticipantNameByAddress(
                      participants,
                      winnerAddress as string,
                    )}
                  </>
                ) : (
                  "N/A"
                )}
              </p>
            )}
        </div>

        {address === winnerAddress && challenge.status == 3 && (
          <Button
            onClick={() => handleClaim(challenge)}
            disabled={isPending}
            className="mt-2 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {isPending ? "Claiming" : "Claim Reward"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ChallengeCard;
