/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { UserCircle, Wallet } from "lucide-react";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import { type WhoopDataType } from "@/schemas/types/whoopDataTypes";
import ProfileSkeleton from "../skeleton/ProfileSkeleton";
import { useToast } from "../ui/use-toast";
import { useAccount } from "wagmi";

const UserInfo = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [whoopData, setWhoopData] = useState<WhoopDataType | null>(null);
  const { toast } = useToast();
  const account = useAccount();

  const { data: connectionStatus, isLoading: isCheckingConnection } =
    api.whoop.checkWhoopConnection.useQuery();

  const { data: userData, refetch: refetchWhoopData } =
    api.whoop.getWhoopData.useQuery(undefined, {
      enabled: isConnected,
    });

  const { mutate: fetchAndStoreWhoopData } =
    api.whoop.fetchAndStoreWhoopData.useMutation({
      onSuccess: async () => {
        await refetchWhoopData();
      },
    });

  const { mutate: setDefaultAddress, isPending: settingAddress } =
    api.user.setDefaultAddress.useMutation({
      onSuccess: async () => {
        toast({
          title: "Default address added successfully",
        });
        await refetchWhoopData();
      },
      onError: (error) => {
        toast({
          title: error.message,
        });
      },
    });

  const handleSetDefaultAddress = () => {
    setDefaultAddress({ address: String(account.address) });
  };

  useEffect(() => {
    if (connectionStatus?.isConnected) {
      setIsConnected(true);
      fetchAndStoreWhoopData();
    } else {
      setIsConnected(false);
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (userData) {
      setWhoopData(userData as WhoopDataType);
    }
  }, [userData]);

  if (isCheckingConnection) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="relative">
      <div className={` ${isConnected ? "" : "pointer-events-none blur-md"}`}>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold md:text-2xl">
              Your Whoop Profile
            </h2>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-full flex-col items-center justify-center space-y-1 text-center">
                <div>
                  <UserCircle className="h-20 w-20" strokeWidth={1} />
                </div>
                <div className="space-x-1 font-bold">
                  <span>{whoopData?.whoopProfile?.first_name}</span>
                  <span> {whoopData?.whoopProfile?.last_name}</span>
                </div>
                <div className="text-muted-foreground">
                  {whoopData?.whoopProfile?.email}
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <div className="text-4xl font-bold">
                    {whoopData?.whoopBodyMeasurement?.height_meter.toFixed(2) ??
                      0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Height (m)
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-4xl font-bold">
                    {whoopData?.whoopBodyMeasurement?.weight_kilogram.toFixed(
                      2,
                    ) ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Weight (kg)
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-4xl font-bold">
                    {whoopData?.whoopBodyMeasurement?.max_heart_rate ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Heart Rate
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-4xl font-bold">
                    {whoopData?.whoopSleep?.[0]?.score.sleep_efficiency_percentage.toFixed(
                      1,
                    ) ?? 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Latest Sleep Efficiency
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-4xl font-bold">
                    {whoopData?.whoopRecoveries?.[0]?.score.recovery_score ?? 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Latest Recovery Score
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-4xl font-bold">
                    {whoopData?.whoopWorkouts?.[0]?.score.strain.toFixed(1) ??
                      0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Latest Strain
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
        {!whoopData?.defaultAddress && (
          <div className="mt-4 flex flex-col items-center justify-center">
            <Button onClick={handleSetDefaultAddress} disabled={settingAddress}>
              <Wallet className="mr-2 h-5 w-5" />
              {settingAddress
                ? "Setting..."
                : `Set ${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)} wallet as default`}
            </Button>

            {!whoopData?.defaultAddress && (
              <p className="mt-2 text-center text-sm text-red-500">
                Warning: No address available. You wont be able to receive
                challenges without setting a default address.
              </p>
            )}
          </div>
        )}
      </div>
      {!isConnected && (
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
