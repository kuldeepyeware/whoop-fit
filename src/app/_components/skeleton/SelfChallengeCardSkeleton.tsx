import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const SelfChallengeCardSkeleton = () => {
  return (
    <div className="space-y-10 px-4 py-10 md:px-6">
      <section className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <Skeleton className="h-[24px] w-[200px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[40px] w-full" />
              <Skeleton className="h-[40px] w-full" />
              <Skeleton className="h-[40px] w-full" />
              <Skeleton className="h-[48px] w-full" />
            </div>
          </CardContent>
        </Card>
      </section>

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
    </div>
  );
};

export default SelfChallengeCardSkeleton;
