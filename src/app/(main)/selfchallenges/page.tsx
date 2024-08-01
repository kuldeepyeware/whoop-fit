import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/_components/ui/pagination";
import { ClockIcon, MedalIcon, TrophyIcon } from "lucide-react";

const SelfChallenges = () => {
  return (
    <div className="space-y-10 px-4 py-10 md:px-6">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Self Challenge</h2>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-4"></div>
      </section>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Created Self Challenges</h2>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar> */}
                <div className="font-medium">John Doe</div>
              </div>
              <Badge>Completed</Badge>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold">
                30-Day Strain Score Challenge
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Reach a daily strain score of 15 or higher for 30 days straight.
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Ends in 12 days
                </div>
              </div>
              <Button variant="secondary">
                <TrophyIcon className="mr-2 h-5 w-5" />
                View
              </Button>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar> */}
                <div className="font-medium">Jane Doe</div>
              </div>
              <Badge>Completed</Badge>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold">100% Recovery Challenge</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Achieve a 100% recovery score for 7 days in a row.
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Completed on Aug 15, 2023
                </div>
              </div>
              <Button variant="secondary">
                <MedalIcon className="mr-2 h-5 w-5" />
                View
              </Button>
            </div>
          </Card>
        </div>
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
      {/* </div> */}
    </div>
  );
};

export default SelfChallenges;
