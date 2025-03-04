export interface AssessmentFormModel {
  formid: number;
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
  riskrating: string;
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

export interface SuperCategory {
  id: number;
  name: string;
  mastercategories: MasterCategory[];
}

export interface apiForm {
  id: number;
  name: string;
  active: number;
  message: string;
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

export interface apiSessionDriverReportModel {
  driverid: number;
  drivername: string;
  gender: string;
  dob: Date;
  nic: string;
  nicexpiry: Date;
  licensenumber: string;
  licensetypeid: number;
  licenseexpiry: Date;
  licenseverified: number;
  designation: string;
  department: string;
  permitnumber: string;
  permitissue: Date;
  permitexpiry: Date;
  medicalexpiry: Date;
  bloodgroupid: number;
  drivercontractorid: number;
  contractorid: number;
  visualid: number;
  ddccount: number;
  experience: number;
  code: string;
  drivercode: string;
  drivercomment: string;
  sessionid: number;
  sessioname: string;
  name: string;
  sessiondate: Date;
  locationid: number;
  resultid: number;
  stageid: number;
  titleid: number;
  vehicleid: number;
  classdate: Date;
  yarddate: Date;
  weather: string;
  traffic: string;
  route: string;
  riskrating: string;
  quizscore: number;
  sessioncomment: Text;
  sessioncontractorid: number;
  trainerid: number;
  formid: number;
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
  riskrating: string;
  quizscore: string;
  comment: any;
  active: number;
  driverid: number;
  drivername: string;
  nic: string;
  dob: Date;
  designation: string;
  department: string;
  bloodgroupid: number;
  visualid: number;
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
  clientid: number;
  clientname: string;
  assessments: AssessmentData[];
  isEdit: boolean;
  message: string;
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
  riskrating: string;
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
