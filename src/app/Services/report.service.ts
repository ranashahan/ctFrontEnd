import { inject, Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake.min';

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  ImageRun,
  TextRun,
  ShadingType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  SectionType,
  Header,
  Footer,
  ISectionOptions,
  SymbolRun,
  HeightRule,
} from 'docx';
import QRCode from 'qrcode';

import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { apiDriverModel } from '../Models/Driver';
import { apiVSessionModel } from '../Models/Assessment';
import { UtilitiesService } from './utilities.service';
import { ContractorService } from './contractor.service';
import { LocationService } from './location.service';
import { DltypeService } from './dltype.service';
import { TitleService } from './title.service';
import { BloodgroupService } from './bloodgroup.service';
import { VisualService } from './visual.service';
import { fontsPDF } from '../Models/Fonts';
import { TrainerService } from './trainer.service';
import { VehicleService } from './vehicle.service';
import { ResultService } from './result.service';
import { AuthService } from './auth.service';

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
  private trainerService = inject(TrainerService);
  private vehicleService = inject(VehicleService);
  private resultsService = inject(ResultService);
  private authService = inject(AuthService);

  private contractors = this.cService.contractors;
  private locations = this.locationService.locations;
  private dltypes = this.dlTypeService.dltypes;
  private titles = this.titleService.titles;
  private bloodgroups = this.bgService.bloodGroups;
  private visuals = this.visualService.visuals;
  private trainers = this.trainerService.trainers;
  private vehicles = this.vehicleService.vehicles;
  private results = this.resultsService.results;

  /**
   * This method will generate and open pdf
   * @param sessions apiVSessionModel
   */
  public async generatePdfReportSession(sessions: apiVSessionModel[]) {
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

    const logoAslam = await this.getBase64ImageFromURL('/img/AslamSig1.png');
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
            text:
              `CNIC #: ${session.nic}` +
              (session.drivercode
                ? `\nDriver’s Code: ${session.drivercode}`
                : '\n '),
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
              session.contractorid
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
            text: `Defensive Driving Course`,
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
            text: `for ${this.utils.getGenericName(
              this.vehicles(),
              session.vehicleid
            )} driver`,
            style: 'subheader',
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
            text:
              session.classdate === session.sessiondate
                ? `${this.utils.formatDate(session.sessiondate || '')}`
                : `${this.utils.formatDate(
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
                    qr: `${session.name}`, // QR code content
                    fit: 50, // Set size for QR code
                    alignment: 'center', // Align the QR code
                  },
                  {
                    text: `Print Date: ${this.utils.formatDatetoddMMMYYYY(
                      printDate
                    )} \nValid Thru:${this.utils.formatDatetoddMMMYYYY(
                      session.permitexpiry
                    )}`,
                    alignment: 'center',
                    style: 'verticalText',
                    margin: [0, 3, 0, 0],
                  },
                ],
                alignment: 'center', // Align the stack to center
              },
              {
                image: logoAslam, // Right image
                width: 80, // Set width
                alignment: 'right', // Align to right
                margin: [0, 20, 10, 0],
              },
            ],
            margin: [10, 60, 0, 0], // Optional margin
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
      // userPassword: 'consult',
      // ownerPassword: 'consulttrain',
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

  public async generateCardPDF(drivers: apiVSessionModel[]) {
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
                    text: `Company: ${driver.contractorname}`,
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
                    text: `Driver Code: ${driver.drivercode || ''}`,
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

  /**
   * This method will convert image into Base54
   * @param url
   * @returns image base64
   */
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

  /**
   * This method will generate Docx file
   * @param drivers API Sessions Driver Reprot
   */
  async generateWordSummary(
    drivers: apiVSessionModel[],
    onComplete: () => void
  ) {
    try {
      const sections: ISectionOptions[] = [];
      const logo = await this.utils.loadImage('img/logo.png');
      const footer = new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `requested: ${this.authService.getUsername()}`, // Left-aligned username
                size: 16,
              }),
              new TextRun({
                text: `\t\t\tConsult & Train\t\t\t`, // Centered company name
                size: 16,
                bold: true,
              }),
              new TextRun({
                text: `Printed on: ${new Date().toDateString()}`, // Right-aligned date
                size: 16,
              }),
            ],
          }),
        ],
      });
      const header = new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new ImageRun({
                type: 'png',
                data: logo, // Your loaded image buffer
                transformation: { width: 40, height: 30 },
              }),
            ],
          }),
        ],
      });

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];
        const qrcodeString = `Name: ${driver.drivername} SessionID: ${driver.name}`;

        // Generate QR Codes
        const qrCode1 = await this.generateQRCode(qrcodeString);
        const base64Data = qrCode1.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = new Uint8Array(
          atob(base64Data)
            .split('')
            .map((char) => char.charCodeAt(0))
        );

        // Create document
        const sessionContent = [
          new Paragraph({
            children: [
              new TextRun({
                text: `Consult & Train (Pvt.) Limited`,
                bold: true,
                size: 36,
              }),
              new TextRun({ break: 1 }), // Forces a line break
              new TextRun({
                text: driver.titleid
                  ? `${this.utils.getGenericDescription(
                      this.titles(),
                      driver.titleid
                    )} Training & Skill Assessment Summary`
                  : 'Training & Skill Assessment Summary',
                size: 32,
              }),
              new TextRun({ break: 1 }), // Forces a line break
              new TextRun({
                text: `for `,
                italics: true,
                size: 32,
              }),

              new TextRun({
                text: `${driver.contractorname}`,
                bold: true,
                size: 32,
              }),
            ],
            heading: 'Title',
          }),
          new Paragraph({
            alignment: AlignmentType.END,
            children: [
              new ImageRun({
                type: 'png',
                data: imageBuffer,
                transformation: { width: 50, height: 50 },
                altText: {
                  title: 'QR Code',
                  description: 'Generated QR Code',
                  name: 'QRCode',
                },
              }),
            ],
          }),
          new Paragraph({
            text: `Particulars:`,
            heading: 'Heading2',
            thematicBreak: true,
          }),
          new Paragraph({
            text: `Participant Info:`,
            heading: 'Heading3',
            spacing: { before: 100 },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE, // Ensure table spans the full width
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Name:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${driver.drivername}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Date of Birth:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.dob
                              ? `${this.utils.formatDatetoddMMMYYYY(
                                  driver.dob
                                )}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `N.I.C. #:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${driver.nic}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `License #:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${driver.licensenumber}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `License Type:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${this.utils.getGenericName(
                              this.dltypes(),
                              driver.licensetypeid
                            )}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `License Expiry:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.licenseexpiry
                              ? `${this.utils.formatDatetoddMMMYYYY(
                                  driver.licenseexpiry
                                )}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Permit #:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.permitnumber
                              ? `${driver.permitnumber}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Permit Expiry:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.permitexpiry
                              ? `${this.utils.formatDatetoddMMMYYYY(
                                  driver.permitexpiry
                                )}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Medical Validity:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.medicalexpiry
                              ? `${this.utils.formatDatetoddMMMYYYY(
                                  driver.medicalexpiry
                                )}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Experience:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.experience
                              ? `${driver.experience} Years`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: `Assessment Info:`,
            heading: 'Heading3',
            spacing: { before: 100 },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE, // Ensure table spans the full width
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Registration #:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${driver.name}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Session Date:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${this.utils.formatDatetoddMMMYYYY(
                              driver.sessiondate
                            )}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Venue:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${this.utils.getGenericName(
                              this.locations(),
                              driver.locationid
                            )}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Class Date:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.classdate
                              ? `${this.utils.formatDatetoddMMMYYYY(
                                  driver.classdate
                                )}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Risk Rating:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: driver.riskrating
                              ? `${driver.riskrating}`
                              : '',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Result:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          driver.resultid === 7001
                            ? new TextRun({
                                text: `${this.utils.getGenericDescription(
                                  this.results(),
                                  driver.resultid
                                )} `,
                                size: 20,
                                color: '11a53c',
                              })
                            : new TextRun({
                                text: `${this.utils.getGenericDescription(
                                  this.results(),
                                  driver.resultid
                                )} `,
                                size: 20,
                                color: '#FF0000',
                              }),
                          driver.resultid === 7001
                            ? new SymbolRun('F0FE') // ✅ Show 'F0FE' symbol when resultid is 7001
                            : new TextRun({ text: 'x', size: 20 }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Trainer:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${this.utils.getGenericName(
                              this.trainers(),
                              driver.trainerid
                            )}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Total Score:`,
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                      right: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${driver.totalscore}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      left: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: 'FFFFFF',
                      },
                    },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph(''),
          new Paragraph({
            text: `Assessment Score:`,
            heading: 'Heading2',
            thematicBreak: true,
          }),
          ...this.createCategorySections(driver.assessments),
          new Paragraph(''),
          new Paragraph({
            text: `Comment:`,
            heading: 'Heading2',
            thematicBreak: true,
          }),
          new Paragraph({
            children: driver.comment
              ? this.generateDocWithMultiLineComment(driver.comment)
              : [new TextRun('N/A')],
          }),
        ];

        // ** Add Trainer Signature at the End of Each Driver's Summary **
        sessionContent.push(
          new Paragraph({
            alignment: AlignmentType.CENTER, // Center align at bottom
            spacing: { before: 1000 }, // Push it towards bottom of page
            children: [
              new TextRun({
                text: 'This document is system-generated and does not require a signature.',
                size: 16,
                italics: true,
                // underline: { type: 'single' }, // Optional underline
              }),
            ],
          })
        );

        sections.push({
          properties: {
            type: SectionType.CONTINUOUS, // Keeps content in one section
          },
          children: sessionContent,
          headers: {
            default: header,
          },
          footers: {
            default: footer,
          },
        });

        // Add a page break after each session except the last one
        if (i < drivers.length - 1) {
          sections.push({
            properties: {
              type: SectionType.NEXT_PAGE, // Forces next session to start on a new page
            },
            children: [], // Empty paragraph for proper formatting
          });
        }
      }

      // Create Document with the sections
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: 'Normal',
              name: 'Normal',
              run: {
                font: 'Arial',
                size: 16, // 12pt font size
              },
            },
          ],
        },
        sections, // Add all sections here
      });

      // Download the document
      const blob = await Packer.toBlob(doc);
      this.downloadBlob(blob, 'Driver_Summary.docx');
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      onComplete(); // Stop loading after success or failure
    }
  }

  /**
   * This method only for support summery docx
   * @param assessments assessments
   * @returns Paragraph
   */
  private createCategorySections(assessments: any[]): (Paragraph | Table)[] {
    const groupedAssessments: { [key: string]: any[] } = {};

    // Group assessments by slavecategoryname
    assessments.forEach((assessment) => {
      if (!groupedAssessments[assessment.slavecategoryname]) {
        groupedAssessments[assessment.slavecategoryname] = [];
      }
      groupedAssessments[assessment.slavecategoryname].push(assessment);
    });

    let elements: (Paragraph | Table)[] = [];

    Object.keys(groupedAssessments).forEach((category) => {
      elements.push(
        new Paragraph({
          text: category,
          heading: 'Heading3',
          spacing: { before: 100 },
        })
      );

      const categoryAssessments = groupedAssessments[category];

      // Instead of pushing into `Paragraph[]`, we directly add the Table object
      elements.push(this.createAssessmentsTable(categoryAssessments));
    });

    return elements;
  }

  /**
   * This method for dynamically created table
   * @param assessments assessments
   * @returns Table
   */
  private createAssessmentsTable(assessments: any[]): Table {
    // Step 1: Group assessments by activityid
    const groupedAssessments: { [key: number]: any } = {};

    assessments.forEach((assessment) => {
      if (!groupedAssessments[assessment.activityid]) {
        groupedAssessments[assessment.activityid] = {
          activityname: assessment.activityname,
          initialScore: '',
          middleScore: '',
          finalScore: '',
        };
      }

      if (assessment.assessment_type === 'Initial') {
        groupedAssessments[assessment.activityid].initialScore = String(
          assessment.score
        );
      } else if (assessment.assessment_type === 'Middle') {
        groupedAssessments[assessment.activityid].middleScore = String(
          assessment.score
        );
      } else if (assessment.assessment_type === 'Final') {
        groupedAssessments[assessment.activityid].finalScore = String(
          assessment.score
        );
      }
    });

    // Step 2: Determine if Initial and Middle score columns are needed
    const hasInitial = Object.values(groupedAssessments).some(
      (a: any) => a.initialScore
    );
    const hasMiddle = Object.values(groupedAssessments).some(
      (a: any) => a.middleScore
    );

    // Step 3: Create header row dynamically
    const headerRowCells = [
      new TableCell({
        width: { size: 80, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Activity Name', bold: true })],
          }),
        ],
        shading: { fill: 'D3D3D3' }, // Light gray background
      }),
    ];

    if (hasInitial) {
      headerRowCells.push(
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Initial Score', bold: true })],
            }),
          ],
          shading: { fill: 'D3D3D3' }, // Light gray background
        })
      );
    }

    if (hasMiddle) {
      headerRowCells.push(
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Middle Score', bold: true })],
            }),
          ],
          shading: { fill: 'D3D3D3' }, // Light gray background
        })
      );
    }

    headerRowCells.push(
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Final Score', bold: true })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: 'D3D3D3' }, // Light gray background
      })
    );

    // Step 4: Build table rows (each activity gets one row)
    const dataRows = Object.values(groupedAssessments).map((activity: any) => {
      const rowCells = [
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph(activity.activityname)],
        }),
      ];

      if (hasInitial) {
        rowCells.push(
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: activity.initialScore
                      ? String(activity.initialScore)
                      : '',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          })
        );
      }

      if (hasMiddle) {
        rowCells.push(
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: activity.middleScore
                      ? String(activity.middleScore)
                      : '',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          })
        );
      }

      rowCells.push(
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: activity.finalScore ? String(activity.finalScore) : '',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        })
      );

      return new TableRow({ children: rowCells });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headerRowCells }), // Add header row
        ...dataRows, // Add all data rows
      ],
    });
  }

  /**
   * This method will generate multi lines comment
   * @param comment string
   * @returns string comments
   */
  private generateDocWithMultiLineComment(comment: string): TextRun[] {
    return comment.split(/\r?\n/).flatMap((line) => [
      new TextRun({ text: line, break: 1 }), // Ensure each line appears separately in Word
    ]);
  }

  /**
   * This method will generate Docx file
   * @param drivers API Session Driver Reprot
   * @param onComplete onComplete
   */
  async generateWordCards(drivers: apiVSessionModel[], onComplete: () => void) {
    try {
      const tableRows: TableRow[] = [];

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];
        const qrcodeString = `Name: ${driver.drivername} NIC: ${driver.nic} License: ${driver.licensenumber} Permit: ${driver.permitnumber} Expiry: ${driver.permitexpiry} SessionID: ${driver.name}`;
        let cardColor: string;
        let cardWording: string;
        let cardTitle: string;
        switch (driver.formid) {
          case 16001:
            if (driver.contractorid === 5001) {
              cardColor = '#DE3163';
            } else {
              cardColor = '#008000';
            }
            cardWording = 'Trained and Assessed on UEPL ADDT Protocol';
            break;
          case 16002:
            cardColor = 'FF7F50';
            cardWording = 'Trained and Assessed on DDT Protocol';
            break;
          case 16003:
            cardColor = '999999';
            cardWording =
              'Trained and Assessed on Client Company ADDT Protocol';
            break;
          case 16004:
            cardColor = 'FFFF00';
            cardWording =
              'Trained and Assessed on Defensive Driving Training Protocol';
            break;
          default:
            cardColor = '11a53c';
            cardWording = 'Trained and Assessed on UEPL ADDT Protocol';
            break;
        }

        switch (driver.titleid) {
          case 9004:
            cardTitle = 'Defensive Driving LV Permit';
            break;
          case 9001:
            cardTitle = 'Defensive Driving LV Permit';
            break;
          default:
            cardTitle = 'Defensive Driving HV Permit';
            break;
        }

        // Generate QR Codes
        const qrCode1 = await this.generateQRCode(qrcodeString);
        const logo = await this.utils.loadImage('img/logo.png');
        const dummyImg = await this.utils.loadImage('img/dummy.jpg');
        const driverCard1 = this.createDriverCard(
          driver,
          qrCode1,
          logo,
          dummyImg,
          cardTitle,
          cardColor,
          cardWording
        );

        tableRows.push(new TableRow({ children: [driverCard1] }));
      }

      // Create document
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: 'Normal',
              name: 'Normal',
              run: {
                font: 'Arial',
                size: 24, // 12pt font size (1pt = 2 half-points)
              },
            },
          ],
        },
        sections: [
          {
            children: [
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              }),
            ],
          },
        ],
      });

      // Download the document
      const blob = await Packer.toBlob(doc);
      this.downloadBlob(blob, 'Driver_Permits.docx');
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      onComplete(); // Stop loading after success or failure
    }
  }

  /**
   * This method will create driver card
   * @param driver API Session Driver Reprot
   * @param qrCodeBase64 QR code image
   * @param logo C&T Logo
   * @returns TableCell
   */
  private createDriverCard(
    driver: apiVSessionModel,
    qrCodeBase64: string,
    logo: any,
    dummy: any,
    cardTitle: string,
    cardColor: string,
    cardwording: string
  ) {
    const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = new Uint8Array(
      atob(base64Data)
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    const tableRows: TableRow[] = [];
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: 'png',
                    data: logo, // Your loaded image buffer
                    transformation: { width: 70, height: 50 },
                  }),
                ],
                alignment: AlignmentType.CENTER,
                pageBreakBefore: true,
              }),
            ],
            rowSpan: 2, // Merge first column across two rows
            verticalAlign: VerticalAlign.CENTER, // Center content vertically
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${cardTitle}`,
                    bold: true,
                    size: 32,
                  }),
                ],
                spacing: { before: 200 },
                // indent: { left: 500 },
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },
            columnSpan: 1,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: 'png',
                    data: imageBuffer,
                    transformation: { width: 70, height: 70 },
                    altText: {
                      title: 'QR Code',
                      description: 'Generated QR Code',
                      name: 'QRCode',
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            rowSpan: 2, // Merge first column across two rows
            verticalAlign: VerticalAlign.CENTER, // Center content vertically
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${driver.permitnumber ?? ''} `,
                    bold: true,
                  }),
                  new TextRun({
                    text: `Valid Thru: ${
                      this.utils.formatDatetoddMMMYYYY(driver.permitexpiry) ??
                      ''
                    }`,
                    bold: true,
                    border: {
                      color: '#DE3163',
                      space: 1,
                      style: BorderStyle.THICK,
                      size: 12,
                    },
                  }),
                ],
                spacing: { before: 90 },
                // indent: { left: 500 },
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },
            columnSpan: 1,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: {
              type: ShadingType.SOLID,
              color: `${cardColor}`, // Green background
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${cardwording}`,
                    bold: true,
                    color: 'FFFFFF',
                  }),
                ],
                spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 3,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Name: `,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${driver.drivername} `,
                    bold: true,
                  }),
                ],
                // spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: 'jpg',
                    data: dummy, // Your loaded image buffer
                    transformation: { width: 100, height: 100 },
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 1,
            rowSpan: 6,
            width: { size: 1600, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
        //height: { value: 300, rule: HeightRule.EXACT },
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Company:`,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${this.utils.getGenericName(
                      this.contractors(),
                      driver.contractorid
                    )}`,
                    bold: true,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `DL #:`,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${driver.licensenumber}`,
                    bold: true,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `DL Type:`,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${this.utils.getGenericName(
                      this.dltypes(),
                      driver.licensetypeid
                    )}`,
                    bold: true,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `DL Expiry:`,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${this.utils.formatDatetoddMMMYYYY(
                      driver.licenseexpiry
                    )}`,
                    bold: true,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `C.N.I.C. #:`,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${driver.nic}`,
                    bold: true,
                  }),
                ],
                //spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 1,
          }),
        ],
      })
    );

    if (driver.bloodgroupid) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },

              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `BG:`,
                    }),
                  ],
                  // spacing: { before: 90, line: 300 },
                }),
              ],
              columnSpan: 1,
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },

              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${this.utils.getGenericName(
                        this.bloodgroups(),
                        driver.bloodgroupid
                      )}`,
                      bold: true,
                    }),
                  ],
                  // spacing: { before: 90, line: 300 },
                }),
              ],
              columnSpan: 1,
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: ``,
                    }),
                  ],
                }),
              ],
              columnSpan: 1,
            }),
          ],
        })
      );
    }

    if (driver.drivercode) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },

              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Code:`,
                    }),
                  ],
                  // spacing: { before: 90, line: 300 },
                }),
              ],
              columnSpan: 1,
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${driver.drivercode}`,
                      bold: true,
                    }),
                  ],
                  // spacing: { before: 90, line: 300 },
                }),
              ],
              columnSpan: 1,
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: {
                  style: BorderStyle.NONE,
                  size: 0,
                  color: 'FFFFFF',
                },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${driver.designation ?? ''}`,
                      size: 16,
                      color: 'FF0000',
                    }),
                  ],
                }),
              ],
              columnSpan: 1,
              width: { size: 1600, type: WidthType.DXA },
            }),
          ],
        })
      );
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: 'FFFFFF',
              },
            },

            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Above particulars provided by the contractor`,
                    size: 16,
                    color: 'FF0000',
                  }),
                ],
                // spacing: { before: 90, line: 300 },
              }),
            ],
            columnSpan: 3,
          }),
        ],
      })
    );

    return new TableCell({
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      children: [
        new Table({
          width: {
            size: 80,
            type: WidthType.PERCENTAGE, // Ensure table spans the full width
          },

          alignment: AlignmentType.CENTER,
          rows: tableRows,
        }),
      ],
    });
  }

  /**
   * This method will generate QR Code
   * @param text string
   * @returns QR code image
   */
  private async generateQRCode(text: string): Promise<string> {
    if (!text) {
      text = 'No Data'; // Fallback text
    }
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(text, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url); // Extract Base64 part
        }
      });
    });
  }

  /**
   * This method will download the exported file
   * @param blob docx
   * @param fileName string
   */
  private downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
