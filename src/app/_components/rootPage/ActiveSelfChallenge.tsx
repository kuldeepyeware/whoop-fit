/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { type SelfChallenge } from "@/schemas/types/challengeTypes";
import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { ClockIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "../ui/use-toast";
import ActiveSelfChallengeSkeleton from "../skeleton/ActiveSelfChallengeSkeleton";

const AcceptedSelfChallenge = () => {
  const [acceptedChallenges, setAcceptedChallenges] = useState<SelfChallenge[]>(
    [],
  );
  const [checkResultChallengeId, setCheckResultChallengeId] = useState<
    bigint | null
  >(null);
  const { address } = useAccount();
  const { toast } = useToast();

  const {
    data: acceptedChallengesData,
    refetch: refetchAcceptedChallenges,
    isLoading: loadingAcceptedChallenge,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getAcceptedSelfChallengesForUser",
    args: [address],
  });

  const { mutateAsync: updateTargetMutation, isPending } =
    api.user.updateSelfTargetStatus.useMutation({
      onSuccess: () => {
        toast({
          title: "Evaluated result successfully!",
        });
        setCheckResultChallengeId(null);
        refetchAcceptedChallenges();
      },
      onError: () => {
        toast({
          title: "Something went wrong try again later!",
        });
        setCheckResultChallengeId(null);
        refetchAcceptedChallenges();
      },
    });

  const handleCheckResult = async (challenge: SelfChallenge) => {
    setCheckResultChallengeId(challenge.challengeId);
    updateTargetMutation(challenge);
  };

  useEffect(() => {
    if (acceptedChallengesData)
      setAcceptedChallenges(acceptedChallengesData as SelfChallenge[]);
  }, [acceptedChallengesData]);

  if (loadingAcceptedChallenge) {
    return <ActiveSelfChallengeSkeleton />;
  }

  return (
    <section>
      <CardHeader>
        <CardTitle>Active Self Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {acceptedChallenges.length > 0 ? (
            acceptedChallenges.map((challenge, index) => (
              <Card
                key={challenge.challengeId.toString() + index}
                className="mb-4 w-[324px] rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
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
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Target:</span>{" "}
                      {challenge.challengeTarget.toString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <ClockIcon className="mr-1 inline-block h-4 w-4 text-gray-500" />
                      {formatTimeRemaining(challenge.endTime)}
                    </p>
                    {formatTimeRemaining(challenge.endTime) === "Ended" &&
                      challenge.status == 4 && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Target Reached:</span>{" "}
                          {challenge.targetReached ? "Yes" : "No"}
                        </p>
                      )}
                  </div>
                  {formatTimeRemaining(challenge.endTime) === "Ended" &&
                    challenge.status == 1 && (
                      <Button
                        variant="default"
                        className="bg-green-500 text-white transition-colors hover:bg-green-600"
                        disabled={isPending}
                        onClick={() => handleCheckResult(challenge)}
                      >
                        {checkResultChallengeId == challenge.challengeId
                          ? isPending
                            ? "Checking..."
                            : "Check Result"
                          : "Check Result"}
                      </Button>
                    )}
                </div>
              </Card>
            ))
          ) : (
            <p>No self accepted challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default AcceptedSelfChallenge;
