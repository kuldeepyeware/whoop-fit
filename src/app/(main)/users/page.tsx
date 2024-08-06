/* eslint-disable react-hooks/exhaustive-deps */
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
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
// import { parseEther } from 'viem'
import { Input } from "@/app/_components/ui/input";
import { Checkbox } from "@/app/_components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Swords } from "lucide-react";
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

interface User {
  id: number | null;
  name: string | null;
  whoopSleep: number | null;
  whoopRecoveries: number | null;
  whoopWorkouts: number | null;
  defaultAddress: string | null;
}

const formSchema = z.object({
  amount: z.string().min(1),
  endTime: z.string(),
  challengeType: z.string(),
  challengeTarget: z.string().min(1),
  isTwoSided: z.boolean(),
});

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      endTime: "",
      challengeType: "hrv",
      challengeTarget: "",
      isTwoSided: false,
    },
  });

  const { data, isLoading } = api.user.getUsersWithMetrics.useQuery({
    page: currentPage,
    pageSize: 10,
  });

  const { data: approvalHash, writeContract: approveToken } =
    useWriteContract();

  const { data: challengeHash, writeContract: createChallenge } =
    useWriteContract();

  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  const { isLoading: isChallengeLoading, isSuccess: isChallengeSuccess } =
    useWaitForTransactionReceipt({
      hash: challengeHash,
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedUser?.defaultAddress) {
      toast({
        title: "No user selected or user has no default address",
      });
      return;
    }

    approveToken({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "approve",
      args: [WhoopTokenAddress, BigInt(values.amount)],
    });

    toast({
      title: "Token approval initiated",
      description: "Please confirm the transaction in your wallet.",
    });
  }

  const openDialog = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (isApprovalSuccess) {
      toast({
        title: "Token approval confirmed",
        description: "Creating challenge...",
      });

      createChallenge({
        address: WhoopTokenAddress,
        abi: WhoopTokenAbi,
        functionName: "createChallenge",
        args: [
          selectedUser?.defaultAddress,
          tokenAddress,
          BigInt(form.getValues("amount")),
          BigInt(new Date(form.getValues("endTime")).getTime() / 1000),
          form.getValues("challengeType"),
          BigInt(form.getValues("challengeTarget")),
          form.getValues("isTwoSided"),
        ],
      });
    }
  }, [isApprovalSuccess]);

  useEffect(() => {
    if (isChallengeSuccess) {
      toast({
        title: "Challenge created successfully!",
      });
      setIsDialogOpen(false);
      form.reset();
    }
  }, [isChallengeSuccess]);

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
          {isLoading ? (
            <UsersTableSkeleton />
          ) : users.length >= 1 ? (
            <>
              <CardContent className="w-full">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/5 md:w-1/5">Name</TableHead>
                      <TableHead className="w-1/5 md:w-1/5">
                        Sleep Efficiency
                      </TableHead>
                      <TableHead className="w-1/5 md:w-1/5">Recovery</TableHead>
                      <TableHead className="w-1/5 md:w-1/5">Strain</TableHead>
                      <TableHead className="w-1/5 md:w-1/5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="w-1/5 md:w-1/5">
                          {user.name}
                        </TableCell>
                        <TableCell className="w-1/5 md:w-1/5">
                          {user.whoopSleep ?? "N/A"}%
                        </TableCell>
                        <TableCell className="w-1/5 md:w-1/5">
                          {user.whoopRecoveries ?? "N/A"}%
                        </TableCell>
                        <TableCell className="w-1/5 md:w-1/5">
                          {user.whoopWorkouts ?? "N/A"}
                        </TableCell>
                        <TableCell className="w-1/5 md:w-1/5">
                          <Button
                            variant="outline"
                            className="space-x-2 p-5"
                            onClick={() => openDialog(user)}
                          >
                            <Swords className="h-5 w-5" />
                            <span className="text-black">Challenge</span>
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
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                      />
                    </PaginationItem>
                    {[...(Array(totalPages) as [])].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handlePageChange(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
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
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[700px] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add Challenge Details</DialogTitle>
          </DialogHeader>
          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Create Challenge</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isApprovalLoading || isChallengeLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          disabled={isApprovalLoading || isChallengeLoading}
                          {...field}
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
                        disabled={isApprovalLoading || isChallengeLoading}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a challenge type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Increase HRV</SelectItem>
                          <SelectItem value="1">Increase Steps</SelectItem>
                          <SelectItem value="2">Increase SleepScore</SelectItem>
                          <SelectItem value="3">
                            Do Any Workout for one hour
                          </SelectItem>
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
                        <Input
                          {...field}
                          disabled={isApprovalLoading || isChallengeLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isTwoSided"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          // disabled={tokenPending || ChallengePending}
                          disabled={isApprovalLoading || isChallengeLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Two-sided Challenge</FormLabel>
                        <FormDescription>
                          If checked, both parties will need to stake tokens.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-center">
                  <Button
                    disabled={isApprovalLoading || isChallengeLoading}
                    type="submit"
                  >
                    {isApprovalLoading
                      ? "Approving..."
                      : isChallengeLoading
                        ? "Creating Challenge..."
                        : "Create Challenge"}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Users;
