import { inject, Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { UtilitiesService } from './utilities.service';
import { apiGenericModel } from '../Models/Generic';
import { LocationService } from './location.service';
import { VisualService } from './visual.service';
import { StageService } from './stage.service';
import { TitleService } from './title.service';
import { DltypeService } from './dltype.service';
import { BloodgroupService } from './bloodgroup.service';
import { VehicleService } from './vehicle.service';
import { ResultService } from './result.service';
import { apiSessionDriverReportModel } from '../Models/Assessment';
import { ContractorService } from './contractor.service';
import { TrainerService } from './trainer.service';
import { apiTrainingModel } from '../Models/Training';
import { CourseService } from './course.service';
import { CategoryService } from './category.service';
import { ClientService } from './client.service';
import { IndustriesService } from './industries.service';
@Injectable({
  providedIn: 'root',
})
export class ExcelreportService {
  private locationService = inject(LocationService);
  private visualService = inject(VisualService);
  private stageService = inject(StageService);
  private titleService = inject(TitleService);
  private dltypeService = inject(DltypeService);
  private bgService = inject(BloodgroupService);
  private vehicleService = inject(VehicleService);
  private utils = inject(UtilitiesService);
  private resultService = inject(ResultService);
  private cService = inject(ContractorService);
  private trainerService = inject(TrainerService);
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private clientService = inject(ClientService);
  private industryService = inject(IndustriesService);

  locations = this.locationService.locations;
  visuals = this.visualService.visuals;
  stages = this.stageService.stages;
  titles = this.titleService.titles;
  dltypes = this.dltypeService.dltypes;
  bloodgroups = this.bgService.bloodGroups;
  vehicles = this.vehicleService.vehicles;
  results = this.resultService.results;
  contractors = this.cService.contractors;
  trainers = this.trainerService.trainers;
  courses = this.courseService.courses;
  categories = this.categoryService.categories;
  clients = this.clientService.clients;
  industries = this.industryService.industries;

  exportJson(param: any, fileName: string) {
    //console.log(param);
    const ws = XLSX.utils.json_to_sheet(param);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName + new Date().getTime()}.xlsx`);
  }

  /**
   * This method will download all the drivers & session info except assessment scores
   * @param param SessionDriver report data
   * @param fileName file name
   */
  exportReportAll(param: apiSessionDriverReportModel[], fileName: string) {
    const flattenedData = param.map((item: apiSessionDriverReportModel) => {
      const row: any = {
        DriverDBID: item.driverid,
        DriverName: item.drivername,
        DriverGender: item.gender,
        DriverDOB: item.dob,
        DriverNIC: item.nic,
        DriverNICExpiry: item.nicexpiry,
        DriverLicenseNumber: item.licensenumber,
        DriverLicenseType: this.convertGeneric(
          this.dltypes(),
          item.licensetypeid
        ),
        DriverLicenseExpiry: item.licenseexpiry,
        DriverLicenseVerify: this.utils.convertLicenseNumber(
          item.licenseverified
        ),
        DriverDesignation: item.designation,
        DriverDepartment: item.department,
        DriverPermitNumber: item.permitnumber,
        DriverPermitIssue: item.permitissue,
        DriverPermitExpiry: item.permitexpiry,
        DriverMedicalExpiry: item.medicalexpiry,
        DriverBloodGroup: this.convertGeneric(
          this.bloodgroups(),
          item.bloodgroupid
        ),
        DriverContractor: this.convertGeneric(
          this.contractors(),
          item.drivercontractorid
        ),
        DriverVisual: this.convertGeneric(this.visuals(), item.visualid),
        DriverDefensiveCourses: item.ddccount,
        DriverExperience: item.experience,
        DriverCode: item.code,
        DriverComment: item.drivercomment,
        SesionDBID: item.sessionid,
        SessionID: item.sessioname,
        SessionDate: item.sessiondate,
        Location: this.convertGeneric(this.locations(), item.locationid),
        Result: this.convertGeneric(this.results(), item.resultid),
        Stage: this.convertGeneric(this.stages(), item.stageid),
        Title: this.convertGeneric(this.titles(), item.titleid),
        Vehicle: this.convertGeneric(this.vehicles(), item.vehicleid),
        ClassDate: item.classdate,
        YardDate: item.yarddate,
        Weather: item.weather,
        Traffic: item.traffic,
        Route: item.route,
        OverAllRisk: item.riskrating,
        QuizScore: item.quizscore,
        Comment: item.sessioncomment,
        SessionContractor: this.convertGeneric(
          this.contractors(),
          item.sessioncontractorid
        ),
        Trainer: this.convertGeneric(this.trainers(), item.trainerid),
      };
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName + new Date().getTime()}.xlsx`);
  }

  /**
   * This method will download training data
   * @param param training report data
   * @param fileName file name
   */
  exportTrainingReportAll(param: apiTrainingModel[], fileName: string) {
    const flattenedData = param.map((item: apiTrainingModel) => {
      const row: any = {
        TrainingDBID: item.id,
        TrainingName: item.name,
        PlanDate: item.plandate,
        StartDate: item.startdate,
        EndDate: item.enddate,
        Course: this.convertGeneric(this.courses(), item.courseid),
        Category: this.convertGeneric(this.categories(), item.categoryid),
        Program: this.convertGeneric(this.titles(), item.titleid),
        Sponsor: this.convertGeneric(this.clients(), item.clientid),
        Contractor: this.convertGeneric(this.contractors(), item.contractorid),
        Trainer: this.convertGeneric(this.trainers(), item.trainerid),
        Location: this.convertGeneric(this.locations(), item.locationid),
        Total: item.total,
        Received: item.amountreceived,
        Status: item.status,
        Source: item.source,
        Sessions: item.sessioncount,
        Industry: this.convertGeneric(this.industries(), item.industriesid),
      };
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName + new Date().getTime()}.xlsx`);
  }

  /**
   * This method will download training finance data
   * @param param training report data
   * @param fileName file name
   */
  exportTrainingFinanceReport(param: apiTrainingModel[], fileName: string) {
    const flattenedData = param.map((item: apiTrainingModel) => {
      const row: any = {
        PlanDate: item.plandate,
        TrainingName: item.name,
        Sponsor: this.convertGeneric(this.clients(), item.clientid),
        Contractor: this.convertGeneric(this.contractors(), item.contractorid),
        ChargedAmount: item.charges,
        TransportationExpense: item.transportation,
        MiscExpense: item.miscexpense,
        Tax: item.tax,
        TotalAmount: item.total,
        ReceivedAmount: item.amountreceived,
        ReceivedAmountDate: item.amountreceiveddate,
        Invoice: item.invoicenumber,
        InvoiceDate: item.invoicedate,
        BankName: item.bank,
        Cheque: item.cheque,
      };
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financial');
    XLSX.writeFile(wb, `${fileName + new Date().getTime()}.xlsx`);
  }

  /**
   * This method will export excel sheet for assessment scores
   * @param data assessment score along with driver & session info
   * @param fileName file name
   */
  exportToExcel(data: any[], fileName: string): void {
    const uniqueActivityNames = Array.from(
      new Set(
        data.flatMap((item) =>
          item.assessments
            .filter(
              (assessment: { assessment_type: string }) =>
                assessment.assessment_type === 'Final'
            )
            .map(
              (assessment: {
                activityname: string;
                slavecategoryid: number;
              }) => ({
                activityname: assessment.activityname,
                slavecategoryid: assessment.slavecategoryid,
              })
            )
        )
      )
    ).sort((a, b) => a.slavecategoryid - b.slavecategoryid);

    // 2. Flatten data into rows with dynamic columns for activity scores
    const flattenedData = data.map((item) => {
      const row: any = {
        Stage: this.convertGeneric(this.stages(), item.stageid),
        Title: this.convertGeneric(this.titles(), item.titleid),
        SessionID: item.name,
        Trainer: item.trainername,
        Location: this.convertGeneric(this.locations(), item.locationid),
        DriverName: item.drivername,
        Contractor: item.contractorname,
        DriverNIC: item.nic,
        DriverDOB: item.dob,
        DriverCode: item.drivercode,
        DriverLicense: item.licensenumber,
        DriverLicenseType: this.convertGeneric(
          this.dltypes(),
          item.licensetypeid
        ),
        DriverLicenseVerify: this.utils.convertLicenseNumber(
          item.licenseverified
        ),
        DriverPermit: item.permitnumber,
        DriverPermitIssue: item.permitissue,
        DriverPermitExpire: item.permitexpiry,
        DriverBlood: this.convertGeneric(this.bloodgroups(), item.bloodgroupid),
        DriverVisual: this.convertGeneric(this.visuals(), item.visualid),
        ClassRoom: item.classdate,
        SessionDate: item.sessiondate,
        VehicleUsed: this.convertGeneric(this.vehicles(), item.vehicleid),
        SessionResult: this.convertGeneric(this.results(), item.resultid),
      };
      uniqueActivityNames.forEach((activity) => {
        const assessment = item.assessments.find(
          (a: { activityname: string; assessment_type: string }) =>
            a.activityname === activity.activityname &&
            a.assessment_type === 'Final'
        );

        row[activity.activityname] = assessment ? assessment.score : null; // Add score or null
      });
      row['TotalScore'] = item.totalscore;
      return row;
    });
    // 3. Convert JSON to a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenedData);

    // 4. Create a workbook and add the worksheet
    const workbook: XLSX.WorkBook = {
      Sheets: { Sheet1: worksheet },
      SheetNames: ['Sheet1'],
    };

    // 5. Write the workbook and download it
    XLSX.writeFile(workbook, `${fileName + new Date().getTime()}.xlsx`);
  }

  /**
   * This method will return item name
   * @param items signal
   * @param itemid number
   * @returns string name
   */
  private convertGeneric(items: apiGenericModel[], itemid: number): string {
    return this.utils.getGenericName(items, itemid);
  }
}
