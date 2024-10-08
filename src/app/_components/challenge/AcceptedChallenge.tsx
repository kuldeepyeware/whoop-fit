/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */

"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { getParticipantNameByAddress } from "@/lib/participant";
import useParticipantsCache from "@/hooks/usersName";

type AcceptedChallengeProps = {
  acceptedChallengesData: any;
  refetchAcceptedChallenges: any;
  isLoading: any;
  refetchCreatedChallenges: any;
  refetchEndedChallenges: any;
};

const AcceptedChallenge: React.FC<AcceptedChallengeProps> = ({
  acceptedChallengesData,
  refetchAcceptedChallenges,
  isLoading,
  refetchCreatedChallenges,
  refetchEndedChallenges,
}) => {
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [checkingResultId, setCheckingResultId] = useState<bigint | null>(null);

  const { toast } = useToast();
  const participants = useParticipantsCache();

  const { mutateAsync: updateTargetMutation, isPending } =
    api.user.updateTargetStatus.useMutation({
      onSuccess: async () => {
        toast({
          title: "Result Evaluated successfully!",
        });

        setCheckingResultId(null);

        await render();
      },
      onError: async () => {
        toast({
          title: "Something went wrong, Please try again later!",
        });
        setCheckingResultId(null);
      },
    });

  const { mutateAsync: updateTargetMutation1v1, isPending: Pending1v1 } =
    api.user.update1v1ChallengeStatus.useMutation({
      onSuccess: async () => {
        toast({
          title: "Result Evaluated successfully!",
        });

        setCheckingResultId(null);

        await render();
      },
      onError: async () => {
        toast({
          title: "Something went wrong, Please try again later!",
        });
        setCheckingResultId(null);
      },
    });

  const handleClaim = async (challenge: Challenge) => {
    setCheckingResultId(challenge.challengeId);
    if (Number(challenge.status) == 1) {
      if (challenge.isTwoSided) {
        await updateTargetMutation1v1(challenge);
      } else {
        await updateTargetMutation(challenge);
      }
    } else {
      await render();
    }
  };

  const render = async () => {
    await refetchAcceptedChallenges();
    await refetchCreatedChallenges();
    await refetchEndedChallenges();
  };

  useEffect(() => {
    if (acceptedChallengesData) {
      setAcceptedChallenges(acceptedChallengesData as Challenge[]);
    }
  }, [acceptedChallengesData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  if (acceptedChallenges?.length <= 0) return null;

  return (
    <section>
      {acceptedChallenges?.length > 0 && (
        <>
          <CardHeader>
            <CardTitle className="text-white">Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {acceptedChallenges.length > 0 &&
                acceptedChallenges.map((challenge, index) => (
                  <Card
                    key={index}
                    className="mb-4 w-[310px] rounded-lg border-none bg-white/10 p-6 text-white shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-lg"
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
                        <p className="flex items-center text-sm">
                          <ClockIcon className="mr-1 inline-block h-4 w-4" />
                          {formatTimeRemaining(challenge.endTime)}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Challenger:</span>{" "}
                          {getParticipantNameByAddress(
                            participants,
                            challenge.challenger,
                          )}
                        </p>
                      </div>
                      {challenge.status == 1 &&
                        formatTimeRemaining(challenge.endTime) == "Ended" && (
                          <div className="flex justify-center space-x-2">
                            <Button
                              onClick={() => handleClaim(challenge)}
                              variant="default"
                              className="w-full bg-green-500 text-white transition-colors hover:bg-green-600"
                              disabled={isPending || Pending1v1}
                            >
                              {checkingResultId === challenge.challengeId
                                ? "Updating..."
                                : "Check Result"}
                            </Button>
                          </div>
                        )}
                      <div className="mt-3 flex justify-center space-x-2">
                        <Link
                          href={`/challenge/${challenge.challengeId}`}
                          prefetch={true}
                          className="w-full rounded-md bg-white p-2 text-center font-medium text-black transition-colors hover:bg-white/80"
                        >
                          View Challenge
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </CardContent>
        </>
      )}
    </section>
  );
};

export default AcceptedChallenge;
