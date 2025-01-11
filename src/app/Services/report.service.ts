import { inject, Injectable } from '@angular/core';
// import * as pdfMake from 'pdfmake/build/pdfmake';

// import pdfFonts from '../../../public/fonts/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// import pdfFonts from '../../../public/fonts/vfs_fonts.js';
// (<any>pdfMake).addVirtualFileSystem(pdfFonts);
import pdfMake from 'pdfmake/build/pdfmake.min';

// import pdfFonts from 'pdfmake/build/vfs_fonts';
// (<any>pdfMake).addVirtualFileSystem(pdfFonts);
// pdfMake.vfs = pdfFonts.vfs;

import { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { apiDriverModel } from '../Models/Driver';
import { apiSessionDriverReportModel } from '../Models/Assessment';
import { UtilitiesService } from './utilities.service';
import { ContractorService } from './contractor.service';
import { LocationService } from './location.service';
import { DltypeService } from './dltype.service';
import { TitleService } from './title.service';
import { BloodgroupService } from './bloodgroup.service';
import { VisualService } from './visual.service';
import { fontsPDF } from '../Models/Fonts';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private utils = inject(UtilitiesService);
  private cService = inject(ContractorService);
  private locationService = inject(LocationService);
  private dlTypeService = inject(DltypeService);
  private titleService = inject(TitleService);
  private bgService = inject(BloodgroupService);
  private visualService = inject(VisualService);

  private contractors = this.cService.contractors;
  private locations = this.locationService.locations;
  private dltypes = this.dlTypeService.dltypes;
  private titles = this.titleService.titles;
  private bloodgroups = this.bgService.bloodGroups;
  private visuals = this.visualService.visuals;

  /**
   * This method will generate and open pdf
   * @param sessions apiSessionDriverReportModel
   */
  async generatePdfReportSession(sessions: apiSessionDriverReportModel[]) {
    pdfMake.vfs = {
      'Roboto-Regular.ttf': fontsPDF.RobotoRegular,
      'Roboto-Bold.ttf': fontsPDF.RobotoBold,
      'Roboto-Italic.ttf': fontsPDF.RobotoItalic,
      'Roboto-BoldItalic.ttf': fontsPDF.RobotoBoldItalic,
      'Roboto-Medium.ttf': fontsPDF.RobotoMedium,
      'Tangerine-Regular.ttf': fontsPDF.TangerineRegular,
      'Tangerine-Bold.ttf': fontsPDF.TangerineBold,
      'Pacifico-Regular.ttf': fontsPDF.PacificoRegular,
      'DMSerifText-Regular.ttf': fontsPDF.DMSerifTextRegular,
      'DMSerifText-Italic.ttf': fontsPDF.DMSerifTextItalic,
    };

    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-BoldItalic.ttf',
      },
      Tangerine: {
        normal: 'Tangerine-Regular.ttf',
        bold: 'Tangerine-Bold.ttf',
      },
      Pacifico: {
        normal: 'Pacifico-Regular.ttf',
      },
      DMSerifText: {
        normal: 'DMSerifText-Regular.ttf',
        italics: 'DMSerifText-Italic.ttf',
      },
    };

    const logoAslam = await this.getBase64ImageFromURL('/img/AslamSig.png');
    const logoAmina = await this.getBase64ImageFromURL('/img/AmenaSig.png');
    const printDate = new Date().toLocaleDateString('en-US');
    const documentContent: Content[] = sessions
      .map((session, index) => {
        // debugger;
        // Content for each session

        const sessionContent: Content[] = [
          {
            text: 'certifies that',
            style: 'subheader',
            alignment: 'center',

            margin: [0, 90, 0, 10],
          },

          {
            text: `${session.drivername}`,
            style: 'name',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            text: `CNIC #:  ${session.nic}\nDriver’s Code: ${
              session.code || ''
            }`,
            style: 'details',
            alignment: 'center',
          },
          {
            text: 'of',
            style: 'subheader',
            alignment: 'center',
          },
          {
            text: `${this.utils.getGenericName(
              this.contractors(),
              session.sessioncontractorid
            )}`,
            style: 'company',
            alignment: 'center',
            margin: [0, 10, 0, 0],
          },
          {
            text: 'successfully completed',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 10, 0, 0],
          },
          {
            text:
              `${this.utils.getGenericDescription(
                this.dltypes(),
                session.licensetypeid
              )}` + ' Driver Training',
            style: 'course',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            text: '&',
            style: 'course',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'Skill Assessment',
            style: 'course',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'conducted on',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            text: `${this.utils.formatDate(
              session.classdate || ''
            )} - ${this.utils.formatDate(session.sessiondate || '')}`,
            style: 'date',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            text: `at ${this.utils.getGenericName(
              this.locations(),
              session.locationid
            )}`,
            style: 'location',
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          {
            columns: [
              {
                image: logoAmina, // Left image
                width: 70, // Set width
                alignment: 'left', // Align to left
              },
              {
                stack: [
                  {
                    qr: `${session.sessioname}`, // QR code content
                    fit: 50, // Set size for QR code
                    alignment: 'center', // Align the QR code
                  },
                  {
                    text: `Print Date: ${printDate} \nValid Till:${
                      session.permitexpiry
                    } \n STC-${this.utils.getGenericName(
                      this.titles(),
                      session.titleid
                    )}-16H`,
                    alignment: 'center',
                    style: 'verticalText',
                    margin: [0, 5, 0, 0],
                  },
                ],
                alignment: 'center', // Align the stack to center
              },
              {
                image: logoAslam, // Right image
                width: 80, // Set width
                alignment: 'right', // Align to right
              },
            ],
            margin: [10, 70, 0, 10], // Optional margin
          },

          { text: '', pageBreak: 'after' }, // Adds a page break after each session
        ];

        return sessionContent;
      })
      .flat();

    // Remove the last page break
    if (documentContent.length > 0) {
      const lastElement = documentContent[documentContent.length - 1];
      if (typeof lastElement === 'object' && 'pageBreak' in lastElement) {
        delete lastElement.pageBreak;
      }
    }

    const documentDefinition: TDocumentDefinitions = {
      version: '1.7',
      userPassword: 'consult',
      ownerPassword: 'consulttrain',
      info: {
        title: 'Certificates',
        author: 'Rana Mansoor Ahmed',
        subject: 'Assessment Certified',
        keywords: 'assessment',
      },
      watermark: {
        text: 'Consult & Train',
        color: 'gray',
        opacity: 0.1,
        bold: true,
        italics: true,
      },
      content: documentContent,
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        title: {
          fontSize: 28,
          bold: true,
          color: 'blue',
          margin: [0, 0, 0, 20],
        },
        subheader: {
          font: 'DMSerifText',
          fontSize: 14,
        },
        name: {
          fontSize: 50,
          font: 'Tangerine',
          bold: true,
          margin: [0, 0, 0, 5],
        },
        details: {
          font: 'DMSerifText',
          fontSize: 12,
          margin: [0, 0, 0, 20],
        },
        company: {
          font: 'DMSerifText',
          fontSize: 20,

          margin: [0, 0, 0, 5],
        },
        course: {
          font: 'DMSerifText',
          fontSize: 18,

          margin: [0, 0, 0, 10],
        },
        date: {
          font: 'DMSerifText',
          fontSize: 14,
          margin: [0, 0, 0, 5],
        },
        location: {
          font: 'DMSerifText',
          fontSize: 14,
          margin: [0, 0, 0, 10],
        },
        verticalText: {
          fontSize: 8,
          color: 'gray',
        },
        signature: {
          fontSize: 12,
          margin: [20, 10, 20, 0],
        },
      },
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  // /**
  //  * This method aweeen
  //  * @param contractorName contractor name
  //  * @param drivers drivers
  //  */
  // async generateDriverPdfReport(contractorName: string, drivers: any[]) {
  //   const logoUrl = await this.getBase64ImageFromURL('/img/logo.png');
  //   const currentDate = new Date().toDateString();
  //   // Define 10 drivers per page
  //   const driversPerPage = 6;
  //   const driverPages = [];

  //   for (let i = 0; i < drivers.length; i += driversPerPage) {
  //     driverPages.push(drivers.slice(i, i + driversPerPage));
  //   }

  //   // Build content for each page
  //   const documentContent: Content[] = driverPages.flatMap(
  //     (pageDrivers, pageIndex) => {
  //       // Header for the page
  //       const pageHeader: Content = {
  //         columns: [
  //           {
  //             // Image on the left
  //             image: logoUrl, // Ensure logoUrl contains the base64-encoded image or image path
  //             width: 100, // Adjust width as needed
  //             alignment: 'left',
  //             margin: [0, 0, 10, 0], // Add right margin to create space between image and text
  //           },
  //           {
  //             // Text on the right
  //             text: `ContractorName: ${contractorName}  `,
  //             style: 'header',
  //             alignment: 'center',
  //             margin: [0, 0, 0, 10],
  //           },
  //         ],

  //         margin: [0, 0, 0, 10],
  //       };
  //       const pageFooter: Content = {
  //         columns: [
  //           {
  //             // Page number on the right
  //             text: `${currentDate} - Page ${pageIndex + 1}`,
  //             alignment: 'right',
  //             fontSize: 8, // Smaller font size for the footer
  //             margin: [0, 0, 20, 0], // Add some right margin
  //           },
  //         ],
  //         margin: [0, 10, 0, 0], // Margin for the footer
  //       };

  //       // Table of driver "boxes" (each driver in a cell with border)
  //       const driverBoxes = pageDrivers.map(
  //         (driver: apiDriverModel): TableCell => ({
  //           stack: [
  //             { text: `Name: ${driver.name}`, style: 'info' },
  //             { text: `DOB: ${driver.dob}`, style: 'info' },
  //             { text: `NIC: ${driver.nic}`, style: 'info' },
  //             { text: `License: ${driver.licensenumber}`, style: 'info' },
  //             {
  //               text: `License Expiry: ${driver.licenseexpiry}`,
  //               style: 'info',
  //             },
  //             { text: `Permit: ${driver.permitnumber}`, style: 'info' },
  //             { text: `Permit Issue: ${driver.permitissue}`, style: 'info' },
  //             { text: `Permit Expiry: ${driver.permitexpiry}`, style: 'info' },
  //             { text: `Designation: ${driver.designation}`, style: 'info' },
  //             { text: `Department: ${driver.department}`, style: 'info' },
  //             {
  //               qr: `Name: ${driver.name} Nic: ${driver.nic} License: ${driver.licensenumber} Permit: ${driver.permitnumber} PermitExpiry: ${driver.permitexpiry}`,
  //               fit: 80, // Size of the QR code (adjust as needed)
  //               alignment: 'left', // Adjust alignment if needed
  //               margin: [0, 10, 0, 0], // Add some margin above the QR code
  //             },
  //           ],
  //           margin: [5, 5, 5, 5], // Add spacing inside each box
  //           border: [true, true, true, true], // Border around each driver box
  //         })
  //       );
  //       // Ensure each row has exactly 2 cells by adding an empty cell if necessary
  //       const driverGridBody = this.chunkArray(driverBoxes, 2).map((row) => {
  //         if (row.length < 2) {
  //           row.push({ text: '', border: [false, false, false, false] }); // Placeholder cell
  //         }
  //         return row;
  //       });

  //       // Create a grid layout with driver boxes (2 columns per row)
  //       const driverGrid: Content = {
  //         table: {
  //           widths: ['*', '*'], // Two boxes per row
  //           body: driverGridBody, // Organize drivers in rows of 2
  //         },
  //         layout: {
  //           paddingLeft: () => 10,
  //           paddingRight: () => 10,
  //           paddingTop: () => 10,
  //           paddingBottom: () => 10,
  //           hLineWidth: () => 1,
  //           vLineWidth: () => 1,
  //           hLineColor: () => 'black',
  //           vLineColor: () => 'black',
  //         },

  //         margin: [0, 10, 0, 10], // Space between header and table
  //       };

  //       // Return page content with header, driver grid, and page break
  //       return [
  //         pageHeader,
  //         driverGrid,
  //         pageFooter,
  //         { text: '', pageBreak: 'after' },
  //       ];
  //     }
  //   );

  //   // Remove the last page break
  //   if (documentContent.length > 0) {
  //     const lastElement = documentContent[documentContent.length - 1];
  //     if (typeof lastElement === 'object' && 'pageBreak' in lastElement) {
  //       delete lastElement.pageBreak;
  //     }
  //   }

  //   // Define PDF styles
  //   const documentDefinition: TDocumentDefinitions = {
  //     content: documentContent,
  //     styles: {
  //       header: { fontSize: 18, bold: true, alignment: 'center' },
  //       info: { fontSize: 12, margin: [0, 2, 0, 2] },
  //     },
  //   };

  //   pdfMake.createPdf(documentDefinition).open();
  // }

  /**
   * This method will open pdf for drivers' contractor
   * @param drivers drivers
   */
  public async generateDriverContractorReport(drivers: apiDriverModel[]) {
    pdfMake.vfs = {
      'Roboto-Regular.ttf': fontsPDF.RobotoRegular,
      'Roboto-Bold.ttf': fontsPDF.RobotoBold,
      'Roboto-Italic.ttf': fontsPDF.RobotoItalic,
      'Roboto-BoldItalic.ttf': fontsPDF.RobotoBoldItalic,
      'Roboto-Medium.ttf': fontsPDF.RobotoMedium,
      'Tangerine-Regular.ttf': fontsPDF.TangerineRegular,
      'Tangerine-Bold.ttf': fontsPDF.TangerineBold,
      'Pacifico-Regular.ttf': fontsPDF.PacificoRegular,
      'DMSerifText-Regular.ttf': fontsPDF.DMSerifTextRegular,
      'DMSerifText-Italic.ttf': fontsPDF.DMSerifTextItalic,
    };

    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-BoldItalic.ttf',
      },
      Tangerine: {
        normal: 'Tangerine-Regular.ttf',
        bold: 'Tangerine-Bold.ttf',
      },
      Pacifico: {
        normal: 'Pacifico-Regular.ttf',
      },
      DMSerifText: {
        normal: 'DMSerifText-Regular.ttf',
        italics: 'DMSerifText-Italic.ttf',
      },
    };
    const logoUrl = await this.getBase64ImageFromURL('/img/logo.png');
    const currentDate = new Date().toDateString();
    var docDefinition: TDocumentDefinitions = {
      version: '1.7',
      pageSize: 'A3',
      pageOrientation: 'landscape',
      userPassword: 'consult',
      ownerPassword: 'consulttrain',
      info: {
        title: 'Contractors Driver',
        author: 'Rana Mansoor Ahmed',
        subject: 'Drivers Information',
        keywords: 'drivers',
      },
      watermark: {
        text: 'Consult & Train',
        color: 'gray',
        opacity: 0.1,
        bold: true,
        italics: true,
      },
      content: [
        {
          columns: [
            {
              // Image on the left
              image: logoUrl, // Ensure logoUrl contains the base64-encoded image or image path
              width: 50, // Adjust width as needed
              alignment: 'left',
              margin: [0, 0, 10, 0], // Add right margin to create space between image and text
            },
            {
              // Text on the right
              text: `Contractor: ${this.utils.getGenericName(
                this.contractors(),
                drivers[0].contractorid
              )}  `,
              style: 'header',
              alignment: 'center',
              margin: [0, 0, 0, 10],
            },
          ],
        },
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: [
              20, 80, 40, 30, 60, 40, 60, 30, 40, 30, 50, 50, 50, 40, 40, 40,
              30, 40, 20, 30, 60, 40,
            ],

            body: [
              [
                { text: 'ID', bold: true, fillColor: '#ededed' },
                { text: 'Name', bold: true, fillColor: '#ededed' },
                { text: 'DOB', bold: true, fillColor: '#ededed' },
                { text: 'Gender', bold: true, fillColor: '#ededed' },
                { text: 'CNIC', bold: true, fillColor: '#ededed' },
                { text: 'CNIC Expiry', bold: true, fillColor: '#ededed' },
                { text: 'DL-Number', bold: true, fillColor: '#ededed' },
                { text: 'DL Type', bold: true, fillColor: '#ededed' },
                { text: 'DL Expiry', bold: true, fillColor: '#ededed' },
                { text: 'DL Verify', bold: true, fillColor: '#ededed' },
                { text: 'Designation', bold: true, fillColor: '#ededed' },
                { text: 'Department', bold: true, fillColor: '#ededed' },
                { text: 'Permit Number', bold: true, fillColor: '#ededed' },
                { text: 'Permit Issue', bold: true, fillColor: '#ededed' },
                { text: 'Permit Expiry', bold: true, fillColor: '#ededed' },
                { text: 'Medical Expiry', bold: true, fillColor: '#ededed' },
                { text: 'Blood Group', bold: true, fillColor: '#ededed' },
                { text: 'Visual', bold: true, fillColor: '#ededed' },
                { text: 'DDC #', bold: true, fillColor: '#ededed' },
                { text: 'Experience', bold: true, fillColor: '#ededed' },
                { text: 'Driver Code', bold: true, fillColor: '#ededed' },
                { text: 'Created Date', bold: true, fillColor: '#ededed' },
              ],
              ...drivers.map((driver) => [
                driver.id,
                driver.name,
                driver.dob,
                driver.gender,
                driver.nic,
                driver.nicexpiry,
                driver.licensenumber,
                this.utils.getGenericName(this.dltypes(), driver.licensetypeid),
                driver.licenseexpiry,
                this.utils.convertLicenseNumber(driver.licenseverified),
                driver.designation,
                driver.department,
                driver.permitnumber,
                driver.permitissue,
                driver.permitexpiry,
                driver.medicalexpiry,
                this.utils.getGenericName(
                  this.bloodgroups(),
                  driver.bloodgroupid
                ),
                this.utils.getGenericName(this.visuals(), driver.visualid),
                driver.ddccount,
                driver.experience + ' Years',
                driver.code,
                driver.created_at,
              ]),
            ],
          },
          margin: [0, 10, 0, 0],
        },
        {
          columns: [
            {
              // Page number on the right
              text: `Print Date: ${currentDate}`,
              alignment: 'right',
              fontSize: 8, // Smaller font size for the footer
              margin: [0, 0, 10, 0], // Add some right margin
            },
          ],
          margin: [0, 10, 0, 0], // Margin for the footer
        },
      ],
      defaultStyle: {
        fontSize: 7,
      },
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center' },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  public async generateCardPDF(drivers: apiSessionDriverReportModel[]) {
    pdfMake.vfs = {
      'Roboto-Regular.ttf': fontsPDF.RobotoRegular,
      'Roboto-Bold.ttf': fontsPDF.RobotoBold,
      'Roboto-Italic.ttf': fontsPDF.RobotoItalic,
      'Roboto-BoldItalic.ttf': fontsPDF.RobotoBoldItalic,
      'Roboto-Medium.ttf': fontsPDF.RobotoMedium,
      'Tangerine-Regular.ttf': fontsPDF.TangerineRegular,
      'Tangerine-Bold.ttf': fontsPDF.TangerineBold,
      'Pacifico-Regular.ttf': fontsPDF.PacificoRegular,
      'DMSerifText-Regular.ttf': fontsPDF.DMSerifTextRegular,
      'DMSerifText-Italic.ttf': fontsPDF.DMSerifTextItalic,
    };

    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-BoldItalic.ttf',
      },
      Tangerine: {
        normal: 'Tangerine-Regular.ttf',
        bold: 'Tangerine-Bold.ttf',
      },
      Pacifico: {
        normal: 'Pacifico-Regular.ttf',
      },
      DMSerifText: {
        normal: 'DMSerifText-Regular.ttf',
        italics: 'DMSerifText-Italic.ttf',
      },
    };

    const cardTemplate = drivers.map((driver) => {
      return {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              {
                stack: [
                  { text: 'Defensive Driving HV Permit', style: 'header' },
                  { text: `${driver.permitnumber}`, style: 'subheader' },
                  {
                    text: `Valid Upto: ${driver.permitexpiry || ''}`,
                    style: 'validUpto',
                  },
                  {
                    text: 'Trained and Assessed on UEPL ADDT Protocol',
                    style: 'training',
                  },
                  { text: `Name: ${driver.drivername}`, style: 'details' },
                  {
                    text: `Company: ${this.utils.getGenericName(
                      this.contractors(),
                      driver.sessioncontractorid
                    )}`,
                    style: 'details',
                  },
                  { text: `DL #: ${driver.licensenumber}`, style: 'details' },
                  {
                    text: `DL Type: ${this.utils.getGenericName(
                      this.dltypes(),
                      driver.licensetypeid
                    )}`,
                    style: 'details',
                  },
                  {
                    text: `DL Expiry: ${driver.licenseexpiry || ''}`,
                    style: 'details',
                  },
                  { text: `CNIC #: ${driver.nic || ''}`, style: 'details' },
                  {
                    text: `Driver Code: ${driver.code || ''}`,
                    style: 'details',
                  },
                  {
                    text: `Driver Designation: ${driver.designation || ''}`,
                    style: 'details',
                  },
                ],
              },
              {
                stack: [
                  {
                    table: {
                      widths: [80], // Fixed width for box
                      body: [
                        [
                          {
                            text: 'Photo',
                            alignment: 'center',
                            margin: [0, 30, 0, 30], // Adjust margin to center text vertically
                            border: [true, true, true, true], // Add border
                          },
                        ],
                      ],
                    },
                  },
                  {
                    qr: `Name: ${driver.drivername} Nic: ${driver.nic} License: ${driver.licensenumber} Permit: ${driver.permitnumber} PermitExpiry: ${driver.permitexpiry}`,
                    fit: 100, // Size of the QR code (adjust as needed)
                    alignment: 'center', // Adjust alignment if needed
                    margin: [0, 10, 0, 0], // Add some margin above the QR code
                  },
                ],
              },
            ],
          ],
        },
        margin: [0, 5, 0, 10], // Space between cards
      };
    });

    // Group Cards (6 per page)
    const groupedCards = [];
    for (let i = 0; i < cardTemplate.length; i += 4) {
      groupedCards.push({
        stack: cardTemplate.slice(i, i + 4),
        pageBreak: i + 4 < cardTemplate.length ? 'after' : '',
      });
    }

    const docDefinition: TDocumentDefinitions = {
      version: '1.7',
      userPassword: 'consult',
      ownerPassword: 'consulttrain',
      info: {
        title: 'Permit',
        author: 'Rana Mansoor Ahmed',
        subject: 'Permit Information',
        keywords: 'drivers',
      },
      content: groupedCards as Content[],
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
        },
        subheader: {
          fontSize: 10,
          italics: true,
          alignment: 'center',
        },
        validUpto: {
          fontSize: 10,
          bold: true,
          color: 'red',
          alignment: 'center',
        },
        training: {
          fontSize: 9,
          color: 'white',
          bold: true,
          background: 'green',
          alignment: 'center',
        },
        details: {
          fontSize: 9,
          margin: [0, 2, 0, 2],
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  // private chunkArray<T>(array: T[], chunkSize: number): T[][] {
  //   const chunks: T[][] = [];
  //   for (let i = 0; i < array.length; i += chunkSize) {
  //     chunks.push(array.slice(i, i + chunkSize));
  //   }
  //   return chunks;
  // }

  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject('Could not get canvas context');
        }
      };
      img.onerror = () => reject('Could not load image');
      img.src = url;
    });
  }
}
