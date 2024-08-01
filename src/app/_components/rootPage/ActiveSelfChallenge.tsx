import {
  CalendarDaysIcon,
  ClockIcon,
  MedalIcon,
  PlusIcon,
  TrophyIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

const ActiveSelfChallenge = () => {
  return (
    <div>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active Self Challenges</h2>
          <Button>
            <PlusIcon className="mr-2 h-5 w-5" />
            New Challenge
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar> */}
                <div className="font-medium">John Doe</div>
              </div>
              <Badge variant="secondary">Ongoing</Badge>
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
                Join
              </Button>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Avatar className="h-8 w-8">
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
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar> */}
                <div className="font-medium">Alex Smith</div>
              </div>
              <Badge variant="destructive">Upcoming</Badge>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold">10K Steps Challenge</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Hit 10,000 steps per day for 14 days straight.
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Starts on Sep 1, 2023
                </div>
              </div>
              <Button variant="secondary">
                <PlusIcon className="mr-2 h-5 w-5" />
                Join
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ActiveSelfChallenge;
