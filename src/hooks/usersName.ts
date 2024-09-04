import { useState, useRef, useEffect } from "react";
import { api } from "@/trpc/react";
import { type Participant } from "@/schemas/types/whoopDataTypes";

const useParticipantsCache = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const fetchedRef = useRef(false);

  const { data, error } = api.whoop.getAllParticipantsName.useQuery(undefined, {
    enabled: !fetchedRef.current,
  });

  useEffect(() => {
    if (data && !fetchedRef.current) {
      setParticipants(data);
      fetchedRef.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch participants:", error);
    }
  }, [error]);

  return participants;
};

export default useParticipantsCache;
