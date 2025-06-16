import { inject, Injectable } from '@angular/core';
import * as QRCode from 'qrcode';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { apiVSessionModel } from '../Models/Assessment';
import { apiGenericModel } from '../Models/Generic';
import { DltypeService } from './dltype.service';
import { BloodgroupService } from './bloodgroup.service';
import { UtilitiesService } from './utilities.service';
@Injectable({
  providedIn: 'root',
})
export class ExceljsService {
  private dltypeService = inject(DltypeService);
  private bgService = inject(BloodgroupService);
  private utils = inject(UtilitiesService);

  dltypes = this.dltypeService.dltypes;
  bloodgroups = this.bgService.bloodGroups;

  constructor() {}

  async exportDriversWithQr(
    drivers: apiVSessionModel[],
    fileName: string,
    onComplete: () => void
  ) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Drivers');

      // Add headers
      worksheet.addRow([
        'Sr.',
        'Name',
        'Company',
        'NIC',
        'DL#',
        'DLType',
        'DLValidity',
        'BG',
        'ClassDate',
        'RoadTestDate',
        'Permit#',
        'RenewalDate',
        'Code',
        'Designation',
        'QR Code',
      ]);

      worksheet.headerFooter.oddFooter = 'Page &P of &N';

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];
        const qrText = `${driver.drivername}-${driver.nic}-${driver.licensenumber}-${driver.permitnumber}-${driver.permitexpiry}-${driver.name}`;
        const qrDataUrl = await QRCode.toDataURL(qrText);

        const row = worksheet.addRow([
          i + 1,
          driver.drivername,
          driver.contractorname,
          driver.nic,
          driver.licensenumber,
          this.convertGeneric(this.dltypes(), driver.licensetypeid),
          driver.licenseexpiry,
          this.convertGeneric(this.bloodgroups(), driver.bloodgroupid),
          driver.classdate,
          driver.sessiondate,
          driver.permitnumber,
          driver.permitexpiry,
          driver.drivercode,
          driver.designation,
          '',
        ]); // empty cell for QR

        // Add QR Code image
        const imageId = workbook.addImage({
          base64: qrDataUrl,
          extension: 'png',
        });

        // Place image at the corresponding cell (row starts at 1, so offset +1 for header)
        worksheet.addImage(imageId, {
          tl: { col: 14, row: i + 1 }, // Column index 3 = 4th column (QR Code)
          ext: { width: 100, height: 100 },
        });

        worksheet.getRow(i + 2).height = 100; // Adjust row height
      }

      // Export
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, fileName + '.xlsx');
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      onComplete(); // Stop loading after success or failure
    }
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
