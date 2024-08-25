"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/app/_components/ui/button";
import { Swords, CircleDollarSign, UserCircle, LockIcon } from "lucide-react";
import type { ProfileUserData } from "@/schemas/types/whoopDataTypes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import ProfileSkeleton from "@/app/_components/skeleton/ProfileSkeleton";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { tokenAbi, tokenAddress } from "TokenContract";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useToast } from "@/app/_components/ui/use-toast";
import { encodeFunctionData } from "viem";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import {
  getChallengeTypeString,
  getTomorrowDate,
  holisticTypes,
} from "@/lib/challenge";
import { Label } from "@/app/_components/ui/label";
import { useReadContract } from "wagmi";
import ChallengeLink from "@/app/_components/common/ChallengeLink";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { env } from "@/env";

const formSchema = z
  .object({
    activeTab: z.enum(["holistic", "isolated"]),
    endTime: z.string().min(1, "End time is required"),
    challengeType: z.string().optional(),
    holisticType: z
      .enum(["all-around", "sleep", "workout"], {
        required_error: "Holistic type is required",
      })
      .optional(),
    targetType: z.enum(["direct", "improvement"]).optional(),
    challengeTarget: z.string().optional(),
    improvementPercentage: z.string().nullable(),
    customImprovement: z.string().optional(),
    amount: z.string().min(1, "Amount is required"),
    isTwoSided: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.activeTab === "holistic") {
        if (!data.holisticType) {
          return false;
        }
        if (!data.isTwoSided && !data.improvementPercentage) {
          return false;
        }
      } else {
        if (!data.challengeType) {
          return false;
        }
        if (!data.isTwoSided) {
          if (data.targetType === "direct") {
            return (
              !!data.challengeTarget && !isNaN(Number(data.challengeTarget))
            );
          } else {
            if (data.improvementPercentage === "custom") {
              return (
                !!data.customImprovement &&
                !isNaN(Number(data.customImprovement))
              );
            } else {
              return !!data.improvementPercentage;
            }
          }
        }
      }
      return true;
    },
    (data) => {
      if (data.activeTab === "holistic") {
        if (!data.holisticType) {
          return {
            path: ["holisticType"],
            message: "Holistic type is required",
          };
        }
        if (!data.isTwoSided && !data.improvementPercentage) {
          return {
            path: ["improvementPercentage"],
            message: "Improvement percentage is required",
          };
        }
      } else {
        if (!data.challengeType) {
          return {
            path: ["challengeType"],
            message: "Challenge type is required",
          };
        }
        if (!data.isTwoSided) {
          if (data.targetType === "direct") {
            if (!data.challengeTarget || isNaN(Number(data.challengeTarget))) {
              return {
                path: ["challengeTarget"],
                message: "Challenge target is required",
              };
            }
          } else {
            if (!data.improvementPercentage) {
              return {
                path: ["improvementPercentage"],
                message: "Improvement percentage is required",
              };
            }
            if (
              data.improvementPercentage === "custom" &&
              (!data.customImprovement || isNaN(Number(data.customImprovement)))
            ) {
              return {
                path: ["customImprovement"],
                message: "Custom improvement percentage is required",
              };
            }
          }
        }
      }
      return { path: [""], message: "" };
    },
  );

type FormValues = z.infer<typeof formSchema>;

