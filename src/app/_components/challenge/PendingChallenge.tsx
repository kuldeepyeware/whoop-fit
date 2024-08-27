/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */

"use client";

import { type Challenge } from "@/schemas/types/challengeTypes";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { Badge } from "../ui/badge";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { tokenAbi, tokenAddress } from "TokenContract";
import { useToast } from "../ui/use-toast";
import ChallengeCardSkeleton from "../skeleton/ChallengeCardSkeleton";
import { useAuth } from "@/hooks/authHook";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { encodeFunctionData } from "viem";

type PendingChallengeProps = {
  pendingChallengesData: any;
  isLoading: any;
  refetchPendingChallengeData: any;
  refetchAcceptedChallenges: any;
  refetchRejectedChallenges: any;
};

const PendingChallenge: React.FC<PendingChallengeProps> = ({
  pendingChallengesData,
  isLoading,
  refetchPendingChallengeData,
  refetchAcceptedChallenges,
  refetchRejectedChallenges,
}) => {
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [acceptingChallengeId, setAcceptingChallengeId] = useState<
    bigint | null
  >(null);
  const [rejectingChallengeId, setRejectingChallengeId] = useState<
    bigint | null
  >(null);
  const [isPending, setIsPending] = useState(false);

  const { smartAccountReady, smartAccountAddress, sendUserOperation } =
    useSmartAccount();

  const { walletReady } = useAuth();

  const { toast } = useToast();

  const acceptChallenge = async (challenge: Challenge) => {
    setAcceptingChallengeId(challenge.challengeId);
    const startTime = BigInt(Math.floor(Date.now() / 1000));

    if (challenge.isTwoSided) {
      if (!smartAccountReady || !smartAccountAddress) {
        toast({
          title: "Smart account is not ready",
          description: "Please wait for the smart account to initialize",
          variant: "destructive",
        });
        setRejectingChallengeId(null);
        setAcceptingChallengeId(null);
        return;
      }

      setIsPending(true);

      const approveTokencallData = encodeFunctionData({
        abi: tokenAbi,
        functionName: "approve",
        args: [WhoopTokenAddress, BigInt(challenge.challengerAmount)],
      });

      const createChallengecallData = encodeFunctionData({
        abi: WhoopTokenAbi,
        functionName: "acceptChallenge",
        args: [challenge.challengeId, startTime],
      });

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await sendUserOperation({
          to: tokenAddress,
          data: approveTokencallData,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await sendUserOperation({
          to: WhoopTokenAddress,
          data: createChallengecallData,
        });

        toast({
          title: "Accepted Challenge successfully!",
        });

        setRejectingChallengeId(null);
        setAcceptingChallengeId(null);
        setIsPending(false);

        await render();
      } catch (error) {
        console.error("Error sending transaction:", error);

        setRejectingChallengeId(null);
        setAcceptingChallengeId(null);
        setIsPending(false);
        toast({
          title: "Error while accepting challenge",
          description:
            "Make sure your account has enough USDC balance because this challenge involves both sides",
          variant: "destructive",
        });
      }
    } else {
      if (!smartAccountReady || !smartAccountAddress) {
        toast({
          title: "Smart account is not ready",
          description: "Please wait for the smart account to initialize",
          variant: "destructive",
        });
        setRejectingChallengeId(null);
        setAcceptingChallengeId(null);
        return;
      }

      setIsPending(true);

      const createChallengecallData = encodeFunctionData({
        abi: WhoopTokenAbi,
        functionName: "acceptChallenge",
        args: [challenge.challengeId, startTime],
      });

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await sendUserOperation({
          to: WhoopTokenAddress,
          data: createChallengecallData,
        });

        toast({
          title: "Accepted Challenge successfully!",
        });

        setRejectingChallengeId(null);
        setAcceptingChallengeId(null);
        setIsPending(false);

        await render();
      } catch (error) {
        console.error("Error sending transaction:", error);

        setRejectingChallengeId(null);
        setAcceptingChallengeId(null);
        setIsPending(false);

        toast({
          title: "Error while creating challenge",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  const rejectChallenge = async (challengeId: bigint) => {
    if (!smartAccountReady || !smartAccountAddress) {
      toast({
        title: "Smart account is not ready",
        description: "Please wait for the smart account to initialize",
        variant: "destructive",
      });
      return;
    }

    setRejectingChallengeId(challengeId);
    setIsPending(true);

    const rejectChallengecallData = encodeFunctionData({
      abi: WhoopTokenAbi,
      functionName: "rejectChallenge",
      args: [challengeId],
    });

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await sendUserOperation({
        to: WhoopTokenAddress,
        data: rejectChallengecallData,
      });

      toast({
        title: "Rejected Challenge successfully!",
      });

      setRejectingChallengeId(null);
      setAcceptingChallengeId(null);
      setIsPending(false);

      await render();
    } catch (error) {
      console.error("Error sending transaction:", error);

      setRejectingChallengeId(null);
      setAcceptingChallengeId(null);
      setIsPending(false);

      toast({
        title: "Error while rejecting challenge",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const render = async () => {
    await refetchPendingChallengeData();
    await refetchAcceptedChallenges();
    await refetchRejectedChallenges();
  };

  useEffect(() => {
    if (pendingChallengesData) {
      const activeChallenges = (pendingChallengesData as Challenge[]).filter(
        (challenge: Challenge) => Number(challenge.endTime) * 1000 > Date.now(),
      );
      setPendingChallenges(activeChallenges);
    }
  }, [pendingChallengesData]);

  if (isLoading) {
    return <ChallengeCardSkeleton />;
  }

  if (pendingChallenges?.length <= 0) return null;

  return (
    <section>
      {pendingChallenges?.length > 0 && (
        <>
          <CardHeader>
            <CardTitle className="text-white">Pending Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {pendingChallenges?.map((challenge, index) => (
                <Card
                  key={index}
                  className="mb-4 w-[320px] rounded-lg border-none bg-white/10 p-6 text-white shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-lg"
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
                        {challenge.challenger.slice(0, 6)}...
                        {challenge.challenger.slice(-4)}
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => acceptChallenge(challenge)}
                        variant="secondary"
                        size="sm"
                        disabled={!walletReady || isPending}
                        className="bg-blue-500 text-white transition-colors hover:bg-blue-600"
                      >
                        <CheckIcon className="mr-1 h-4 w-4" />
                        <span>
                          {acceptingChallengeId === challenge.challengeId
                            ? "Accepting..."
                            : "Accept"}
                        </span>
                      </Button>
                      <Button
                        onClick={() => rejectChallenge(challenge.challengeId)}
                        variant="outline"
                        size="sm"
                        disabled={!walletReady || isPending}
                        className="border-red-500 text-red-500 transition-colors hover:bg-red-50"
                      >
                        <XIcon className="mr-1 h-4 w-4" />
                        <span>
                          {rejectingChallengeId === challenge.challengeId
                            ? "Rejecting..."
                            : "Reject"}
                        </span>
                      </Button>
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

export default PendingChallenge;
