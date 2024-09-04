"use client";

import React, { useMemo } from "react";
import { useReadContract } from "wagmi";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Clock, type LucideIcon } from "lucide-react";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import {
  getBadgeVariant,
  getChallengeTypeIcon,
  getUnitForChallengeType,
} from "@/lib/challenge";
import { getChallengeTypeString } from "@/lib/challenge";
import { formatTimeRemaining } from "@/lib/challenge";
import InvalidChallenge from "@/app/_components/common/InvalidChallenge";
import Loading from "@/app/_components/common/Loading";
import ChallengeMetric from "@/app/_components/challenge/ChallengeMetric";
import { type Challenge } from "@/schemas/types/challengeTypes";
import { useToast } from "@/app/_components/ui/use-toast";
import useParticipantsCache from "@/hooks/usersName";
import { getParticipantNameByAddress } from "@/lib/participant";

interface WhoopMetrics {
  overallAverage: number;
  sleepPerformanceImprovement?: number;
  recoveryImprovement?: number;
  strainImprovement?: number;
  caloriesImprovement?: number;
  sleepPerformanceImprovementSage?: number;
  sleepConsistencyImprovement?: number;
  sleepEfficiencyImprovement?: number;
  strainImprovementWizard?: number;
  caloriesImprovementWizard?: number;
}

interface WhoopData {
  challenger: WhoopMetrics;
  challenged: WhoopMetrics;
}

const ChallengePage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const {
    data: challengeData,
    isLoading,
    refetch,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "challenges",
    args: [BigInt(params.id)],
  });
  const { toast } = useToast();

  const participants = useParticipantsCache();

  const formattedChallengeData = useMemo<Challenge | null>(() => {
    if (
      !challengeData ||
      !Array.isArray(challengeData) ||
      challengeData.length < 12
    ) {
      return null;
    }

    return {
      challengeId: BigInt(challengeData[0] as bigint),
      challenger: challengeData[1] as string,
      challenged: challengeData[2] as string,
      tokenAddress: challengeData[3] as string,
      challengerAmount: BigInt(challengeData[4] as bigint),
      startTime: BigInt(challengeData[5] as bigint),
      endTime: BigInt(challengeData[6] as bigint),
      status: Number(challengeData[7]),
      challengeType: Number(challengeData[8]),
      challengeTarget: BigInt(challengeData[9] as bigint),
      targetReached: challengeData[10] as boolean,
      isTwoSided: challengeData[11] as boolean,
      isCompleted: false,
    };
  }, [challengeData]);

  const { data: whoopData, isLoading: challengeDataLoading } =
    api.whoop.getChallengeWhoopData.useQuery(
      {
        challenger: String(formattedChallengeData?.challenger),
        challenged: String(formattedChallengeData?.challenged),
        startTime: String(formattedChallengeData?.startTime),
        endTime: String(formattedChallengeData?.endTime),
        challengeType: Number(formattedChallengeData?.challengeType),
        isTwoSided: Boolean(formattedChallengeData?.isTwoSided),
      },
      {
        enabled:
          !!formattedChallengeData && formattedChallengeData.status === 1,
      },
    );

  const { mutateAsync: updateTargetMutation, isPending } =
    api.user.updateTargetStatus.useMutation({
      onSuccess: async () => {
        toast({
          title: "Result Evaluated successfully!",
          description: "Checkout Dashboard Ended Challenges",
        });
        await refetch();
      },
      onError: async () => {
        toast({
          title: "Something went wrong, Please try again later!",
        });
      },
    });

  const { mutateAsync: updateTargetMutation1v1, isPending: Pending1v1 } =
    api.user.update1v1ChallengeStatus.useMutation({
      onSuccess: async () => {
        toast({
          title: "Result Evaluated successfully!",
          description: "Checkout Dashboard Ended Challenges",
        });
        await refetch();
      },
      onError: async () => {
        toast({
          title: "Something went wrong, Please try again later!",
        });
      },
    });

  const handleClaim = async (challenge: Challenge) => {
    if (Number(challenge.status) == 1) {
      if (challenge.isTwoSided) {
        await updateTargetMutation1v1(challenge);
      } else {
        await updateTargetMutation(challenge);
      }
    }
  };

  if (isLoading || challengeDataLoading) return <Loading />;

  if (formattedChallengeData?.status !== 1) return <InvalidChallenge />;

  const renderMetrics = (
    metrics: {
      title: string;
      value: string;
      unit: string;
      icon: LucideIcon;
      comparision?: boolean;
    }[],
  ) => {
    return metrics.map((metric, index) => (
      <ChallengeMetric key={index} {...metric} />
    ));
  };

  const getMetrics = (
    whoopMetrics: WhoopMetrics,
    challengeType: number,
    opponentMetrics: WhoopMetrics | null,
    challengeTarget: bigint,
    isTwoSided: boolean,
  ) => {
    const metrics: {
      title: string;
      value: string;
      unit: string;
      icon: LucideIcon;
      comparision?: boolean;
    }[] = [];

    const addMetric = (
      title: string,
      value: string,
      unit: string,
      icon: LucideIcon,
      comparision?: boolean,
    ) => {
      metrics.push({ icon, title, value, unit, comparision });
    };

    const comparision = isTwoSided
      ? opponentMetrics &&
        whoopMetrics.overallAverage < opponentMetrics.overallAverage
      : whoopMetrics.overallAverage < Number(challengeTarget);

    const unit = getUnitForChallengeType(challengeType);
    const icon = getChallengeTypeIcon(challengeType);

    addMetric(
      "Overall Average",
      String(whoopMetrics.overallAverage),
      unit,
      icon,
      comparision!,
    );

    if (challengeType >= 4) {
      switch (challengeType) {
        case 4: // All-Around Avenger
          addMetric(
            "Sleep Performance",
            String(whoopMetrics.sleepPerformanceImprovement ?? 0),
            "%",
            getChallengeTypeIcon(challengeType),
          );
          addMetric(
            "Recovery",
            String(whoopMetrics.recoveryImprovement ?? 0),
            "",
            getChallengeTypeIcon(challengeType),
          );
          addMetric(
            "Strain",
            String(whoopMetrics.strainImprovement ?? 0),
            "",
            getChallengeTypeIcon(challengeType),
          );
          addMetric(
            "Calories",
            String(whoopMetrics.caloriesImprovement ?? 0),
            "kcal",
            getChallengeTypeIcon(challengeType),
          );
          break;
        case 5: // Sleep Sage
          addMetric(
            "Sleep Performance",
            String(whoopMetrics.sleepPerformanceImprovementSage ?? 0),
            "%",
            getChallengeTypeIcon(challengeType),
          );
          addMetric(
            "Sleep Consistency",
            String(whoopMetrics.sleepConsistencyImprovement ?? 0),
            "%",
            getChallengeTypeIcon(challengeType),
          );
          addMetric(
            "Sleep Efficiency",
            String(whoopMetrics.sleepEfficiencyImprovement ?? 0),
            "%",
            getChallengeTypeIcon(challengeType),
          );
          break;
        case 6: // Workout Wizard
          addMetric(
            "Strain",
            String(whoopMetrics.strainImprovementWizard ?? 0),
            "",
            getChallengeTypeIcon(challengeType),
          );
          addMetric(
            "Calories",
            String(whoopMetrics.caloriesImprovementWizard ?? 0),
            "kcal",
            getChallengeTypeIcon(challengeType),
          );
          break;
      }
    }

    return metrics;
  };

  return (
    <div className="mx-auto w-[90%] p-4 md:w-[70%]">
      <h1 className="mb-6 text-center text-3xl font-bold text-white md:text-left">
        Challenge Details
      </h1>
      <Card className="mb-4 overflow-hidden rounded-lg border-none bg-white/10 text-white shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {getChallengeTypeString(
                Number(formattedChallengeData.challengeType),
              )}
            </h2>
            <Badge
              className="rounded-md px-2 py-1 text-xs"
              variant={getBadgeVariant(formattedChallengeData.status)}
            >
              {getBadgeVariant(formattedChallengeData.status)}
            </Badge>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full space-y-4 md:w-1/3">
              <div className="rounded-lg bg-white/5 p-4">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Challenge Info
                </h3>
                {!formattedChallengeData.isTwoSided && (
                  <p>
                    <span className="font-semibold text-white">Target: </span>
                    {[4, 5, 6].includes(
                      Number(formattedChallengeData.challengeType),
                    )
                      ? `${formattedChallengeData.challengeTarget.toString()}% Improvement`
                      : formattedChallengeData.challengeTarget.toString()}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Amount:</span>{" "}
                  {formattedChallengeData.challengerAmount.toString()} USDC
                </p>
                <p>
                  <span className="font-semibold">Start:</span>{" "}
                  {format(
                    new Date(Number(formattedChallengeData.startTime) * 1000),
                    "PPP",
                  )}
                </p>
                <p>
                  <span className="font-semibold">End:</span>{" "}
                  {format(
                    new Date(Number(formattedChallengeData.endTime) * 1000),
                    "PPP",
                  )}
                </p>
                <p className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {formatTimeRemaining(formattedChallengeData.endTime)}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Participants
                </h3>
                <p>
                  <span className="font-semibold">Challenger:</span>{" "}
                  {getParticipantNameByAddress(
                    participants,
                    formattedChallengeData.challenger,
                  )}
                </p>
                <p>
                  <span className="font-semibold">Challenged:</span>{" "}
                  {getParticipantNameByAddress(
                    participants,
                    formattedChallengeData.challenged,
                  )}
                </p>
              </div>
            </div>

            {formattedChallengeData.isTwoSided ? (
              <div className="flex w-full flex-col md:w-3/4 md:flex-row md:space-x-2">
                <div className="w-full md:w-2/4">
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Your Metrics
                  </h3>
                  {renderMetrics(
                    getMetrics(
                      (whoopData as WhoopData).challenged,
                      formattedChallengeData.challengeType,
                      (whoopData as WhoopData).challenger,
                      formattedChallengeData.challengeTarget,
                      true,
                    ),
                  )}
                </div>
                <div className="w-full md:w-2/4">
                  <h3 className="mb-3 space-x-1 text-lg font-semibold text-white">
                    <span>
                      {getParticipantNameByAddress(
                        participants,
                        formattedChallengeData.challenger,
                      )}
                    </span>
                    <span>Metrics</span>
                  </h3>
                  {renderMetrics(
                    getMetrics(
                      (whoopData as WhoopData).challenger,
                      formattedChallengeData.challengeType,
                      (whoopData as WhoopData).challenged,
                      formattedChallengeData.challengeTarget,
                      true,
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Your Metrics
                </h3>
                {renderMetrics(
                  getMetrics(
                    whoopData as WhoopMetrics,
                    formattedChallengeData.challengeType,
                    null,
                    formattedChallengeData.challengeTarget,
                    false,
                  ),
                )}
              </div>
            )}
          </div>
          {formattedChallengeData.status === 1 &&
            formatTimeRemaining(formattedChallengeData.endTime) === "Ended" && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="default"
                  disabled={isPending || Pending1v1}
                  onClick={() => handleClaim(formattedChallengeData)}
                  className="w-full max-w-xs bg-green-500 text-white transition-colors hover:bg-green-600"
                >
                  {isPending || Pending1v1 ? "Checking..." : "Check Result"}
                </Button>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengePage;
