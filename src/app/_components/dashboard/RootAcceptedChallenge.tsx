"use client";

import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
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
import { useAuth } from "@/hooks/authHook";
import { useSmartAccount } from "@/hooks/smartAccountContext";

const RootAcceptedChallenge = () => {
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [checkingResultId, setCheckingResultId] = useState<bigint | null>(null);

  const { authenticated, walletReady, privyReady } = useAuth();

  const { smartAccountAddress } = useSmartAccount();

  const { toast } = useToast();

  const {
    data: acceptedChallengesData,
    refetch: refetchAcceptedChallenges,
    isLoading,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getAcceptedChallengesBy",
    args: [smartAccountAddress],
  });

  const { mutateAsync: updateTargetMutation, isPending } =
    api.user.updateTargetStatus.useMutation({
      onSuccess: async () => {
        toast({
          title: "Result Evaluated successfully!",
        });

        setCheckingResultId(null);

        await refetchAcceptedChallenges();
      },
      onError: async () => {
        toast({
          title: "Something went wrong, Please try again later!",
        });
        setCheckingResultId(null);
      },
    });

  const handleResult = async (challenge: Challenge) => {
    setCheckingResultId(challenge.challengeId);
    if (Number(challenge.status) == 1) {
      await updateTargetMutation(challenge);
    } else {
      await refetchAcceptedChallenges();
    }
  };

  useEffect(() => {
    if (acceptedChallengesData) {
      setAcceptedChallenges(acceptedChallengesData as Challenge[]);
    }
  }, [acceptedChallengesData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  return (
    <section>
      <CardHeader>
        <CardTitle className="text-white">Active Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {acceptedChallenges.length > 0 ? (
            acceptedChallenges.map((challenge, index) => (
              <Card
                key={index}
                className="mb-4 w-[320px] rounded-lg border border-none border-gray-200 bg-white bg-white/10 p-6 text-white shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-lg"
              >
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
                    <p className="text-sm">
                      <span className="font-semibold">Target:</span>{" "}
                      {challenge.challengeTarget.toString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Amount:</span>{" "}
                      {challenge.challengerAmount.toString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Two Sided:</span>{" "}
                      {challenge.isTwoSided ? "Yes" : "No"}
                    </p>
                    <p className="flex items-center text-sm">
                      <ClockIcon className="mr-1 inline-block h-4 w-4" />
                      {formatTimeRemaining(challenge.endTime)}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Challenger:</span>{" "}
                      {challenge.challenger.slice(0, 6)}...
                      {challenge.challenger.slice(-4)}
                    </p>
                  </div>
                  {challenge.status == 1 &&
                    formatTimeRemaining(challenge.endTime) == "Ended" && (
                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={() => handleResult(challenge)}
                          variant="default"
                          className="w-full bg-green-500 text-white transition-colors hover:bg-green-600"
                          disabled={
                            isPending ||
                            !privyReady ||
                            !walletReady ||
                            !authenticated
                          }
                        >
                          {checkingResultId === challenge.challengeId
                            ? isPending
                              ? "Updating..."
                              : "Check Result"
                            : "Check Result"}
                        </Button>
                      </div>
                    )}
                </div>
              </Card>
            ))
          ) : (
            <p className="text-white">No active challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default RootAcceptedChallenge;
