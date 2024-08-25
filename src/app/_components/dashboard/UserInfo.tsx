"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Copy,
  CopyCheck,
  CopyCheckIcon,
  ShareIcon,
  UserCircle,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import ProfileSkeleton from "../skeleton/ProfileSkeleton";
import { useAuth } from "@/hooks/authHook";
import type { ProfileUserData } from "@/schemas/types/whoopDataTypes";
import { env } from "@/env";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { useReadContract } from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import Link from "next/link";

const UserInfo = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [whoopData, setWhoopData] = useState<ProfileUserData | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const { authenticated } = useAuth();

  const { smartAccountAddress, smartAccountReady } = useSmartAccount();

  const { data: moneyEarnedData } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getUserWinnings",
    args: [smartAccountAddress],
  });

  const { data: connectionStatus, isLoading: isCheckingConnection } =
    api.whoop.checkWhoopConnection.useQuery(undefined, {
      enabled: authenticated,
    });

  const { data: userData } = api.whoop.getWhoopProfileData.useQuery(undefined, {
    enabled: isConnected && authenticated,
  });

  const handleCopy = async (smartAccountAddress: string) => {
    try {
      await navigator.clipboard.writeText(smartAccountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyProfile = async (id: string) => {
    try {
      const link = `${env.NEXT_PUBLIC_DOMAIN_URL}profile/${id}`;
      await navigator.clipboard.writeText(link);
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (connectionStatus?.isConnected) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (userData) {
      setWhoopData(userData as unknown as ProfileUserData);
    }
  }, [userData]);

  if (isCheckingConnection || !smartAccountReady) {
    return <ProfileSkeleton />;
  }

  return (
    <div className={`relative ${!authenticated && "px-6"}`}>
      <div
        className={` ${isConnected ? "" : "pointer-events-none min-h-[200px] blur-md"}`}
      >
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white md:text-2xl">
              Your Whoop Profile
            </h2>
            <Button
              className="bg-white text-black hover:bg-white/90"
              onClick={() => handleCopyProfile(whoopData?.id ?? "")}
            >
              {copiedProfile ? (
                <>
                  <CopyCheckIcon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <ShareIcon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span>Copy Profile Link</span>
                </>
              )}
            </Button>
          </div>
          <div className="mt-6 grid gap-6 text-white md:grid-cols-[200px_1fr]">
            {authenticated && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-full flex-col items-center justify-center space-y-1 text-center">
                    <div>
                      <UserCircle className="h-20 w-20" strokeWidth={1} />
                    </div>
                    <div className="space-x-1 font-bold">
                      <span>{whoopData?.whoopProfile[0]?.firstName}</span>
                      <span> {whoopData?.whoopProfile[0]?.lastName}</span>
                    </div>
                    <div>{whoopData?.whoopProfile[0]?.email}</div>
                    {whoopData?.smartAccountAddress && (
                      <div className="flex items-center justify-center gap-2">
                        <div>
                          {whoopData?.smartAccountAddress?.slice(0, 6)}...
                          {whoopData?.smartAccountAddress?.slice(-4)}
                        </div>
                        <div
                          onClick={() =>
                            handleCopy(whoopData.smartAccountAddress!)
                          }
                          className="cursor-pointer"
                        >
                          {copied ? (
                            <CopyCheck className="h-4 w-4" strokeWidth={1} />
                          ) : (
                            <Copy className="h-4 w-4" strokeWidth={1} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {Number(whoopData?.whoopCycles[0]?.strain ?? 0).toFixed(
                          1,
                        )}
                      </div>
                      <div className="text-sm"> Strain</div>
                    </Card>

                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {Number(
                          whoopData?.whoopRecoveries[0]?.recoveryScore ?? 0,
                        ).toFixed(2)}
                        %
                      </div>
                      <div className="text-sm">Recovery Score</div>
                    </Card>

                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {Number(
                          whoopData?.whoopSleeps[0]
                            ?.sleepEfficiencyPercentage ?? 0,
                        ).toFixed(2)}
                        %
                      </div>
                      <div className="text-sm"> Sleep Efficiency</div>
                    </Card>
                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {Number(
                          Number(whoopData?.whoopCycles[0]?.kilojoule ?? 0) *
                            0.239006 ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm">Calories</div>
                    </Card>
                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {Number(
                          whoopData?.whoopRecoveries[0]?.hrvRmssd ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm">Heart Rate Variability</div>
                    </Card>
                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {whoopData?.whoopRecoveries[0]?.restingHeartRate ?? 0}
                      </div>
                      <div className="text-sm">Resting Heart Rate</div>
                    </Card>
                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {whoopData?.challengeCompleted ?? 0}
                      </div>
                      <div className="text-sm">Challenges Completed</div>
                    </Card>
                    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                      <div className="text-3xl font-bold md:text-4xl">
                        {Number(moneyEarnedData ?? 0)} USDC
                      </div>
                      <div className="text-sm">Money Earned</div>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      {!isConnected && authenticated && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ConnectWHOOP />
        </div>
      )}
      {isConnected && authenticated && (
        <div className="mb-5 mt-7 flex justify-center">
          <Link href="/users">
            <Button className="rounded-md bg-white text-black hover:bg-white/70">
              Start Challenges
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

const ConnectWHOOP = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { mutate: getAuthUrl } = api.whoop.getAuthUrl.useMutation({
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    getAuthUrl();
  };

  return (
    <Button
      className="rounded-md bg-white text-black hover:bg-white/70"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect WHOOP"}
    </Button>
  );
};

export default UserInfo;
