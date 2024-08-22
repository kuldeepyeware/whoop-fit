import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ChallengeCardSkeleton = () => {
  return (
    <section>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-[30px] w-[200px] bg-gray-800" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="mb-4 w-[320px] rounded-lg border-none bg-gray-700 p-6 shadow-md"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="mb-2">
                  <Skeleton className="h-[24px] w-[150px] bg-gray-800" />
                </div>
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-[20px] w-[250px] bg-gray-800" />
                  <Skeleton className="h-[20px] w-[250px] bg-gray-800" />
                  <Skeleton className="h-[20px] w-[250px] bg-gray-800" />
                  <Skeleton className="h-[20px] w-[250px] bg-gray-800" />
                  <Skeleton className="h-[20px] w-[250px] bg-gray-800" />
                </div>
                <div className="flex justify-center space-x-2">
                  <Skeleton className="h-[40px] w-[100px] bg-gray-800" />
                  <Skeleton className="h-[40px] w-[100px] bg-gray-800" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </section>
  );
};

export default ChallengeCardSkeleton;
