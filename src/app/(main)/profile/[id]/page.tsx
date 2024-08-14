/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

// @ts-nocheck

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useAuth } from "@/hooks/authHook";
import { Button } from "@/app/_components/ui/button";
import { Swords, CircleDollarSign, UserCircle } from "lucide-react";
import type { ProfileUserData } from "@/schemas/types/whoopDataTypes";
import ChallengeDialog from "@/app/_components/profile/ChallengeDialog";
import { Card } from "@/app/_components/ui/card";

const ProfilePage = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const [profileData, setProfileData] = useState<ProfileUserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [challengeType, setChallengeType] = useState<"1v1" | "sponsor">("1v1");

  const { authenticated } = useAuth();

  const { data: connectionStatus } = api.whoop.checkWhoopConnection.useQuery(
    undefined,
    {
      enabled: authenticated,
    },
  );

  const { data: userData, isLoading } =
    api.whoop.getWhoopPublicProfileData.useQuery(
      { privyId: id },
      // {
      //   enabled: authenticated && id,
      // },
    );

  useEffect(() => {
    if (userData) {
      // setProfileData(userData as ProfileUserData);
    }
  }, [userData]);

  const openChallengeDialog = (type: "1v1" | "sponsor") => {
    setChallengeType(type);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <div>Please log in to view this profile.</div>;
  }

  if (!connectionStatus?.isConnected) {
    return <div>Invalid profile. Whoop connection not established.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {profileData ? (
        <>
          <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
            {authenticated && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-full flex-col items-center justify-center space-y-1 text-center">
                    <div>
                      <UserCircle className="h-20 w-20" strokeWidth={1} />
                    </div>
                    <div className="space-x-1 font-bold">
                      <span>{profileData?.whoopProfile[0]?.firstName}</span>
                      <span> {profileData?.whoopProfile[0]?.lastName}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {profileData?.whoopProfile[0]?.email}
                    </div>
                    {profileData?.smartAccountAddress && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-muted-foreground">
                          {profileData?.smartAccountAddress?.slice(0, 6)}...
                          {profileData?.smartAccountAddress?.slice(-4)}
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
                          profileData?.whoopBodyMeasurements[0]?.height ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Height (m)
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          profileData?.whoopBodyMeasurements[0]?.weight ?? 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Weight (kg)
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {profileData?.whoopBodyMeasurements[0]?.maxHeartRate ??
                          0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Max Heart Rate
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          profileData?.whoopSleeps[0]
                            ?.sleepEfficiencyPercentage ?? 0,
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Latest Sleep Efficiency
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {profileData?.whoopRecoveries[0]?.recoveryScore ?? 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Latest Recovery Score
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-4xl font-bold">
                        {Number(
                          profileData?.whoopWorkouts[0]?.strain ?? 0,
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
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              variant="outline"
              className="space-x-2 p-5"
              onClick={() => openChallengeDialog("1v1")}
            >
              <Swords className="h-5 w-5" />
              <span>1v1 Challenge</span>
            </Button>
            <Button
              variant="outline"
              className="space-x-2 p-5"
              onClick={() => openChallengeDialog("sponsor")}
            >
              <CircleDollarSign className="h-5 w-5" />
              <span>Sponsor</span>
            </Button>
          </div>
          <ChallengeDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            challengeType={challengeType}
            targetUser={profileData}
          />
        </>
      ) : (
        <div>User not found</div>
      )}
    </div>
  );
};

export default ProfilePage;
