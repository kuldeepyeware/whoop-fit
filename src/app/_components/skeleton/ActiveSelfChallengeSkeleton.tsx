import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ActiveSelfChallengeSkeleton = () => {
  return (
    <section>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-[30px] w-[200px]" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="mb-4 w-[320px] rounded-lg border border-gray-200 bg-white p-6 shadow-md"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-[24px] w-[150px]" />
                  <Skeleton className="h-[20px] w-[80px]" />
                </div>
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-[20px] w-[250px]" />
                  <Skeleton className="h-[20px] w-[250px]" />
                </div>
                <Skeleton className="h-[40px] w-[150px] self-center" />
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </section>
  );
};

export default ActiveSelfChallengeSkeleton;
