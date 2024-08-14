import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import type { ProfileUserData } from "@/schemas/types/whoopDataTypes";

type ChallengeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  challengeType: "1v1" | "sponsor";
  targetUser: ProfileUserData;
};

const ChallengeDialog: React.FC<ChallengeDialogProps> = ({
  isOpen,
  onClose,
  challengeType,
  targetUser,
}) => {
  const [amount, setAmount] = useState("");
  const [endTime, setEndTime] = useState("");
  const [challengeMetric, setChallengeMetric] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement challenge creation logic here
    console.log("Creating challenge:", { amount, endTime, challengeMetric, challengeType, targetUser });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {challengeType === "1v1" ? "Create 1v1 Challenge" : "Sponsor User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4"
          />
          <Input
            type="date"
            placeholder="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mb-4"
          />
          <Select onValueChange={setChallengeMetric} value={challengeMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calories">Calories</SelectItem>
              <SelectItem value="strain">Strain</SelectItem>
              <SelectItem value="sleep">Hours of Sleep</SelectItem>
              <SelectItem value="recovery">Recovery Percentage</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="mt-4">
            {challengeType === "1v1" ? "Create Challenge" : "Sponsor User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeDialog;