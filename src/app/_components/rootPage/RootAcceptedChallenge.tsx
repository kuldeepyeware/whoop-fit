/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useEffect, useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from "wagmi";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { type Challenge } from "@/schemas/types/challengeTypes";
import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { ClockIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "../ui/use-toast";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";

const RootAcceptedChallenge = () => {
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [claimingChallengeID, setClaimingChallengeID] = useState<bigint | null>(
    null,
  );
  const { toast } = useToast();

  const { address } = useAccount();

  const {
    data: acceptedChallengesData,
    refetch: refetchAcceptedChallenges,
    isLoading,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getAcceptedChallengesBy",
    args: [address],
  });

  const { data: claimHash, writeContract: claimChallenge } = useWriteContract(
    {},
  );

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  const { mutateAsync: updateTargetMutation, isPending } =
    api.user.updateTargetStatus.useMutation({
      onSuccess: (data) => {
        claimChallenge({
          address: WhoopTokenAddress,
          abi: WhoopTokenAbi,
          functionName: "claim",
          args: [data.id],
        });
        render();
      },
      onError: () => {
        toast({
          title: "Something went wrong try again later!",
        });
        setClaimingChallengeID(null);
        render();
      },
    });

  const handleClaim = async (challenge: Challenge) => {
    setClaimingChallengeID(challenge.challengeId);
    if (Number(challenge.status) == 1) {
      await updateTargetMutation(challenge);
    } else {
      await render();
    }
  };

  const render = async () => {
    await refetchAcceptedChallenges();
  };

  useEffect(() => {
    if (acceptedChallengesData) {
      setAcceptedChallenges(acceptedChallengesData as Challenge[]);
    }
  }, [acceptedChallengesData]);

  useEffect(() => {
    if (isClaimSuccess) {
      toast({
        title: "Claimed reward successfully!",
      });
      setClaimingChallengeID(null);
      render();
    }
  }, [isClaimSuccess]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  return (
    <section>
      <CardHeader>
        <CardTitle>Accepted Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {acceptedChallenges.length > 0 ? (
            acceptedChallenges.map((challenge, index) => (
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
                  {challenge.status == 1 &&
                    formatTimeRemaining(challenge.endTime) == "Ended" && (
                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={() => handleClaim(challenge)}
                          variant="default"
                          className="w-full bg-green-500 text-white transition-colors hover:bg-green-600"
                          disabled={isPending || isClaimLoading}
                        >
                          {claimingChallengeID === challenge.challengeId
                            ? isPending
                              ? "Updating..."
                              : isClaimLoading
                                ? "Claiming..."
                                : "Check Result"
                            : "Check Result"}
                        </Button>
                      </div>
                    )}
                </div>
              </Card>
            ))
          ) : (
            <p>No accepted challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default RootAcceptedChallenge;