const ProfilePage = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const [profileData, setProfileData] = useState<ProfileUserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [averageMetric, setAverageMetric] = useState(0);
  const [challengeLink, setChallengeLink] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { authenticated } = usePrivy();

  const { smartAccountAddress, sendUserOperation, smartAccountReady } =
    useSmartAccount();

  const { data: moneyEarnedData } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getUserWinnings",
    args: [smartAccountAddress],
  });

  const router = useRouter();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activeTab: "holistic",
      endTime: "",
      challengeType: "",
      holisticType: undefined,
      targetType: "improvement",
      challengeTarget: "",
      improvementPercentage: "",
      isTwoSided: false,
      customImprovement: "",
      amount: "",
    },
  });

  const {
    data: ViewerConnectedStatus,
    isLoading: isCheckingViewerWhoopConnection,
  } = api.whoop.checkWhoopConnection.useQuery(undefined, {
    enabled: authenticated,
  });

  const { data: averageData } = api.user.getAverageMetric.useQuery(
    {
      userId: profileData?.whoopProfile[0]?.userId ?? "",
      metric:
        (getChallengeTypeString(
          Number(form.watch("challengeType") ?? "0"),
        ) as "Calories") ??
        "Strain" ??
        "Sleep Hours" ??
        "Recovery",
    },
    {
      enabled: !!form.watch("challengeType") && !form.watch("holisticType"),
    },
  );

  const {
    data: connectionStatus,
    isLoading: loadingConnection,
    refetch: refetchConnectionStatus,
  } = api.whoop.checkPublicWhoopConnection.useQuery({ id }, { enabled: false });

  const {
    data: userData,
    refetch: refetchUserData,
    isLoading,
  } = api.whoop.getWhoopPublicProfileData.useQuery({ id }, { enabled: false });

  const { data: challengeCounterData, refetch: refetchChallengeCounter } =
    useReadContract({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "challengeCounter",
    });

  const calculateChallengeTarget = (values: FormValues): number => {
    if (values.isTwoSided) {
      return 0;
    }

    if (values.holisticType) {
      return Number(values.improvementPercentage);
    }

    if (values.targetType === "direct") {
      return Number(values.challengeTarget);
    } else {
      let improvementPercentage: number;
      if (values.improvementPercentage === "custom") {
        improvementPercentage = Number(values.customImprovement);
      } else {
        improvementPercentage = Number(values.improvementPercentage);
      }

      const multiplier = 1 + Math.abs(improvementPercentage) / 100;
      let target = averageMetric * multiplier;

      const challengeType = Number(values.challengeType);
      if (challengeType === 1) {
        target = Math.min(target, 21);
      } else if (challengeType === 3) {
        target = Math.min(target, 100);
      }

      return target;
    }
  };

  const handleHolisticTypeSelect = (
    value: "all-around" | "sleep" | "workout",
  ) => {
    switch (value) {
      case "all-around":
        form.setValue("challengeType", "4");
        break;
      case "sleep":
        form.setValue("challengeType", "5");
        break;
      case "workout":
        form.setValue("challengeType", "6");
        break;
    }
  };

  const handleTabClick = (tab: "holistic" | "isolated") => {
    const currentIsTwoSided = form.getValues("isTwoSided");
    form.reset({
      activeTab: tab,
      endTime: "",
      challengeType: "",
      holisticType: undefined,
      targetType: "improvement",
      challengeTarget: "",
      improvementPercentage: "",
      customImprovement: "",
      amount: "",
      isTwoSided: currentIsTwoSided,
    });
  };

  function getChallengeTypeFromHolistic(holisticType: string): number {
    switch (holisticType) {
      case "all-around":
        return 4;
      case "sleep":
        return 5;
      case "workout":
        return 6;
      default:
        return 0;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!authenticated) {
      toast({
        title: "Log In to challenge",
        variant: "destructive",
      });
      return;
    }

    if (!userData?.smartAccountAddress) {
      toast({
        title: "No user selected or user has no default address",
        variant: "destructive",
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

    if (values.amount === String(0)) {
      toast({
        title: "Add minimum one dollar",
        variant: "destructive",
      });
      return;
    }

    setIsPending(true);

    const challengeType = values.holisticType
      ? getChallengeTypeFromHolistic(values.holisticType)
      : Number(values.challengeType);

    const challengeTarget = calculateChallengeTarget(values);

    const approveTokencallData = encodeFunctionData({
      abi: tokenAbi,
      functionName: "approve",
      args: [WhoopTokenAddress, BigInt(values.amount)],
    });

    const createChallengecallData = encodeFunctionData({
      abi: WhoopTokenAbi,
      functionName: "createChallenge",
      args: [
        userData?.smartAccountAddress,
        tokenAddress,
        BigInt(values.amount),
        BigInt(new Date(values.endTime).getTime() / 1000),
        challengeType,
        BigInt(Math.round(challengeTarget)),
        values.isTwoSided,
      ],
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
      await refetchChallengeCounter();
      if (challengeCounterData) {
        const latestChallengeId = Number(challengeCounterData);
        const newChallengeLink = `${env.NEXT_PUBLIC_DOMAIN_URL}pendingChallenge/${latestChallengeId}`;
        setChallengeLink(newChallengeLink);
      }
      toast({
        title: "Created Challenge successfully!",
        description: "Click the 'Copy Challenge Link' button to share.",
      });
      setIsPending(false);
      form.reset();
    } catch (error) {
      console.error("Error sending transaction:", error);

      toast({
        title: "Error while creating challenge",
        description: "Your account must have a sufficient USDC balance",
        variant: "destructive",
      });

      setIsPending(false);
    }
  }

  const openDialog = (isTwoSided: boolean) => {
    form.setValue("isTwoSided", isTwoSided);
    setAverageMetric(0);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      await refetchConnectionStatus();
      await refetchUserData();
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (averageData) {
      setAverageMetric(averageData.average);
    }
  }, [averageData]);

  useEffect(() => {
    if (userData) {
      setProfileData(userData as unknown as ProfileUserData);
    }
  }, [userData]);

  useEffect(() => {
    if (!form.watch("holisticType")) {
      form.setValue("improvementPercentage", "");
      form.setValue("customImprovement", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("challengeType")]);

  useEffect(() => {
    if (form.watch("isTwoSided")) {
      form.setValue("targetType", undefined);
      form.setValue("challengeTarget", "");
      form.setValue("improvementPercentage", "");
      form.setValue("customImprovement", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("isTwoSided")]);

  if (
    loadingConnection ||
    isLoading ||
    connectionStatus?.isConnected === null
  ) {
    return <ProfileSkeleton />;
  }

  if (connectionStatus?.isConnected === false) {
    return (
      <div className="ml-7 flex min-h-[200px] items-center justify-center text-2xl font-medium text-red-400">
        Invalid profile
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {profileData && (
        <>
          <div className="mt-6 grid gap-6 text-white md:grid-cols-[200px_1fr]">
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
                  <div>{profileData?.whoopProfile[0]?.email}</div>
                  {profileData?.smartAccountAddress && (
                    <div className="flex items-center justify-center gap-2">
                      <div>
                        {profileData?.smartAccountAddress?.slice(0, 6)}...
                        {profileData?.smartAccountAddress?.slice(-4)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-4xl font-bold">
                      {Number(profileData?.whoopCycles[0]?.strain ?? 0).toFixed(
                        1,
                      )}
                    </div>
                    <div className="text-sm"> Strain</div>
                  </Card>

                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-4xl font-bold">
                      {Number(
                        profileData?.whoopRecoveries[0]?.recoveryScore ?? 0,
                      ).toFixed(2)}
                      %
                    </div>
                    <div className="text-sm">Recovery Score</div>
                  </Card>

                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-4xl font-bold">
                      {Number(
                        profileData?.whoopSleeps[0]
                          ?.sleepEfficiencyPercentage ?? 0,
                      ).toFixed(2)}
                      %
                    </div>
                    <div className="text-sm"> Sleep Efficiency</div>
                  </Card>

                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-4xl font-bold">
                      {Number(
                        Number(profileData?.whoopCycles[0]?.kilojoule ?? 0) *
                          0.239006 ?? 0,
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm">Calories</div>
                  </Card>
                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-4xl font-bold">
                      {Number(
                        profileData?.whoopRecoveries[0]?.hrvRmssd ?? 0,
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm">Heart Rate Variability</div>
                  </Card>
                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-4xl font-bold">
                      {profileData?.whoopRecoveries[0]?.restingHeartRate ?? 0}
                    </div>
                    <div className="text-sm">Resting Heart Rate</div>
                  </Card>
                  <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
                    <div className="text-3xl font-bold md:text-4xl">
                      {profileData?.challengeCompleted ?? 0}
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
          </div>

          {!(
            String(smartAccountAddress) == String(userData?.smartAccountAddress)
          ) && (
            <>
              {authenticated ? (
                <>
                  <div className="mt-8 flex justify-center space-x-4">
                    {ViewerConnectedStatus?.isConnected && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="outline"
                              className="space-x-2 p-5"
                              disabled={
                                !authenticated ||
                                isCheckingViewerWhoopConnection
                              }
                              onClick={() => openDialog(true)}
                            >
                              <Swords className="h-5 w-5" />
                              <span>1v1 Challenge</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="border-none bg-black text-white">
                            <p className="text-center">
                              Highest biometric value wins <br />
                              combined $ amounts
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="outline"
                            className="space-x-2 p-5"
                            disabled={
                              !authenticated || isCheckingViewerWhoopConnection
                            }
                            onClick={() => openDialog(false)}
                          >
                            <CircleDollarSign className="h-5 w-5" />
                            <span>Sponsor</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="border-none bg-black text-white">
                          <p className="w-full text-center">
                            Invest in other&apos;s health. <br />
                            If their biometrics improve <br />
                            compared to their previous numbers, <br /> they
                            receive your investment; <br /> if not, you get your
                            money back
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </>
              ) : (
                <div className="mt-6 flex w-full items-center justify-center">
                  <Button
                    onClick={() => {
                      router.push("/login");
                    }}
                    disabled={authenticated || isCheckingViewerWhoopConnection}
                    className="flex items-center justify-center rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600"
                  >
                    <LockIcon className="mr-2 h-4 w-4" />
                    Log In to Challenge
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[700px] overflow-auto border-none bg-[#001636] text-white">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-2xl font-bold">
              Add {form.getValues("isTwoSided") ? "Challenge" : "Sponsor"}{" "}
              Details
            </DialogTitle>
          </DialogHeader>
          <Card className="border-none bg-[#001636] p-6 text-white">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 text-white"
              >
                <div className="mb-4 rounded-md bg-blue-500/15 p-4 text-sm text-blue-300 shadow-md">
                  <div className="flex items-center gap-x-3">
                    {form.watch("isTwoSided") ? (
                      <Swords className="h-5 w-5" />
                    ) : (
                      <CircleDollarSign className="h-5 w-5" />
                    )}
                    <p className="font-medium">
                      {form.watch("isTwoSided")
                        ? "1v1 Challenge"
                        : "Sponsor Challenge"}
                    </p>
                  </div>
                  <p className="mt-2 pl-8">
                    {form.watch("isTwoSided") ? (
                      form.watch("activeTab") === "holistic" ? (
                        <>
                          Highest <i>average</i> biometric value wins combined $
                          amounts
                        </>
                      ) : (
                        <>Highest biometric value wins combined $ amounts</>
                      )
                    ) : form.watch("activeTab") === "holistic" ? (
                      <>
                        Invest in other&apos;s health. If their <i>average</i>{" "}
                        biometrics improve compared to their previous numbers,
                        they receive your investment; if not, you get your money
                        back
                      </>
                    ) : (
                      <>
                        Invest in other&apos;s health. If their biometrics
                        improve compared to their previous numbers, they receive
                        your investment; if not, you get your money back
                      </>
                    )}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="text-white">
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          disabled={isPending}
                          {...field}
                          className="border-none bg-white/10 text-white shadow-lg backdrop-blur-md"
                          min={getTomorrowDate()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Tabs
                  defaultValue="holistic"
                  onValueChange={(value) =>
                    handleTabClick(value as "holistic" | "isolated")
                  }
                >
                  <TabsList className="grid h-[60px] w-full grid-cols-2 bg-white/10">
                    <TabsTrigger
                      value="holistic"
                      className="h-full text-wrap text-center font-bold text-white data-[state=active]:bg-black data-[state=active]:text-white"
                    >
                      Holistic (Recommended)
                    </TabsTrigger>
                    <TabsTrigger
                      value="isolated"
                      className="h-full text-wrap font-bold text-white data-[state=active]:bg-black data-[state=active]:text-white"
                    >
                      Isolated
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="holistic">
                    <FormField
                      control={form.control}
                      name="holisticType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-4">
                              {holisticTypes.map((type) => (
                                <Card
                                  key={type.value}
                                  className={`min-h-[50px] cursor-pointer bg-white/10 text-white ${
                                    field.value === type.value
                                      ? "border-2 border-blue-500"
                                      : "border-none"
                                  } ${type.disabled ? "opacity-50" : ""}`}
                                  onClick={() => {
                                    if (!type.disabled) {
                                      field.onChange(type.value);
                                      handleHolisticTypeSelect(
                                        type.value as
                                          | "all-around"
                                          | "sleep"
                                          | "workout",
                                      );
                                    }
                                  }}
                                >
                                  <CardHeader className="px-1">
                                    <CardTitle className="md:text-md text-center text-sm text-white">
                                      {type.title}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-xs text-white md:text-sm">
                                    <ul className="list-disc">
                                      {type.items.map((item, index) => (
                                        <li key={index}>{item}</li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("holisticType") &&
                      !form.watch("isTwoSided") && (
                        <FormField
                          control={form.control}
                          name="improvementPercentage"
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel className="text-white">
                                Improvement Percentage
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? undefined}
                                disabled={isPending}
                              >
                                <FormControl>
                                  <SelectTrigger className="border-none bg-white/10 text-white">
                                    <SelectValue placeholder="Select percentage" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#001636] text-white">
                                  <SelectItem value="5">
                                    5% Improvement
                                  </SelectItem>
                                  <SelectItem value="10">
                                    10% Improvement
                                  </SelectItem>
                                  <SelectItem value="15">
                                    15% Improvement
                                  </SelectItem>
                                  <SelectItem value="20">
                                    20% Improvement
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                  </TabsContent>

                  <TabsContent value="isolated">
                    <FormField
                      control={form.control}
                      name="challengeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenge Type</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("improvementPercentage", "");
                              form.setValue("customImprovement", "");
                            }}
                            value={field.value}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger className="border-none bg-white/10 text-white">
                                <SelectValue placeholder="Select metric" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#001636] text-white">
                              <SelectItem value="0">Calories</SelectItem>
                              <SelectItem value="1">Strain</SelectItem>
                              <SelectItem value="2">Hours of Sleep</SelectItem>
                              <SelectItem value="3">
                                Recovery Percentage
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!isLoading &&
                      form.watch("challengeType") &&
                      averageMetric > 0 && (
                        <div className="mt-2">
                          <Label className="text-xs text-white md:text-base">
                            Last 7 Days User Average{" "}
                            {getChallengeTypeString(
                              Number(form.watch("challengeType")),
                            )}
                            : {averageMetric.toFixed(2)}
                          </Label>
                        </div>
                      )}

                    {!form.watch("isTwoSided") && (
                      <>
                        <FormField
                          control={form.control}
                          name="targetType"
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel>Target Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isPending}
                                  className="text-white"
                                >
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <RadioGroupItem
                                        value="improvement"
                                        className="border-white text-white"
                                      />
                                      <span>Percentage</span>
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <RadioGroupItem
                                        value="direct"
                                        className="border-white text-white"
                                      />
                                      <span>Quantity</span>
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("targetType") === "direct" && (
                          <FormField
                            control={form.control}
                            name="challengeTarget"
                            render={({ field }) => (
                              <FormItem className="mt-3">
                                <FormLabel>
                                  Add{" "}
                                  {getChallengeTypeString(
                                    Number(form.watch("challengeType") ?? "0"),
                                  )}{" "}
                                  Challenge Target
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Challenge Target"
                                    disabled={isPending}
                                    {...field}
                                    onChange={(e) => {
                                      const challengeType = Number(
                                        form.watch("challengeType") ?? "0",
                                      );
                                      let value = parseFloat(e.target.value);

                                      if (challengeType === 1) {
                                        value = Math.min(value, 21);
                                      } else if (challengeType === 3) {
                                        value = Math.min(value, 100);
                                      }

                                      field.onChange(value.toString());
                                    }}
                                    max={
                                      Number(form.watch("challengeType")) === 1
                                        ? 21
                                        : Number(
                                              form.watch("challengeType"),
                                            ) === 3
                                          ? 100
                                          : undefined
                                    }
                                    className="border-none bg-white/10 text-white shadow-lg backdrop-blur-md"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {!form.watch("holisticType") &&
                          form.watch("targetType") === "improvement" && (
                            <FormField
                              control={form.control}
                              name="improvementPercentage"
                              render={({ field }) => (
                                <FormItem className="mt-3">
                                  <FormLabel>Improvement Percentage</FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        if (value === "custom") {
                                          form.setValue(
                                            "customImprovement",
                                            "",
                                          );
                                        }
                                      }}
                                      value={field.value ?? undefined}
                                      disabled={isPending}
                                    >
                                      <SelectTrigger className="border-none bg-white/10 text-white">
                                        <SelectValue placeholder="Select percentage" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#001636] text-white">
                                        <SelectItem value="5">
                                          5% Increase
                                        </SelectItem>
                                        <SelectItem value="10">
                                          10% Increase
                                        </SelectItem>
                                        <SelectItem value="15">
                                          15% Increase
                                        </SelectItem>
                                        <SelectItem value="20">
                                          20% Increase
                                        </SelectItem>
                                        <SelectItem value="custom">
                                          Custom
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                        {!form.watch("holisticType") &&
                          form.watch("targetType") === "improvement" &&
                          form.watch("improvementPercentage") === "custom" && (
                            <FormField
                              control={form.control}
                              name="customImprovement"
                              render={({ field }) => (
                                <FormItem className="mt-3">
                                  <FormLabel>
                                    Custom Improvement Percentage
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter custom percentage"
                                      {...field}
                                      min={0}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                          value === "" ||
                                          Number(value) <= 100
                                        ) {
                                          field.onChange(value);
                                        }
                                      }}
                                      disabled={isPending}
                                      className="border-none bg-white/10 text-white shadow-lg backdrop-blur-md"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          {...field}
                          min="1"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value >= String(0)) {
                              field.onChange(value);
                            }
                          }}
                          value={field.value || ""}
                          className="border-none bg-white/10 p-6 text-white shadow-lg backdrop-blur-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-center">
                  <Button
                    disabled={!authenticated || isPending}
                    type="submit"
                    className="w-full bg-black"
                  >
                    {isPending ? "Creating Challenge..." : "Create Challenge"}
                  </Button>
                </div>

                <ChallengeLink
                  link={challengeLink}
                  setChallengeLink={setChallengeLink}
                />
              </form>
            </Form>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
