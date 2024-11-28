import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);
import { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { apiDriverModel } from '../Models/Driver';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor() {
    // pdfMake.fonts = {
    //   Roboto: {
    //     normal:
    //       'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    //     bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    //     italics:
    //       'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    //     bolditalics:
    //       'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
    //   },
    // };
  }
  generatePdfReport(data: any) {
    const documentDefinition: TDocumentDefinitions = {
      watermark: {
        text: 'Consult & Train',
        color: 'blue',
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      content: [
        { text: 'Consult & Train', style: 'header' },
        {
          text: `Date: ${new Date().toDateString()}`,
          style: 'subheader',
        },
        { text: 'Report Content', style: 'sectionHeader' },
        {
          table: {
            body: [
              ['Column 1', 'Column 2', 'Column 3'],
              ...data.map((item: any) => [
                item.field1,
                item.field2,
                item.field3,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, margin: [0, 10, 0, 5] },
        sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
      },
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  async generatePdfReportSession(sessions: any[]) {
    const logoUrl = await this.getBase64ImageFromURL('/img/logo.png');
    const documentContent: Content[] = sessions
      .map((session, index) => {
        // debugger;
        // Content for each session
        const sessionContent: Content[] = [
          {
            image: logoUrl,
            width: 100, // Adjust width as needed
            alignment: 'left',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'Consult & Train',
            style: 'title',
            alignment: 'center',
          },
          {
            text: 'certifies that',
            style: 'subheader',
            alignment: 'center',
          },
          {
            text: `${session.drivername}`,
            style: 'name',
            alignment: 'center',
          },
          {
            text: `CNIC # ${session.nic}\nDriver’s Code: ${session.nic}`,
            style: 'details',
            alignment: 'center',
          },
          {
            text: 'of',
            style: 'subheader',
            alignment: 'center',
          },
          {
            text: `${session.contractorid}`,
            style: 'company',
            alignment: 'center',
          },
          {
            text: 'successfully completed',
            style: 'subheader',
            alignment: 'center',
          },
          {
            text: 'Heavy Vehicle Driver Training & Skill Assessment',
            style: 'course',
            alignment: 'center',
          },
          {
            text: 'conducted on',
            style: 'subheader',
            alignment: 'center',
          },
          {
            text: `${session.sessiondate}`,
            style: 'date',
            alignment: 'center',
          },
          {
            text: `at ${session.locationid}`,
            style: 'location',
            alignment: 'center',
          },
          {
            columns: [
              {
                text: 'Certificate Valid Till: ' + session.validTill,
                style: 'verticalText',
                alignment: 'left',
                margin: [0, 60, 0, 0],
              },
              {
                text: '', // Empty space
              },
              {
                stack: [
                  {
                    text: 'Registrar',
                    style: 'signature',
                    alignment: 'left',
                    margin: [0, 60, 0, 0],
                  },
                  {
                    text: 'Chief Executive Officer',
                    style: 'signature',
                    alignment: 'right',
                  },
                ],
              },
            ],
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
          fontSize: 14,
          margin: [0, 10, 0, 5],
        },
        name: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        details: {
          fontSize: 12,
          margin: [0, 0, 0, 20],
        },
        company: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        course: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        date: {
          fontSize: 14,
          margin: [0, 0, 0, 5],
        },
        location: {
          fontSize: 14,
          margin: [0, 0, 0, 10],
        },
        verticalText: {
          fontSize: 10,
          bold: true,
          color: 'gray',
          margin: [0, 10, 0, 0],
        },
        signature: {
          fontSize: 12,
          margin: [20, 10, 20, 0],
        },
      },
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  async generateDriverPdfReport(contractorName: string, drivers: any[]) {
    const logoUrl = await this.getBase64ImageFromURL('/img/logo.png');
    const currentDate = new Date().toDateString();
    // Define 10 drivers per page
    const driversPerPage = 6;
    const driverPages = [];

    for (let i = 0; i < drivers.length; i += driversPerPage) {
      driverPages.push(drivers.slice(i, i + driversPerPage));
    }

    // Build content for each page
    const documentContent: Content[] = driverPages.flatMap(
      (pageDrivers, pageIndex) => {
        // Header for the page
        const pageHeader: Content = {
          columns: [
            {
              // Image on the left
              image: logoUrl, // Ensure logoUrl contains the base64-encoded image or image path
              width: 100, // Adjust width as needed
              alignment: 'left',
              margin: [0, 0, 10, 0], // Add right margin to create space between image and text
            },
            {
              // Text on the right
              text: `ContractorName: ${contractorName}  `,
              style: 'header',
              alignment: 'center',
              margin: [0, 0, 0, 10],
            },
          ],

          margin: [0, 0, 0, 10],
        };
        const pageFooter: Content = {
          columns: [
            {
              // Page number on the right
              text: `${currentDate} - Page ${pageIndex + 1}`,
              alignment: 'right',
              fontSize: 8, // Smaller font size for the footer
              margin: [0, 0, 20, 0], // Add some right margin
            },
          ],
          margin: [0, 10, 0, 0], // Margin for the footer
        };

        // Table of driver "boxes" (each driver in a cell with border)
        const driverBoxes = pageDrivers.map(
          (driver: apiDriverModel): TableCell => ({
            stack: [
              { text: `Name: ${driver.name}`, style: 'info' },
              { text: `DOB: ${driver.dob}`, style: 'info' },
              { text: `NIC: ${driver.nic}`, style: 'info' },
              { text: `License: ${driver.licensenumber}`, style: 'info' },
              {
                text: `License Expiry: ${driver.licenseexpiry}`,
                style: 'info',
              },
              { text: `Permit: ${driver.permitnumber}`, style: 'info' },
              { text: `Permit Issue: ${driver.permitissue}`, style: 'info' },
              { text: `Permit Expiry: ${driver.permitexpiry}`, style: 'info' },
              { text: `Designation: ${driver.designation}`, style: 'info' },
              { text: `Department: ${driver.department}`, style: 'info' },
              {
                qr: `Name: ${driver.name} Nic: ${driver.nic} License: ${driver.licensenumber} Permit: ${driver.permitnumber} PermitExpiry: ${driver.permitexpiry}`,
                fit: 80, // Size of the QR code (adjust as needed)
                alignment: 'left', // Adjust alignment if needed
                margin: [0, 10, 0, 0], // Add some margin above the QR code
              },
            ],
            margin: [5, 5, 5, 5], // Add spacing inside each box
            border: [true, true, true, true], // Border around each driver box
          })
        );
        // Ensure each row has exactly 2 cells by adding an empty cell if necessary
        const driverGridBody = this.chunkArray(driverBoxes, 2).map((row) => {
          if (row.length < 2) {
            row.push({ text: '', border: [false, false, false, false] }); // Placeholder cell
          }
          return row;
        });

        // Create a grid layout with driver boxes (2 columns per row)
        const driverGrid: Content = {
          table: {
            widths: ['*', '*'], // Two boxes per row
            body: driverGridBody, // Organize drivers in rows of 2
          },
          layout: {
            paddingLeft: () => 10,
            paddingRight: () => 10,
            paddingTop: () => 10,
            paddingBottom: () => 10,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },

          margin: [0, 10, 0, 10], // Space between header and table
        };

        // Return page content with header, driver grid, and page break
        return [
          pageHeader,
          driverGrid,
          pageFooter,
          { text: '', pageBreak: 'after' },
        ];
      }
    );

    // Remove the last page break
    if (documentContent.length > 0) {
      const lastElement = documentContent[documentContent.length - 1];
      if (typeof lastElement === 'object' && 'pageBreak' in lastElement) {
        delete lastElement.pageBreak;
      }
    }

    // Define PDF styles
    const documentDefinition: TDocumentDefinitions = {
      content: documentContent,
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center' },
        info: { fontSize: 12, margin: [0, 2, 0, 2] },
      },
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

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
