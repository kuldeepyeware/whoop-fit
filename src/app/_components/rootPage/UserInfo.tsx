/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ShareIcon, UserCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import { type WhoopDataType } from "@/schemas/types/whoopDataTypes";
import ProfileSkeleton from "../skeleton/ProfileSkeleton";

const UserInfo = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [whoopData, setWhoopData] = useState<WhoopDataType | null>(null);

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

  // console.log(whoopData);

  return (
    <div className="relative">
      <div className={` ${isConnected ? "" : "pointer-events-none blur-md"}`}>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Whoop Profile</h2>
            <Button>
              <ShareIcon className="mr-2 h-5 w-5" />
              Share Profile
            </Button>
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
