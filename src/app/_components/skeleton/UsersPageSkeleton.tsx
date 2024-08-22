import { CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/_components/ui/table";

const UsersPageSkeleton = () => {
  return (
    <CardContent>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5 md:w-1/5">
              <Skeleton className="h-[20px] w-full bg-gray-800" />
            </TableHead>
            <TableHead className="w-1/5 md:w-1/5">
              <Skeleton className="h-[20px] w-full bg-gray-800" />
            </TableHead>
            <TableHead className="w-1/5 md:w-1/5">
              <Skeleton className="h-[20px] w-full bg-gray-800" />
            </TableHead>
            <TableHead className="w-1/5 md:w-1/5">
              <Skeleton className="h-[20px] w-full bg-gray-800" />
            </TableHead>
            <TableHead className="w-1/5 md:w-1/5">
              <Skeleton className="h-[20px] w-full bg-gray-800" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="w-1/5 md:w-1/5">
                <Skeleton className="h-[20px] w-full bg-gray-800" />
              </TableCell>
              <TableCell className="w-1/5 md:w-1/5">
                <Skeleton className="h-[20px] w-full bg-gray-800" />
              </TableCell>
              <TableCell className="w-1/5 md:w-1/5">
                <Skeleton className="h-[20px] w-full bg-gray-800" />
              </TableCell>
              <TableCell className="w-1/5 md:w-1/5">
                <Skeleton className="h-[20px] w-full bg-gray-800" />
              </TableCell>
              <TableCell className="w-1/5 md:w-1/5">
                <Skeleton className="h-[30px] w-full bg-gray-800" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
};

export default UsersPageSkeleton;
