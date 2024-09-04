/* eslint-disable @typescript-eslint/no-floating-promises */

"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { CheckIcon, XIcon, ClockIcon, LockIcon } from "lucide-react";
import { type Challenge } from "@/schemas/types/challengeTypes";
import { formatTimeRemaining, getChallengeTypeString } from "@/lib/challenge";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { useToast } from "@/app/_components/ui/use-toast";
import { encodeFunctionData } from "viem";
import { tokenAbi, tokenAddress } from "TokenContract";
import { Button } from "@/app/_components/ui/button";
import { useRouter } from "next/navigation";
import InvalidChallenge from "@/app/_components/common/InvalidChallenge";
import Loading from "@/app/_components/common/Loading";

const isZeroAddress = (address: string) =>
  address === "0x0000000000000000000000000000000000000000";

const ChallengePage = ({ params }: { params: { id: string } }) => {
  const { user, authenticated, ready } = usePrivy();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isInvalidChallenge, setIsInvalidChallenge] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const { data: challengeData, refetch: refetchData } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getPendingChallengeById",
    args: [BigInt(params.id)],
  });

  const { smartAccountReady, smartAccountAddress, sendUserOperation } =
    useSmartAccount();

  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      if (challengeData === undefined) {
        setIsInvalidChallenge(true);
        setIsReady(true);
        return;
      }

      if (challengeData && (!authenticated || smartAccountReady)) {
        const typedChallengeData = challengeData as Challenge;
        const isZeroChallenger = isZeroAddress(typedChallengeData?.challenger);
        const isInvalidChallenged =
          authenticated &&
          smartAccountReady &&
          smartAccountAddress &&
          typedChallengeData?.challenged !== smartAccountAddress;

        if (isZeroChallenger || isInvalidChallenged) {
          setIsInvalidChallenge(true);
        } else {
          setChallenge(typedChallengeData);
          setIsInvalidChallenge(false);
        }
        setIsReady(true);
      }
    };

    initialize();
  }, [challengeData, authenticated, smartAccountReady, smartAccountAddress]);

  if (!isReady || !ready) {
    return <Loading />;
  }

  if (isInvalidChallenge) {
    return <InvalidChallenge />;
  }

  const handleAccept = async () => {
    if (!user) {
      toast({
        title: "Login to accept challenge",
      });
      return;
    }

    if (!smartAccountReady || !smartAccountAddress) {
      toast({
        title: "Smart account is not ready",
        description: "Please wait for the smart account to initialize",
        variant: "destructive",
      });
      return;
    }

    if (challenge?.challenged !== smartAccountAddress) {
      toast({
        title: "This challenge is not created for you",
        variant: "destructive",
      });
      return;
    }

    const startTime = BigInt(Math.floor(Date.now() / 1000));

    if (challenge?.isTwoSided) {
      setIsProcessing(true);

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

        setIsProcessing(false);

        setIsInvalidChallenge(true);

        await refetchData();
      } catch (error) {
        console.error("Error sending transaction:", error);

        toast({
          title: "Error while accepting challenge",
          description:
            "Make sure your account has enough USDC balance because this challenge involves both sides",
          variant: "destructive",
        });

        setIsProcessing(false);
      }
    } else {
      if (!smartAccountReady || !smartAccountAddress) {
        toast({
          title: "Smart account is not ready",
          description: "Please wait for the smart account to initialize",
          variant: "destructive",
        });
        return;
      }

      if (challenge?.challenged !== smartAccountAddress) {
        toast({
          title: "This challenge is not created for you",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      const createChallengecallData = encodeFunctionData({
        abi: WhoopTokenAbi,
        functionName: "acceptChallenge",
        args: [challenge?.challengeId, startTime],
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

        setIsProcessing(false);

        setIsInvalidChallenge(true);

        await refetchData();
      } catch (error) {
        console.error("Error sending transaction:", error);

        toast({
          title: "Error while creating challenge",
          description: "Please try again",
          variant: "destructive",
        });

        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (!user) {
      toast({
        title: "Login to reject challenge",
      });
      return;
    }

    if (!smartAccountReady || !smartAccountAddress) {
      toast({
        title: "Smart account is not ready",
        description: "Please wait for the smart account to initialize",
        variant: "destructive",
      });
      return;
    }

    if (challenge?.challenged !== smartAccountAddress) {
      toast({
        title: "This challenge is not created for you",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const rejectChallengecallData = encodeFunctionData({
      abi: WhoopTokenAbi,
      functionName: "rejectChallenge",
      args: [challenge?.challengeId],
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

      setIsProcessing(false);

      setIsInvalidChallenge(true);

      await refetchData();
    } catch (error) {
      console.error("Error sending transaction:", error);

      toast({
        title: "Error while rejecting challenge",
        description: "Please try again",
        variant: "destructive",
      });

      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md md:max-w-2xl">
        <div className="md:flex">
          <div className="w-full p-8">
            <h1 className="mt-1 block text-2xl font-medium leading-tight">
              {challenge?.challengeType
                ? getChallengeTypeString(challenge?.challengeType)
                : ""}
            </h1>
            <div className="mt-2">
              {challenge?.challengeType && (
                <>
                  {!challenge?.isTwoSided && (
                    <p className="mt-1 flex items-center">
                      <span className="mr-2 font-semibold">Target:</span>{" "}
                      {[4, 5, 6].includes(challenge?.challengeType)
                        ? `${challenge?.challengeTarget.toString()}% Improvement`
                        : challenge?.challengeTarget.toString()}
                    </p>
                  )}
                </>
              )}
              <p className="mt-1 flex items-center">
                <span className="mr-2 font-semibold">Amount:</span>
                {challenge?.challengerAmount.toString()} USDC
              </p>
              <p className="mt-1 flex items-center">
                <span className="mr-2 font-semibold">1v1:</span>
                {challenge?.isTwoSided ? "Yes" : "No"}
              </p>
              <p className="mt-1 flex items-center">
                <ClockIcon className="mr-2 h-4 w-4" />
                {challenge?.endTime
                  ? formatTimeRemaining(challenge.endTime)
                  : "0"}
              </p>
              <p className="mt-1 flex items-center">
                <span className="mr-2 font-semibold">Challenger:</span>
                {challenge?.challenger.slice(0, 6)}...
                {challenge?.challenger.slice(-4)}
              </p>
            </div>
            {user ? (
              <div className="mt-6 flex justify-between">
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className={`flex items-center rounded px-4 py-2 font-bold text-white ${
                    isProcessing
                      ? "bg-green-400"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Accept"}
                </Button>
                <Button
                  onClick={handleReject}
                  className={`flex items-center rounded px-4 py-2 font-bold text-white ${
                    isProcessing ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Button
                  onClick={() => {
                    router.push("/login");
                  }}
                  className="flex w-full items-center justify-center rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600"
                >
                  <LockIcon className="mr-2 h-4 w-4" />
                  Log In to Respond
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
