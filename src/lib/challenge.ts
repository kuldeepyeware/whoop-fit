enum ChallengeStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Evaluated = 3,
  Ended = 4,
}

type BadgeVariant =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Evaluated"
  | "Ended"
  | "default";

const getChallengeTypeString = (type: number) => {
  // const types = ["HRV", "Steps", "Sleep Score", "Workout Minutes"];
  const types = [
    "Calories",
    "Strain",
    "Sleep Hours",
    "Recovery",
    "All-Around Avenger",
    "Sleep Sage",
    "Workout Wizard",
  ];

  return types[type] ?? "Unknown";
};

const formatTimeRemaining = (endTime: bigint) => {
  const now = Math.floor(Date.now() / 1000);

  const remainingSeconds = Number(endTime) - now;

  if (remainingSeconds <= 0) return "Ended";

  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

  let timeString = "Ends in";
  if (days > 0) {
    timeString += ` ${days}d`;
  }
  if (hours > 0) {
    timeString += ` ${hours}h`;
  }
  if (minutes > 0) {
    timeString += ` ${minutes}m`;
  }

  if (remainingSeconds < 60) {
    timeString = `${remainingSeconds}s remaining`;
  }

  return timeString;
};

const getBadgeVariant = (status: ChallengeStatus): BadgeVariant => {
  switch (status) {
    case ChallengeStatus.Pending:
      return "Pending";
    case ChallengeStatus.Accepted:
      return "Accepted";
    case ChallengeStatus.Rejected:
      return "Rejected";
    case ChallengeStatus.Evaluated:
      return "Evaluated";
    case ChallengeStatus.Ended:
      return "Ended";
    default:
      return "default";
  }
};

function getStartDateForLast7Days(): Date {
  const now = new Date();
  return new Date(now.setDate(now.getDate() - 7));
}

const getTomorrowDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return today.toISOString().split("T")[0];
};

const holisticTypes = [
  {
    value: "all-around",
    title: "All-Around Avenger",
    items: ["Sleep Performance", "Recovery", "Daily Strain", "Daily Calories"],
  },
  {
    value: "sleep",
    title: "Sleep Sage",
    items: ["Sleep Performance", "Sleep Consistency", "Sleep Efficiency"],
  },
  {
    value: "workout",
    title: "Workout Wizard",
    items: ["Daily Strain", "Daily Calories"],
  },
  {
    value: "longevity",
    title: "Longevity Legend (coming soon)",
    items: [
      "Resting Heart Rate",
      "Heart Rate Variability",
      "Sleep Performance",
    ],
    disabled: true,
  },
];

export {
  getBadgeVariant,
  formatTimeRemaining,
  getChallengeTypeString,
  getStartDateForLast7Days,
  getTomorrowDate,
  holisticTypes,
};
