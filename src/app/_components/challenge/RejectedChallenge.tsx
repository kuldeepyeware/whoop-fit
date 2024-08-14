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
import {
  // formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
// import { ClockIcon } from "lucide-react";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";

type RejectedChallengeProps = {
  rejectedChallengeData: any;
  isLoading: any;
};

const RejectedChallenge: React.FC<RejectedChallengeProps> = ({
  rejectedChallengeData,
  isLoading,
}) => {
  const [rejectedChallenges, setRejectedChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    if (rejectedChallengeData) {
      setRejectedChallenges(rejectedChallengeData as Challenge[]);
    }
  }, [rejectedChallengeData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  return (
    <section>
      <CardHeader>
        <CardTitle>Rejected Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {rejectedChallenges.length > 0 ? (
            rejectedChallenges.map((challenge, index) => (
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
                      {challenge.challengerAmount.toString()} USDC
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">1v1:</span>{" "}
                      {challenge.isTwoSided ? "Yes" : "No"}
                    </p>
                    {challenge.status == (4 || 3) && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Target Reached:</span>{" "}
                        {challenge.targetReached ? "Yes" : "No"}
                      </p>
                    )}
                    {/* <p className="text-sm text-gray-600">
                      <ClockIcon className="mr-1 inline-block h-4 w-4 text-gray-500" />
                      {formatTimeRemaining(challenge.endTime)}
                    </p> */}
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Challenger:</span>{" "}
                      {challenge.challenger.slice(0, 6)}...
                      {challenge.challenger.slice(-4)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p>No rejected challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default RejectedChallenge;
