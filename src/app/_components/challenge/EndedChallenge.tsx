/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { type Challenge } from "@/schemas/types/challengeTypes";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";
import ChallengeCard from "../common/ChallengeCardAddr";
import { useSmartAccount } from "@/hooks/smartAccountContext";

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

  const { smartAccountAddress } = useSmartAccount();

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

  if (endedChallenges?.length <= 0) return null;

  return (
    <section>
      {endedChallenges?.length > 0 && (
        <>
          <CardHeader>
            <CardTitle className="text-white">Ended Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {endedChallenges.length > 0 &&
                endedChallenges.map((challenge, index) => (
                  <ChallengeCard
                    key={index}
                    challenge={challenge}
                    address={smartAccountAddress as string}
                    onClaimComplete={render}
                  />
                ))}
            </div>
          </CardContent>
        </>
      )}
    </section>
  );
};

export default EndedChallenge;
