/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { type Challenge } from "@/schemas/types/challengeTypes";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";
import ChallengeCard from "../common/ChallengeCardAddr";
import { useAccount } from "wagmi";

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

  const { address } = useAccount();

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

  return (
    <section>
      <CardHeader>
        <CardTitle>Created Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {createdChallenges.length > 0 ? (
            createdChallenges.map((challenge, index) => (
              <ChallengeCard
                key={index}
                challenge={challenge}
                address={address as string}
                onClaimComplete={render}
              />
            ))
          ) : (
            <p>No Created challenges</p>
          )}
        </div>
      </CardContent>
    </section>
  );
};

export default CreatedChallenge;
