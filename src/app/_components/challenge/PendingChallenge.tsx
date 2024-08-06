/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */

"use client";

import { type Challenge } from "@/schemas/types/challengeTypes";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { Badge } from "../ui/badge";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { tokenAbi, tokenAddress } from "TokenContract";
import { useToast } from "../ui/use-toast";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";

type PendingChallengeProps = {
  pendingChallengesData: any;
  isLoading: any;
  refetchPendingChallengeData: any;
  refetchAcceptedChallenges: any;
  refetchRejectedChallenges: any;
};

const PendingChallenge: React.FC<PendingChallengeProps> = ({
  pendingChallengesData,
  isLoading,
  refetchPendingChallengeData,
  refetchAcceptedChallenges,
  refetchRejectedChallenges,
}) => {
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [acceptingChallengeId, setAcceptingChallengeId] = useState<
    bigint | null
  >(null);
  const [rejectingChallengeId, setRejectingChallengeId] = useState<
    bigint | null
  >(null);

  const { toast } = useToast();

  const {
    data: acceptHash,
    writeContract: acceptChallengeContract,
    isPending: acceptingChallenge,
  } = useWriteContract();

  const {
    data: rejectHash,
    writeContract: rejectChallengeContract,
    isPending: rejectingChallenge,
  } = useWriteContract();

  const {
    data: approvalHash,
    writeContract: approveToken,
    isPending: approvingToken,
  } = useWriteContract();

  const { isSuccess: isProcessSuccess } = useWaitForTransactionReceipt({
    hash: rejectHash ?? acceptHash,
  });

  const { isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const acceptChallenge = (challenge: Challenge) => {
    setAcceptingChallengeId(challenge.challengeId);
    const startTime = BigInt(Math.floor(Date.now() / 1000));
    if (challenge.isTwoSided) {
      approveToken({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [WhoopTokenAddress, BigInt(challenge.challengerAmount)],
      });

      toast({
        title: "Token approval initiated",
        description: "Please confirm the transaction in your wallet.",
      });
    } else {
      acceptChallengeContract({
        address: WhoopTokenAddress,
        abi: WhoopTokenAbi,
        functionName: "acceptChallenge",
        args: [challenge.challengeId, startTime],
      });
      render();
    }
  };

  const rejectChallenge = (challengeId: bigint) => {
    setRejectingChallengeId(challengeId);
    rejectChallengeContract({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "rejectChallenge",
      args: [challengeId],
    });
    render();
  };

  const render = async () => {
    await refetchPendingChallengeData();
    await refetchAcceptedChallenges();
    await refetchRejectedChallenges();
  };

  useEffect(() => {
    if (isApprovalSuccess) {
      toast({
        title: "Token approval confirmed",
        description: "Creating challenge...",
      });

      const startTime = BigInt(Math.floor(Date.now() / 1000));

      acceptChallengeContract({
        address: WhoopTokenAddress,
        abi: WhoopTokenAbi,
        functionName: "acceptChallenge",
        args: [acceptingChallengeId, startTime],
      });
    }
  }, [isApprovalSuccess]);

  useEffect(() => {
    if (isProcessSuccess) {
      render();
      setRejectingChallengeId(null);
      setAcceptingChallengeId(null);
    }
  }, [isProcessSuccess]);

  useEffect(() => {
    if (pendingChallengesData) {
      const activeChallenges = (pendingChallengesData as Challenge[]).filter(
        (challenge: Challenge) => Number(challenge.endTime) * 1000 > Date.now(),
      );
      setPendingChallenges(activeChallenges);
    }
  }, [pendingChallengesData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  return (
    <section>
      <CardHeader>
        <CardTitle>Pending Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {pendingChallenges?.length > 0 ? (
            pendingChallenges?.map((challenge, index) => (
              <Card
                key={index}
                className="mb-4 w-[320px] rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
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
                    <p className="text-sm text-gray-600">
                      <ClockIcon className="mr-1 inline-block h-4 w-4 text-gray-500" />
                      {formatTimeRemaining(challenge.endTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Challenger:</span>{" "}
                      {challenge.challenger.slice(0, 6)}...
                      {challenge.challenger.slice(-4)}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button
                      onClick={() => acceptChallenge(challenge)}
                      variant="secondary"
                      size="sm"
                      disabled={
                        acceptingChallenge ||
                        rejectingChallenge ||
                        approvingToken
                      }
                      className="bg-blue-500 text-white transition-colors hover:bg-blue-600"
                    >
                      <CheckIcon className="mr-1 h-4 w-4" />
                      <span>
                        {acceptingChallengeId === challenge.challengeId
                          ? approvingToken
                            ? "Approving..."
                            : acceptingChallenge
                              ? "Accepting..."
                              : "Accept"
                          : "Accept"}
                      </span>
                    </Button>
                    <Button
                      onClick={() => rejectChallenge(challenge.challengeId)}
                      variant="outline"
                      size="sm"
                      disabled={
                        rejectingChallenge ||
                        acceptingChallenge ||
                        approvingToken
                      }
                      className="border-red-500 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <XIcon className="mr-1 h-4 w-4" />
                      <span>
                        {rejectingChallengeId === challenge.challengeId
                          ? "Rejecting..."
                          : "Reject"}
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p>No pending challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default PendingChallenge;
