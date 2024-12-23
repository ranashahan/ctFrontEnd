import { apiCategoryModel } from './Category';

export interface apiAssessmentModel {
  id: number;
  name: string;
  initials: string;
  scoreInitial: number | null;
  scoreMiddle: number | null;
  scoreFinal: number | null;
}

export interface ExtendedAssessmentModel extends apiAssessmentModel {
  scoreInitial: number | null;
  scoreMiddle: number | null;
  scoreFinal: number | null;
}

export interface apiAssessmentFormModel {
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
  categories: apiCategoryModel[];
  assessmentData: AssessmentData[];
  message: string;
}
interface AssessmentData {
  data: Datum[];
  totalScore: number;
}
export interface Datum {
  slavecategoryid: number;
  activityid: number;
  assessmenttype: string;
  score: number;
  assessmentdate: string;
}

export interface apiSessionModel {
  id: number;
  name: string;
  sessiondate: Date;
  locationid: any;
  resultid: any;
  stageid: any;
  titleid: any;
  vehicleid: any;
  totalscore: number;
  classdate: any;
  yarddate: any;
  weather: any;
  traffic: any;
  route: any;
  quizscore: any;
  comment: any;
  active: number;
  createdby: number;
  modifiedby: number;
  created_at: string;
  modified_at: string;
  contractorid: number;
  message: string;
  nic: string;
  drivername: string;
  driverid: number;
  trainers: string;
  assessments: DATA[];
}
export interface DATA {
  slavecategoryid: number;
  slavecategoryname: string;
  activityid: number;
  activityname: string;
  assessment_type: string;
  score: number;
  assessmentdate: string;
}

export interface apiVSessionModel {
  id: number;
  name: string;
  sessiondate: string;
  locationid: number;
  resultid: number;
  stageid: number;
  titleid: number;
  vehicleid: number;
  totalscore: number;
  classdate: string;
  yarddate: string;
  weather: string;
  traffic: string;
  route: string;
  quizscore: string;
  comment: any;
  active: number;
  driverid: number;
  drivername: string;
  nic: string;
  licensenumber: string;
  licensetypeid: number;
  licenseexpiry: string;
  licenseverified: number;
  drivercontractorid: number;
  permitnumber: string;
  permitissue: string;
  permitexpiry: string;
  drivercode: any;
  trainerid: number;
  trainername: string;
  contractorid: number;
  contractorname: string;
  assessments: AssessmentData[];
  isEdit: boolean;
  message: string;
}
