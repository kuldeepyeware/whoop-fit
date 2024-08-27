"use client";

import AcceptedChallenge from "@/app/_components/challenge/AcceptedChallenge";
import CreatedChallenge from "@/app/_components/challenge/CreatedChallenge";
import EndedChallenge from "@/app/_components/challenge/EndedChallenge";
import PendingChallenge from "@/app/_components/challenge/PendingChallenge";
import RejectedChallenge from "@/app/_components/challenge/RejectedChallenge";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { useReadContract } from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";

const Challenges = () => {
  const { smartAccountAddress } = useSmartAccount();

  const {
    data: pendingChallengesData,
    isLoading: pendingLoading,
    refetch: refetchPendingChallengeData,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getPendingChallengesForUser",
    args: [smartAccountAddress],
  });

  const {
    data: acceptedChallengesData,
    refetch: refetchAcceptedChallenges,
    isLoading: acceptedLoading,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getAcceptedChallengesBy",
    args: [smartAccountAddress],
  });

  const {
    data: createdChallengeData,
    isLoading: createdLoading,
    refetch: refetchCreatedChallenges,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getChallengesCreatedBy",
    args: [smartAccountAddress],
  });

  const {
    data: rejectedChallengeData,
    refetch: refetchRejectedChallenges,
    isLoading: rejectedLoading,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getRejectedChallengesBy",
    args: [smartAccountAddress],
  });

  const {
    data: endedChallengesData,
    isLoading: endedLoading,
    refetch: refetchEndedChallenges,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getEndedChallengesForUser",
    args: [smartAccountAddress],
  });

  return (
    <div className="space-y-5 px-4 py-10 md:px-6">
      <PendingChallenge
        pendingChallengesData={pendingChallengesData}
        isLoading={pendingLoading}
        refetchPendingChallengeData={refetchPendingChallengeData}
        refetchAcceptedChallenges={refetchAcceptedChallenges}
        refetchRejectedChallenges={refetchRejectedChallenges}
      />
      <AcceptedChallenge
        acceptedChallengesData={acceptedChallengesData}
        refetchAcceptedChallenges={refetchAcceptedChallenges}
        refetchCreatedChallenges={refetchCreatedChallenges}
        refetchEndedChallenges={refetchEndedChallenges}
        isLoading={acceptedLoading}
      />
      <CreatedChallenge
        createdChallengeData={createdChallengeData}
        refetchCreatedChallenges={refetchCreatedChallenges}
        isLoading={createdLoading}
      />
      <EndedChallenge
        endedChallengesData={endedChallengesData}
        refetchEndedChallenges={refetchEndedChallenges}
        isLoading={endedLoading}
      />
      <RejectedChallenge
        rejectedChallengeData={rejectedChallengeData}
        isLoading={rejectedLoading}
      />
    </div>
  );
};

export default Challenges;
