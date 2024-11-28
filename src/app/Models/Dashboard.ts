export interface dashboardCounts {
  total_drivers: number;
  current_month_drivers: number;
  total_sessions: number;
  current_month_sessions: number;
}

export interface dashboardLocations {
  location_name: string;
  session_count: number;
}

export interface dashboardTrainers {
  trainer_name: string;
  year: number;
  month: number;
  session_count: number;
}
