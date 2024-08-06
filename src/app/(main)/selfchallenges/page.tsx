/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
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
import { ClockIcon } from "lucide-react";
import { useToast } from "@/app/_components/ui/use-toast";
import {
  formatTimeRemaining,
  getBadgeVariant,
  getChallengeTypeString,
} from "@/lib/challenge";
import { api } from "@/trpc/react";
import { type SelfChallenge } from "@/schemas/types/challengeTypes";
import SelfChallengeCardSkeleton from "@/app/_components/skeleton/SelfChallengeCardSkeleton";

const formSchema = z.object({
  endTime: z.string(),
  challengeType: z.string(),
  challengeTarget: z.string().min(1),
});

const SelfChallenges = () => {
  const [acceptedChallenges, setAcceptedChallenges] = useState<SelfChallenge[]>(
    [],
  );
  const [endedChallenges, setEndedChallenges] = useState<SelfChallenge[]>([]);
  const [checkResultChallengeId, setCheckResultChallengeId] = useState<
    bigint | null
  >(null);
  const { address } = useAccount();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endTime: "",
      challengeType: "0",
      challengeTarget: "",
    },
  });

  const {
    data: challengeHash,
    writeContract: createChallenge,
    isPending: creatingChallenge,
  } = useWriteContract();

  const { isLoading: isChallengeLoading, isSuccess: isChallengeSuccess } =
    useWaitForTransactionReceipt({
      hash: challengeHash,
    });

  const {
    data: acceptedChallengesData,
    refetch: refetchAcceptedChallenges,
    isLoading: loadingAcceptedChallenge,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getAcceptedSelfChallengesForUser",
    args: [address],
  });

  const {
    data: endedChallengesData,
    refetch: refetchEndedChallenges,
    isLoading: loadingEndedChallenge,
  } = useReadContract({
    address: WhoopTokenAddress,
    abi: WhoopTokenAbi,
    functionName: "getEndedSelfChallengesForUser",
    args: [address],
  });

  const { mutateAsync: updateTargetMutation, isPending } =
    api.user.updateSelfTargetStatus.useMutation({
      onSuccess: () => {
        toast({
          title: "Evaluated result successfully!",
        });
        setCheckResultChallengeId(null);
        refetchEndedChallenges();
        refetchAcceptedChallenges();
      },
      onError: () => {
        toast({
          title: "Something went wrong try again later!",
        });
        setCheckResultChallengeId(null);
        refetchAcceptedChallenges();
      },
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createChallenge({
      address: WhoopTokenAddress,
      abi: WhoopTokenAbi,
      functionName: "createSelfChallenge",
      args: [
        BigInt(new Date(values.endTime).getTime() / 1000),
        BigInt(values.challengeType),
        BigInt(values.challengeTarget),
      ],
    });
  }

  const handleCheckResult = async (challenge: SelfChallenge) => {
    setCheckResultChallengeId(challenge.challengeId);
    updateTargetMutation(challenge);
  };

  useEffect(() => {
    if (acceptedChallengesData)
      setAcceptedChallenges(acceptedChallengesData as SelfChallenge[]);
    if (endedChallengesData)
      setEndedChallenges(endedChallengesData as SelfChallenge[]);
  }, [acceptedChallengesData, endedChallengesData]);

  useEffect(() => {
    if (isChallengeSuccess) {
      toast({ title: "Self challenge created successfully!" });
      form.reset();
      refetchAcceptedChallenges();
    }
  }, [isChallengeSuccess]);

  if (loadingAcceptedChallenge || loadingEndedChallenge) {
    return <SelfChallengeCardSkeleton />;
  }

  const renderChallengeCard = (challenge: SelfChallenge) => (
    <Card
      key={challenge.challengeId.toString()}
      className="mb-4 w-[324px] rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {getChallengeTypeString(challenge.challengeType)}
          </h3>
          <Badge
            className="rounded-md px-2 py-1 text-xs"
            variant={getBadgeVariant(challenge.status)}
          >
            {getBadgeVariant(challenge.status)}
          </Badge>
        </div>
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Target:</span>{" "}
            {challenge.challengeTarget.toString()}
          </p>
          <p className="text-sm text-gray-600">
            <ClockIcon className="mr-1 inline-block h-4 w-4 text-gray-500" />
            {formatTimeRemaining(challenge.endTime)}
          </p>
          {formatTimeRemaining(challenge.endTime) === "Ended" &&
            challenge.status == 4 && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Target Reached:</span>{" "}
                {challenge.targetReached ? "Yes" : "No"}
              </p>
            )}
        </div>
        {formatTimeRemaining(challenge.endTime) === "Ended" &&
          challenge.status == 1 && (
            <Button
              variant="default"
              className="bg-green-500 text-white transition-colors hover:bg-green-600"
              disabled={isPending}
              onClick={() => handleCheckResult(challenge)}
            >
              {checkResultChallengeId == challenge.challengeId
                ? isPending
                  ? "Checking..."
                  : "Check Result"
                : "Check Result"}
            </Button>
          )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-10 px-4 py-10 md:px-6">
      <section className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex justify-center">
              Create Self Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <Input type="datetime-local" {...field} />
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a challenge type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">HRV</SelectItem>
                          <SelectItem value="1">Steps</SelectItem>
                          <SelectItem value="2">Sleep Score</SelectItem>
                          <SelectItem value="3">Workout Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="challengeTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge Target</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="flex w-full justify-center"
                  type="submit"
                  disabled={creatingChallenge || isChallengeLoading}
                >
                  {creatingChallenge || isChallengeLoading
                    ? "Creating..."
                    : "Create Challenge"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      <section>
        <CardHeader>
          <CardTitle>Active Self Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            {acceptedChallenges.length > 0 ? (
              acceptedChallenges.map((challenge) =>
                renderChallengeCard(challenge),
              )
            ) : (
              <p>No active self challenges</p>
            )}
          </div>
        </CardContent>
      </section>

      <section>
        <CardHeader>
          <CardTitle>Ended Self Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            {endedChallenges.length > 0 ? (
              endedChallenges.map((challenge) => renderChallengeCard(challenge))
            ) : (
              <p>No ended self challenges</p>
            )}
          </div>
        </CardContent>
      </section>
    </div>
  );
};

export default SelfChallenges;
