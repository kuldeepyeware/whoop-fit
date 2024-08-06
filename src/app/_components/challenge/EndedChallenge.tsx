/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { type Challenge } from "@/schemas/types/challengeTypes";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";
import ChallengeCard from "../common/ChallengeCardAddr";

type EndedChallengeProps = {
  endedChallengesData: any;
  refetchEndedChallenges: any;
  isLoading: any;
};

const EndedChallenge: React.FC<EndedChallengeProps> = ({
  endedChallengesData,
  refetchEndedChallenges,
  isLoading,
}) => {
  const [endedChallenges, setEndedChallenges] = useState<Challenge[]>([]);

  const { address } = useAccount();

  const render = async () => {
    await refetchEndedChallenges();
  };

  useEffect(() => {
    if (endedChallengesData) {
      setEndedChallenges(endedChallengesData as Challenge[]);
    }
  }, [endedChallengesData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  return (
    <section>
      <CardHeader>
        <CardTitle>Ended Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {endedChallenges.length > 0 ? (
            endedChallenges.map((challenge, index) => (
              <ChallengeCard
                key={index}
                challenge={challenge}
                address={address as string}
                onClaimComplete={render}
              />
            ))
          ) : (
            <p>No ended challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default EndedChallenge;
