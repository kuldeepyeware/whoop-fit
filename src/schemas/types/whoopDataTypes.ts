type WhoopDataType = {
  defaultAddress: string;
  whoopProfile: {
    email: string;
    user_id: number;
    last_name: string;
    first_name: string;
  };
  whoopWorkouts: Array<{
    id: number;
    end: string;
    nap: boolean;
    score: {
      strain: number;
      kilojoule: number;
      zone_duration: {
        zone_one_milli: number;
        zone_two_milli: number;
        zone_five_milli: number;
        zone_four_milli: number;
        zone_zero_milli: number;
        zone_three_milli: number;
      };
      distance_meter: number;
      max_heart_rate: number;
      percent_recorded: number;
      average_heart_rate: number;
      altitude_gain_meter: number;
      altitude_change_meter: number;
    };
    start: string;
    user_id: number;
    sport_id: number;
    created_at: string;
    updated_at: string;
    score_state: string;
    timezone_offset: string;
  }>;
  whoopRecoveries: Array<{
    score: {
      recovery_score: number;
      hrv_rmssd_milli: number;
      spo2_percentage: number;
      user_calibrating: boolean;
      skin_temp_celsius: number;
      resting_heart_rate: number;
    };
    user_id: number;
    cycle_id: number;
    sleep_id: number;
    created_at: string;
    updated_at: string;
    score_state: string;
  }>;
  whoopSleep: Array<{
    id: number;
    end: string;
    nap: boolean;
    score: {
      sleep_needed: {
        baseline_milli: number;
        need_from_recent_nap_milli: number;
        need_from_sleep_debt_milli: number;
        need_from_recent_strain_milli: number;
      };
      stage_summary: {
        disturbance_count: number;
        sleep_cycle_count: number;
        total_awake_time_milli: number;
        total_in_bed_time_milli: number;
        total_no_data_time_milli: number;
        total_rem_sleep_time_milli: number;
        total_light_sleep_time_milli: number;
        total_slow_wave_sleep_time_milli: number;
      };
      respiratory_rate: number;
      sleep_efficiency_percentage: number;
      sleep_consistency_percentage: number;
      sleep_performance_percentage: number;
    };
    start: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    score_state: string;
    timezone_offset: string;
  }>;
  whoopCycles: Array<{
    id: number;
    end: string | null;
    score: {
      strain: number;
      kilojoule: number;
      max_heart_rate: number;
      average_heart_rate: number;
    };
    start: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    score_state: string;
    timezone_offset: string;
  }>;
  whoopBodyMeasurement: {
    height_meter: number;
    max_heart_rate: number;
    weight_kilogram: number;
  };
};

export { type WhoopDataType };
