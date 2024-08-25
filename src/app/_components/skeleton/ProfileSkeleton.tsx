import { Card } from "../ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ProfileSkeleton = () => {
  return (
    <div className="relative">
      <div>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              <Skeleton className="h-[30px] w-[150px] bg-gray-800" />
            </h2>
            <Skeleton className="h-[30px] w-[150px] bg-gray-800" />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
                <div className="space-x-1 font-bold">
                  <Skeleton className="h-20 w-20 rounded-full bg-gray-800" />
                </div>
                <div className="space-x-1 font-bold">
                  <Skeleton className="h-[24px] w-[120px] bg-gray-800" />
                </div>
                <div className="text-muted-foreground">
                  <Skeleton className="h-[20px] w-[200px] bg-gray-800" />
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>
                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>
                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>

                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>

                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>

                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>

                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>

                <Card className="space-y-2 border-none bg-gray-700 p-4">
                  <Skeleton className="h-[48px] w-[60px] bg-gray-800" />
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-[20px] w-[100px] bg-gray-800" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
