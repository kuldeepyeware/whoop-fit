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

const UserInfo = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [whoopData, setWhoopData] = useState<ProfileUserData | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const { authenticated, walletReady } = useAuth();

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

  if (isCheckingConnection || !walletReady) {
    return <ProfileSkeleton />;
  }

  return (
    <div className={`relative ${!authenticated && "px-6"}`}>
      <div
        className={` ${isConnected ? "" : "pointer-events-none min-h-[200px] blur-md"}`}
      >
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold md:text-2xl">
              Your Whoop Profile
            </h2>
            <Button onClick={() => handleCopyProfile(whoopData?.id ?? "")}>
              {copiedProfile ? (
                <>
                  <CopyCheckIcon className="mr-2 h-5 w-5" />
                  Copied
                </>
              ) : (
                <>
                  <ShareIcon className="mr-2 h-5 w-5" />
                  Copy Profile Link{" "}
                </>
              )}
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
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
                    <div className="text-muted-foreground">
                      {whoopData?.whoopProfile[0]?.email}
                    </div>
                    {whoopData?.smartAccountAddress && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-muted-foreground">
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
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          whoopData?.whoopBodyMeasurements[0]?.height ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Height (m)
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          whoopData?.whoopBodyMeasurements[0]?.weight ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Weight (kg)
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {whoopData?.whoopBodyMeasurements[0]?.maxHeartRate ?? 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Max Heart Rate
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          whoopData?.whoopSleeps[0]
                            ?.sleepEfficiencyPercentage ?? 0,
                        ).toFixed(2)}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Latest Sleep Efficiency
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          whoopData?.whoopRecoveries[0]?.recoveryScore ?? 0,
                        ).toFixed(2)}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Latest Recovery Score
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          whoopData?.whoopWorkouts[0]?.strain ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Latest Strain
                      </div>
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
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect WHOOP"}
    </Button>
  );
};

export default UserInfo;
