/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { type Challenge } from "@/schemas/types/challengeTypes";
import { getBadgeVariant, getChallengeTypeString } from "@/lib/challenge";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";
import { getParticipantNameByAddress } from "@/lib/participant";
import useParticipantsCache from "@/hooks/usersName";

type RejectedChallengeProps = {
  rejectedChallengeData: any;
  isLoading: any;
};

const RejectedChallenge: React.FC<RejectedChallengeProps> = ({
  rejectedChallengeData,
  isLoading,
}) => {
  const [rejectedChallenges, setRejectedChallenges] = useState<Challenge[]>([]);
  const participants = useParticipantsCache();

  useEffect(() => {
    if (rejectedChallengeData) {
      setRejectedChallenges(rejectedChallengeData as Challenge[]);
    }
  }, [rejectedChallengeData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  if (rejectedChallenges?.length <= 0) return null;

  return (
    <section>
      {rejectedChallenges?.length > 0 && (
        <>
          <CardHeader>
            <CardTitle className="text-white">Rejected Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {rejectedChallenges.length > 0 &&
                rejectedChallenges.map((challenge, index) => (
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
                        {challenge.status == (4 || 3) && (
                          <p className="text-sm">
                            <span className="font-semibold">
                              Target Reached:
                            </span>{" "}
                            {challenge.targetReached ? "Yes" : "No"}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-semibold">Challenger:</span>{" "}
                          {getParticipantNameByAddress(
                            participants,
                            challenge.challenger,
                          )}
                        </p>
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

export default RejectedChallenge;
