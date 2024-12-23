export interface sessionEXP {
  id: number;
  name: string;
  mastercategories: MasterCategory[];
}

export interface AssessmentFormModel {
  sessionName: string;
  sessionDate: string;
  locationId: number;
  resultId: string;
  stageId: number;
  titleId: string;
  vehicleId: string;
  totalScore: number;
  classdate: string;
  yarddate: string;
  weather: string;
  traffic: string;
  route: string;
  quizscore: string;
  comment: string;
  userid: number;
  driverId: number;
  trainerid: number;
  contractorid: number;
  categories: MasterCategory[];
  assessmentData: AssessmentData[];
  message: string;
}

interface AssessmentData {
  data: Datum[];
  totalScore: number;
}
interface Datum {
  slavecategoryid: number;
  activityid: number;
  assessmenttype: string;
  score: number;
  assessmentdate: string;
}

export interface MasterCategory {
  id: number;
  name: string;
  slavecategories: Slavecategory[];
}

export interface Slavecategory {
  id: number;
  name: string;
  initials?: string;
  activities: Activity[];
}

export interface Activity {
  id: number;
  name: string;
  initials?: string;
  scoreInitial: any;
  scoreMiddle: any;
  scoreFinal: any;
}
