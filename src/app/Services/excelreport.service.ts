import { inject, Inject, Injectable } from '@angular/core';
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

  locations = this.locationService.locations;
  visuals = this.visualService.visuals;
  stages = this.stageService.stages;
  titles = this.titleService.titles;
  dltypes = this.dltypeService.dltypes;
  bloodgroups = this.bgService.bloodGroups;
  vehicles = this.vehicleService.vehicles;

  exportJson(param: any, fileName: string) {
    //console.log(param);
    const ws = XLSX.utils.json_to_sheet(param);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RanaTest');
    XLSX.writeFile(wb, `${fileName + new Date().getTime()}.xlsx`);
  }

  exportToExcel(data: any[], fileName: string): void {
    // 1. Extract unique activity names to use as column headers
    const uniqueActivityNames = Array.from(
      new Set(
        data.flatMap((item) =>
          item.assessments
            .filter(
              (assessment: { assessment_type: string }) =>
                assessment.assessment_type === 'Final'
            )
            .map(
              (assessment: { activityname: string }) => assessment.activityname
            )
        )
      )
    );

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
        DriverLicenseVerify: this.convertNumber(item.licenseverified),
        DriverPermit: item.permitnumber,
        DriverPermitIssue: item.permitissue,
        DriverPermitExpire: item.permitexpiry,
        DriverBlood: this.convertGeneric(this.bloodgroups(), item.bloodgroupid),
        DriverVisual: this.convertGeneric(this.visuals(), item.visualid),
        ClassRoom: item.classdate,
        SessionDate: item.sessiondate,
        VehicleUsed: this.convertGeneric(this.vehicles(), item.vehicleid),
      }; // Include driver name
      uniqueActivityNames.forEach((activity) => {
        const assessment = item.assessments.find(
          (a: { activityname: string; assessment_type: string }) =>
            a.activityname === activity && a.assessment_type === 'Final'
        );
        row[activity] = assessment ? assessment.score : null; // Add score or null
      });
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

  convertGeneric(items: apiGenericModel[], itemid: number) {
    return this.utils.getGenericName(items, itemid);
  }

  convertNumber(item: number) {
    if (item === 1) {
      return 'Not Verified';
    } else if (item === 2) {
      return 'Verified';
    } else {
      return 'Not-Configured';
    }
  }
}
