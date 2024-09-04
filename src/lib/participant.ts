import { type Participant } from "@/schemas/types/whoopDataTypes";

const getParticipantNameByAddress = (
  participants: Participant[],
  smartAccountAddress: string,
) => {
  const participant = participants.find(
    (p: Participant) =>
      p.smartAccountAddress &&
      p.smartAccountAddress.toLowerCase() === smartAccountAddress.toLowerCase(),
  );

  if (participant && participant.whoopProfile.length > 0) {
    const profile = participant.whoopProfile[0];
    const firstName = profile?.firstName;
    const lastName = profile?.lastName;
    return `${firstName} ${lastName}`.trim();
  }

  const providedSmartAccountAddress = `${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}`;
  return providedSmartAccountAddress;
};

export { getParticipantNameByAddress };
