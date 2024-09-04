"use client";

import Loading from "@/app/_components/common/Loading";
import { Card } from "@/app/_components/ui/card";
import { api } from "@/trpc/react";
import { tokenAddress } from "TokenContract";
import { useReadContract } from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

const AppMetrics = () => {
  const searchParams = useSearchParams();
  const show = searchParams.get("show");

  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (show === "true") {
      setShouldShow(true);
    } else {
      notFound();
    }
  }, [show]);

  const { data: challengeCounterData, isLoading: challengeCounterLoading } =
    useReadContract({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "challengeCounter",
    });

  const { data: totalAccumulatedFees, isLoading: accumulatedFeesLoading } =
    useReadContract({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "getAccumulatedFees",
      args: [tokenAddress],
    });

  const { data, isLoading: usersLoading } =
    api.user.getTotalWhoopSignedUp.useQuery(undefined, {
      enabled: !!shouldShow,
    });

  if (challengeCounterLoading || accumulatedFeesLoading || usersLoading)
    return <Loading />;

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col p-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          App Metrics
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
            <div className="text-4xl font-bold">{data?.users}</div>
            <div className="text-sm">Total Whoops Signed Up</div>
          </Card>
          <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
            <div className="text-4xl font-bold">
              {Number(challengeCounterData)}
            </div>
            <div className="text-sm">Total Challenges Sent</div>
          </Card>
          <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
            <div className="text-4xl font-bold">
              {Number(totalAccumulatedFees)} USDC
            </div>
            <div className="text-sm">Total Fees Collected</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppMetrics;
