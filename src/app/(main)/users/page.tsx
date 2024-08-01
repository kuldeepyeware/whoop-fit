/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/_components/ui/table";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/app/_components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  // PaginationLink,
  PaginationNext,
} from "@/app/_components/ui/pagination";
import { type SetStateAction, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      avatar: "/placeholder-user.jpg",
      challenges: [
        {
          id: 1,
          name: "30-Day Strain Score Challenge",
          status: "Ongoing",
          endDate: "2023-09-12",
        },
        {
          id: 2,
          name: "100% Recovery Challenge",
          status: "Completed",
          completedDate: "2023-08-15",
        },
      ],
    },
    {
      id: 2,
      name: "Jane Doe",
      avatar: "/placeholder-user.jpg",
      challenges: [
        {
          id: 3,
          name: "100% Recovery Challenge",
          status: "Completed",
          completedDate: "2023-08-15",
        },
      ],
    },
    {
      id: 3,
      name: "Alex Smith",
      avatar: "/placeholder-user.jpg",
      challenges: [
        {
          id: 4,
          name: "10K Steps Challenge",
          status: "Upcoming",
          startDate: "2023-09-01",
        },
      ],
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(9);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber: SetStateAction<number>) =>
    setCurrentPage(pageNumber);
  return (
    <main className="max-w-[450px] flex-1 p-6 sm:max-w-full">
      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Challenge any user a fitness challenge
            </CardDescription>
          </CardHeader>
          {users.length >= 1 ? (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((query) => (
                      <TableRow key={query.id}>
                        <TableCell>{query.name}</TableCell>
                        {/* <TableCell>{query.email}</TableCell>
                        <TableCell>{query.subject}</TableCell> */}
                        <TableCell>
                          {/* {query.message.length > 50
                            ? `${query.message.substring(0, 50)}...`
                            : query.message} */}
                        </TableCell>
                        <TableCell>
                          <div className="flex h-full items-center justify-center gap-4">
                            {/* <Button
                              variant='outline'
                              size='icon'
                              onClick={() => openDialog(query)}>
                              <EyeIcon className='h-4 w-4' />
                              <span className='sr-only'>View query</span>
                            </Button>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() => handleDeleteQuery(query.id)}>
                              <TrashIcon className='h-4 w-4' />
                              <span className='sr-only'>Delete query</span>
                            </Button> */}
                          </div>
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
                      // onClick={() =>
                      //   handlePageChange(Math.max(1, currentPage - 1))
                      // }
                      />
                    </PaginationItem>
                    {/* {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handlePageChange(index + 1)}
                          isActive={currentPage === index + 1}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))} */}
                    <PaginationItem>
                      <PaginationNext
                      // onClick={() =>
                      //   handlePageChange(
                      //     Math.min(totalPages, currentPage + 1)
                      //   )
                      // }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            </>
          ) : (
            <div className="ml-7 flex min-h-[200px] items-center justify-center text-xl font-medium">
              No queries generated yet
            </div>
          )}
        </Card>
      </div>

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='overflow-auto max-h-[700px]'>
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className='space-y-3'>
              <p>
                <strong>Name:</strong> {selectedQuery.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedQuery.email}
              </p>
              <p>
                <strong>Subject:</strong> {selectedQuery.subject}
              </p>
              <p className=' text-justify'>
                <strong>Message:</strong> {selectedQuery.message}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog> */}
    </main>
  );
};

export default Users;
