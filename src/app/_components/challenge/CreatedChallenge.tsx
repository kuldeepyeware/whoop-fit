/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { type Challenge } from "@/schemas/types/challengeTypes";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";
import ChallengeCard from "../common/ChallengeCardAddr";
import { useSmartAccount } from "@/hooks/smartAccountContext";

type CreatedChallengeProps = {
  createdChallengeData: any;
  refetchCreatedChallenges: any;
  isLoading: any;
};

const CreatedChallenge: React.FC<CreatedChallengeProps> = ({
  createdChallengeData,
  refetchCreatedChallenges,
  isLoading,
}) => {
  const [createdChallenges, setCreatedChallenges] = useState<Challenge[]>([]);

  const { smartAccountAddress } = useSmartAccount();

  const render = async () => {
    await refetchCreatedChallenges();
  };

  useEffect(() => {
    if (createdChallengeData) {
      setCreatedChallenges(createdChallengeData as Challenge[]);
    }
  }, [createdChallengeData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  if (createdChallenges?.length <= 0) return null;

  return (
    <section>
      {createdChallenges?.length > 0 && (
        <>
          <CardHeader>
            <CardTitle className="text-white">Created Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {createdChallenges.length > 0 &&
                createdChallenges.map((challenge, index) => (
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

export default CreatedChallenge;
