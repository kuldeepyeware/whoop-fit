interface Cycle {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  score_state: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

interface Sleep {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: string;
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

interface Recovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: string;
  score: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number;
    skin_temp_celsius: number;
  };
}

interface Workout {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: string;
  score: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter: number;
    altitude_gain_meter: number;
    altitude_change_meter: number;
    zone_duration: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  };
}

interface UserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface BodyMeasurement {
  height_meter: number;
  weight_kilogram: number;
  max_heart_rate: number;
}

interface ProfileDataCycle {
  strain: string;
  kilojoule: string;
}

interface ProfileDataSleep {
  sleepEfficiencyPercentage: string;
}

interface ProfileDataRecovery {
  recoveryScore: string;
  hrvRmssd: string;
  restingHeartRate: string;
}

interface MetricData {
  value: number;
  change: number;
}

interface ProfileUserData {
  smartAccountAddress: string | null;
  id?: string | null;
  whoopProfile: {
    email: string;
    firstName: string;
    lastName: string;
    userId?: string;
  }[];
  challengeCompleted: number;
  metrics: {
    strain: MetricData;
    calories: MetricData;
    sleepEfficiency: MetricData;
    recoveryScore: MetricData;
    hrv: MetricData;
    restingHeartRate: MetricData;
  };
  image: string | null;
}

interface PublicProfileUserData {
  smartAccountAddress: string | null;
  id?: string | null;
  whoopProfile: {
    email: string;
    firstName: string;
    lastName: string;
    userId?: string;
  }[];
  whoopCycles: ProfileDataCycle[];
  whoopRecoveries: ProfileDataRecovery[];
  whoopSleeps: ProfileDataSleep[];
  challengeCompleted: number;
}

interface UserListData {
  privyId: string;
  smartAccountAddress: string | null;
  whoopProfile: {
    firstName: string;
    userId: string;
  }[];
  whoopCycles: ProfileDataCycle[];
  whoopRecoveries: ProfileDataRecovery[];
  whoopSleeps: ProfileDataSleep[];
}

type WhoopCycle = {
  id: string;
  userId: string;
  cycleId: string;
  createdAtByWhoop: Date;
  updatedAtByWhoop: Date;
  start: Date;
  end: Date | null;
  timezoneOffset: string;
  scoreState: string;
  strain: number;
  kilojoule: number;
  averageHeartRate: number;
  maxHeartRate: number;
  createdAt: Date;
  updatedAt: Date;
};

type WhoopSleep = {
  id: string;
  userId: string;
  sleepId: string;
  createdAtByWhoop: Date;
  updatedAtByWhoop: Date;
  start: Date;
  end: Date;
  timezoneOffset: string;
  nap: boolean;
  scoreState: string;
  totalInBedTimeMilli: number;
  totalAwakeTimeMilli: number;
  totalNoDataTimeMilli: number;
  totalLightSleepTimeMilli: number;
  totalSlowWaveSleepTimeMilli: number;
  totalRemSleepTimeMilli: number;
  sleepCycleCount: number;
  disturbanceCount: number;
  baseline_milli_sleep_needed: number;
  need_from_sleep_debt_milli: number;
  need_from_recent_strain_milli: number;
  need_from_recent_nap_milli: number;
  respiratoryRate: number | null;
  sleepPerformancePercentage: number | null;
  sleepConsistencyPercentage: number | null;
  sleepEfficiencyPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type WhoopRecovery = {
  id: string;
  userId: string;
  cycleId: string;
  sleepId: string;
  createdAtByWhoop: Date;
  updatedAtByWhoop: Date;
  scoreState: string;
  userCalibrating: boolean;
  recoveryScore: number;
  restingHeartRate: number;
  hrvRmssd: number;
  spo2Percentage: number | null;
  skinTempCelsius: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type WhoopData = {
  whoopCycles: WhoopCycle[];
  whoopSleeps: WhoopSleep[];
  whoopRecoveries: WhoopRecovery[];
};

type ChallengeValue =
  | number
  | {
      calories?: number;
      strain?: number;
      sleep?: number;
      recovery?: number;
      sleepPerformance?: number;
      sleepEfficiency?: number;
      sleepConsistency?: number;
    };

type ChallengeData = {
  currentValue: ChallengeValue;
  lastMonthValue: ChallengeValue;
};

interface Participant {
  smartAccountAddress: string | null;
  whoopProfile: {
    firstName: string;
    lastName: string;
  }[];
}

export type {
  Cycle,
  BodyMeasurement,
  UserProfile,
  Workout,
  Recovery,
  Sleep,
  ProfileUserData,
  UserListData,
  PublicProfileUserData,
  WhoopData,
  ChallengeData,
  Participant,
};
