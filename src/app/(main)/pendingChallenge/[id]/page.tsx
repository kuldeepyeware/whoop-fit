/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { CheckIcon, XIcon, ClockIcon, LockIcon } from "lucide-react";
import { type Challenge } from "@/schemas/types/challengeTypes";
import { formatTimeRemaining, getChallengeTypeString } from "@/lib/challenge";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import Link from "next/link";
import { useToast } from "@/app/_components/ui/use-toast";
import { encodeFunctionData } from "viem";
import { tokenAbi, tokenAddress } from "TokenContract";

const isZeroAddress = (address: string) =>
  address === "0x0000000000000000000000000000000000000000";

const ChallengePage = ({ params }: { params: { id: string } }) => {
  const { user, login, authenticated } = usePrivy();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidChallenge, setIsInvalidChallenge] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (challengeData && smartAccountReady) {
      const typedChallengeData = challengeData as Challenge;
      if (
        !isZeroAddress(typedChallengeData?.challenger)
        // &&  typedChallengeData?.challenged === smartAccountAddress
      ) {
        setChallenge(challengeData as Challenge);
        setIsInvalidChallenge(false);
      } else {
        setIsInvalidChallenge(true);
      }
      setIsLoading(false);
    } else {
      // setIsInvalidChallenge(true);
      console.log("ener 3");
      setIsLoading(false);
    }
  }, [challengeData, smartAccountReady, smartAccountAddress]);

  const handleAccept = async () => {
    if (!user) {
      toast({
        title: "Login to accept challenge",
      });
      return;
    }

    const startTime = BigInt(Math.floor(Date.now() / 1000));

    if (challenge?.isTwoSided) {
      if (!smartAccountReady || !smartAccountAddress) {
        toast({
          title: "Smart account is not ready",
          description: "Please wait for the smart account to initialize",
          variant: "destructive",
        });
        return;
      }

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

  if (isLoading || (authenticated && !smartAccountReady)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-xl font-semibold">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (isInvalidChallenge) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Invalid Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            The challenge you are trying to view is not valid
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" passHref>
              <p className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600">
                Back to Home
              </p>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
        <div className="md:flex">
          <div className="w-full p-8">
            <h1 className="mt-1 block text-xl font-medium leading-tight text-black">
              {challenge?.challengeType
                ? getChallengeTypeString(challenge?.challengeType)
                : ""}
            </h1>
            <div className="mt-2 text-gray-500">
              <p className="flex items-center">
                <span className="mr-2 font-semibold">Target:</span>
                {challenge?.challengeTarget.toString()}
              </p>
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
                <button
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
                </button>
                <button
                  onClick={handleReject}
                  className={`flex items-center rounded px-4 py-2 font-bold text-white ${
                    isProcessing ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Accept"}
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={login}
                  className="flex w-full items-center justify-center rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600"
                >
                  <LockIcon className="mr-2 h-4 w-4" />
                  Log In to Respond
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
