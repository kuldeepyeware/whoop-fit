"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/_components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/_components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
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
import { CircleDollarSign, Swords } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { tokenAbi, tokenAddress } from "TokenContract";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { useToast } from "@/app/_components/ui/use-toast";
import UsersTableSkeleton from "@/app/_components/skeleton/UsersPageSkeleton";
import type { UserListData } from "@/schemas/types/whoopDataTypes";
import { useAuth } from "@/hooks/authHook";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { encodeFunctionData } from "viem";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import { getChallengeTypeString, getTomorrowDate } from "@/lib/challenge";
import { Label } from "@/app/_components/ui/label";
import { useReadContract } from "wagmi";
import ChallengeLink from "@/app/_components/common/ChallengeLink";
import { env } from "@/env";

const formSchema = z
  .object({
    amount: z.string().min(1, "Amount is required"),
    endTime: z.string().min(1, "End time is required"),
    challengeType: z.string().min(1, "Challenge type is required"),
    targetType: z.enum(["direct", "improvement"]),
    challengeTarget: z.string().optional(),
    improvementPercentage: z.number().nullable(),
    customImprovement: z.number().nullable(),
    isTwoSided: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.targetType === "direct") {
        return !!data.challengeTarget;
      } else if (data.targetType === "improvement") {
        return (
          data.improvementPercentage !== null || data.customImprovement !== null
        );
      }
      return false;
    },
    {
      message: "Either challenge target or improvement must be specified",
      path: ["challengeTarget"],
    },
  )
  .refine(
    (data) => {
      if (
        data.targetType === "improvement" &&
        data.customImprovement === null
      ) {
        return data.improvementPercentage !== null;
      }
      return true;
    },
    {
      message:
        "Custom improvement must be specified when selecting a custom percentage",
      path: ["customImprovement"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const Users = () => {
  const [users, setUsers] = useState<UserListData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserListData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [averageMetric, setAverageMetric] = useState(0);
  const [challengeLink, setChallengeLink] = useState<string | null>(null);

  const { toast } = useToast();

  const { authenticated } = useAuth();

  const { smartAccountAddress, sendUserOperation, smartAccountReady } =
    useSmartAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      endTime: "",
      challengeType: "",
      targetType: "improvement",
      challengeTarget: "",
      improvementPercentage: null,
      customImprovement: null,
      isTwoSided: false,
    },
  });

  const { data: connectionStatus } = api.whoop.checkWhoopConnection.useQuery(
    undefined,
    {
      enabled: authenticated,
    },
  );

  const { data, isLoading } = api.user.getUsersWithMetrics.useQuery(
    {
      page: currentPage,
      pageSize: 10,
    },
    {
      enabled: connectionStatus?.isConnected,
    },
  );

  const { data: averageData } = api.user.getAverageMetric.useQuery(
    {
      userId: selectedUser?.whoopProfile[0]?.userId ?? "",
      metric:
        (getChallengeTypeString(
          Number(form.watch("challengeType") || "0"),
        ) as "Calories") ??
        "Strain" ??
        "Sleep Hours" ??
        "Recovery",
    },
    {
      enabled: !!form.watch("challengeType"),
    },
  );

  const { data: challengeCounterData, refetch: refetchChallengeCounter } =
    useReadContract({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "challengeCounter",
    });

  const calculateChallengeTarget = (values: FormValues): number => {
    const challengeType = Number(values.challengeType);

    if (values.targetType === "direct") {
      return Number(values.challengeTarget);
    } else {
      const improvementPercentage =
        values.improvementPercentage ?? values.customImprovement ?? 0;

      const shouldDecrease = challengeType === 0 || challengeType === 1;

      const multiplier = shouldDecrease
        ? 1 - Math.abs(improvementPercentage) / 100
        : 1 + Math.abs(improvementPercentage) / 100;

      return averageMetric * multiplier;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedUser?.smartAccountAddress) {
      toast({
        title: "No user selected or user has no default address",
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
        selectedUser?.smartAccountAddress,
        tokenAddress,
        BigInt(values.amount),
        BigInt(new Date(values.endTime).getTime() / 1000),
        Number(values.challengeType),
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

  const openDialog = (user: UserListData, isTwoSided: boolean) => {
    setSelectedUser(user);
    form.setValue("isTwoSided", isTwoSided);
    setIsDialogOpen(true);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (averageData) {
      setAverageMetric(averageData.average);
    }
  }, [averageData]);

  useEffect(() => {
    if (data) {
      setUsers(data.users as []);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  return (
    <main className="min-w-sm flex-1 p-6 sm:max-w-full">
      <div className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View users and their metrics</CardDescription>
          </CardHeader>
          <>
            {isLoading ? (
              <UsersTableSkeleton />
            ) : (
              <>
                {!connectionStatus?.isConnected ? (
                  <>
                    {users.length >= 1 ? (
                      <>
                        <CardContent className="w-full">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/5 md:w-1/5">
                                  Name
                                </TableHead>
                                <TableHead className="w-1/5 md:w-1/5">
                                  Sleep Efficiency
                                </TableHead>
                                <TableHead className="w-1/5 md:w-1/5">
                                  Recovery
                                </TableHead>
                                <TableHead className="w-1/5 md:w-1/5">
                                  Strain
                                </TableHead>
                                <TableHead className="w-1/5 md:w-1/5">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow key={user.privyId}>
                                  <TableCell className="w-1/5 md:w-1/5">
                                    {user.whoopProfile[0]?.firstName}
                                  </TableCell>
                                  <TableCell className="w-1/5 md:w-1/5">
                                    {Number(
                                      user.whoopSleeps[0]
                                        ?.sleepEfficiencyPercentage ?? 0,
                                    ).toFixed(1)}
                                    %
                                  </TableCell>
                                  <TableCell className="w-1/5 md:w-1/5">
                                    {user.whoopRecoveries[0]?.recoveryScore ??
                                      0}
                                  </TableCell>
                                  <TableCell className="w-1/5 md:w-1/5">
                                    {Number(
                                      user?.whoopWorkouts[0]?.strain ?? 0,
                                    ).toFixed(1)}
                                  </TableCell>
                                  <TableCell className="flex w-1/5 gap-3 md:w-1/5">
                                    <Button
                                      variant="outline"
                                      className="space-x-2 p-5"
                                      disabled={isPending}
                                      onClick={() => openDialog(user, true)}
                                    >
                                      <Swords className="h-5 w-5" />
                                      <span className="text-black">
                                        1v1 Challenge
                                      </span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="space-x-2 p-5"
                                      disabled={isPending}
                                      onClick={() => openDialog(user, false)}
                                    >
                                      <CircleDollarSign className="h-5 w-5" />
                                      <span className="text-black">
                                        Sponsor
                                      </span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                        <CardFooter>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() =>
                                    handlePageChange(
                                      Math.max(1, currentPage - 1),
                                    )
                                  }
                                />
                              </PaginationItem>
                              {[...(Array(totalPages) as [])].map(
                                (_, index) => (
                                  <PaginationItem key={index}>
                                    <PaginationLink
                                      onClick={() =>
                                        handlePageChange(index + 1)
                                      }
                                      isActive={currentPage === index + 1}
                                    >
                                      {index + 1}
                                    </PaginationLink>
                                  </PaginationItem>
                                ),
                              )}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() =>
                                    handlePageChange(
                                      Math.min(totalPages, currentPage + 1),
                                    )
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </CardFooter>
                      </>
                    ) : (
                      <div className="ml-7 flex min-h-[200px] items-center justify-center text-xl font-medium">
                        No users found
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="ml-7 flex min-h-[200px] items-center justify-center text-xl font-medium text-red-400">
                      Add whoop connection to proceed
                    </div>
                  </>
                )}
              </>
            )}
          </>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[700px] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-2xl font-bold">
              Add Challenge Details
            </DialogTitle>
          </DialogHeader>
          <Card className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          disabled={isPending}
                          {...field}
                          min={getTomorrowDate()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="challengeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Calories</SelectItem>
                          <SelectItem value="1">Strain</SelectItem>
                          <SelectItem value="2">Hours of Sleep</SelectItem>
                          <SelectItem value="3">Recovery Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isLoading && averageMetric > 0 && (
                  <div>
                    <Label>
                      Last 7 Days User Average{" "}
                      {getChallengeTypeString(
                        Number(form.watch("challengeType") || "0"),
                      )}
                      : {averageMetric.toFixed(2)}
                    </Label>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <RadioGroupItem value="improvement" />
                              <span>Improvement</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <RadioGroupItem value="direct" />
                              <span>Direct</span>
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
                      <FormItem>
                        <FormLabel>
                          Add{" "}
                          {getChallengeTypeString(
                            Number(form.watch("challengeType")),
                          )}{" "}
                          Challenge Target
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Challenge Target"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("targetType") === "improvement" && (
                  <>
                    <FormField
                      control={form.control}
                      name="improvementPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Improvement Percentage</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                if (value === "custom") {
                                  field.onChange(null);
                                  form.setValue("customImprovement", null);
                                } else {
                                  field.onChange(parseInt(value, 10));
                                  form.setValue("customImprovement", null);
                                }
                              }}
                              value={field.value?.toString() ?? "custom"}
                              disabled={isPending}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select percentage" />
                              </SelectTrigger>
                              <SelectContent>
                                {(form.watch("challengeType") === "0" ||
                                  form.watch("challengeType") === "1") && (
                                  <>
                                    <SelectItem value="-5">
                                      5% Decrease
                                    </SelectItem>
                                    <SelectItem value="-10">
                                      10% Decrease
                                    </SelectItem>
                                    <SelectItem value="-15">
                                      15% Decrease
                                    </SelectItem>
                                    <SelectItem value="-20">
                                      20% Decrease
                                    </SelectItem>
                                  </>
                                )}

                                {(form.watch("challengeType") === "2" ||
                                  form.watch("challengeType") === "3") && (
                                  <>
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
                                  </>
                                )}

                                <SelectItem value="custom">
                                  Custom Percentage
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(form.watch("improvementPercentage") === null ||
                      form.watch("targetType") === "direct") && (
                      <FormField
                        control={form.control}
                        name={
                          form.watch("targetType") === "direct"
                            ? "challengeTarget"
                            : "customImprovement"
                        }
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {form.watch("targetType") === "direct"
                                ? "Challenge Target"
                                : "Custom Improvement"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={
                                  form.watch("targetType") === "direct"
                                    ? "Challenge Target"
                                    : "Custom Improvement Percentage"
                                }
                                {...field}
                                min="1"
                                max="100"
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  if (value >= 1 && value <= 100) {
                                    field.onChange(value);
                                  } else if (e.target.value === "") {
                                    field.onChange(null);
                                  }
                                }}
                                value={field.value ?? ""}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

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
                    className="w-full"
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
    </main>
  );
};

export default Users;
