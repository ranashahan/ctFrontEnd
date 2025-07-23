import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import { apiGenericModel } from '../Models/Generic';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../Models/Toast';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UtilitiesService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts$.asObservable();

  constructor(private titleService: Title, private datePipe: DatePipe) {}

  /**
   * This method will show toast message on page
   * @param message
   * @param type
   */
  showToast(message: string, type: 'success' | 'warning' | 'error' | 'info') {
    const currentToasts = this._toasts$.value;
    this._toasts$.next([...currentToasts, { message, type }]);
    setTimeout(() => this.removeToast(), 8000);
  }

  /**
   * This method will remove toast message from page.
   */
  removeToast() {
    const currentToasts = this._toasts$.value;
    if (currentToasts.length) {
      this._toasts$.next(currentToasts.slice(1));
    }
  }

  /**
   * This method will use to export into excel
   * @param tableId Table id
   * @param name table name
   */
  public exportToExcel(tableId: string, name?: string) {
    let timeSpan = new Date().toISOString();
    let prefix = name || 'ExportResult';
    let fileName = `${prefix}-${timeSpan}`;
    let targetTableElm = document.getElementById(tableId);

    if (targetTableElm) {
      // Clone the table to avoid modifying the original table in the DOM
      let clonedTable = targetTableElm.cloneNode(true) as HTMLElement;

      // Remove the "action" column (assuming it's the last column)
      this.removeColumn(clonedTable, 'Action'); // Call a helper function to remove the action column

      let wb = XLSX.utils.table_to_book(clonedTable, <XLSX.Table2SheetOpts>{
        sheet: prefix,
      });
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }
  }

  /**
   * Private method only for export utility
   * @param table
   * @param headerName
   * @returns clone workbook
   */
  private removeColumn(table: HTMLElement, headerName: string): void {
    const headerCells = table.querySelectorAll('th');
    let columnIndex = -1;

    // Find the index of the column with the specified header name
    headerCells.forEach((th, index) => {
      if (th.textContent?.trim() === headerName) {
        columnIndex = index;
      }
    });

    if (columnIndex === -1) return; // If the column doesn't exist, exit

    // Remove the header cell
    headerCells[columnIndex]?.parentElement?.removeChild(
      headerCells[columnIndex]
    );

    // Remove the corresponding cells in each row
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells[columnIndex]) {
        cells[columnIndex].parentElement?.removeChild(cells[columnIndex]);
      }
    });
  }

  /**
   * This method will use to set page name
   * @param newTitle page time name
   */
  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  /**
   * This method will use for generics item finds
   * @param items your required id
   * @param itemId your list of objects
   * @returns {string} name
   */
  public getGenericName(items: apiGenericModel[], itemId: number): string {
    const selectedGroup = items.find((group) => group.id === Number(itemId));
    return selectedGroup ? selectedGroup.name : '';
  }
  /**
   * This method will use for generics item finds
   * @param items your required id
   * @param itemId your list of objects
   * @returns {string} description
   */
  public getGenericDescription(
    items: apiGenericModel[],
    itemId: number
  ): string {
    const selectedGroup = items.find((group) => group.id === Number(itemId));
    return selectedGroup ? selectedGroup.description : '';
  }

  /**
   * This method will update the date format
   * @param dateString {string} date
   * @returns {Date} formatted date
   */
  public formatDate(dateString: Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    // Options for date formatting
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', // Full day name (e.g., Friday)
      day: '2-digit', // Day with leading zero if needed (e.g., 20)
      month: 'long', // Full month name (e.g., December)
      year: 'numeric', // Full year (e.g., 2024)
    };

    return date.toLocaleDateString(undefined, options);
  }

  public formatStringDate(dateStr: string): string {
    if (!dateStr) return '';

    // Try parsing with different known formats
    const parsedDate = new Date(dateStr);

    // Check if parsedDate is valid
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', dateStr);
      return ''; // Return empty or handle invalid dates
    }

    // Convert to YYYY-MM-DD format
    return this.toYYYYMMDD(parsedDate);
  }

  /**
   * This is the generic method for date conversion
   * @param date {string} date wanted to be coverted
   * @returns
   */
  public convertToMySQLDate(date: string): string {
    if (!date) return '';
    // Convert MM/DD/YYYY format to YYYY-MM-DD
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return this.toYYYYMMDD(parsedDate);
    }

    // If normal parsing fails, try splitting manually (for DD/MM/YYYY or MM/DD/YYYY)
    const parts = date.split(/[/\-.]/); // Supports MM/DD/YYYY, DD-MM-YYYY, DD.MM.YYYY
    if (parts.length === 3) {
      let [d, m, y] = parts.map(Number); // Convert to numbers
      if (y < 1000) [y, m, d] = [d, m, y]; // If year is at the end, swap positions

      const manualDate = new Date(y, m - 1, d); // Months are 0-based in JS
      if (!isNaN(manualDate.getTime())) {
        return this.toYYYYMMDD(manualDate);
      }
    }

    return ''; // Return empty if all parsing fails
  }

  /**
   * This method will convert any date into db format
   * @param date date
   * @returns date
   */
  private toYYYYMMDD(date: Date): string {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }

  /**
   * This method will return formatted dd-MMM-YYYY date
   * @param date string or date
   * @returns date
   */
  public formatDatetoddMMMYYYY(date: string | Date): string {
    return this.datePipe.transform(date, 'dd-MMM-yyyy') || '';
  }

  /**
   * This method will return prior date
   * @param param set prior month by parameter
   * @returns Date
   */
  public monthAgo(param: number): Date {
    const today = new Date();
    const dateAgo = new Date(
      today.getFullYear(),
      today.getMonth() - param,
      today.getDate()
    );
    return dateAgo;
  }

  /**
   * This method will return ahead date
   * @param param set ahead date by parameter
   * @returns Date
   */
  public daysAhead(param: number): Date {
    const today = new Date();
    const dayAhead = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + param
    );
    return dayAhead;
  }

  /**
   * This method only for get roles
   * @returns array of string
   */
  public roles(): string[] {
    return [
      'admin',
      'biller',
      'guest',
      'member',
      'manager',
      'staff',
      'director',
    ];
  }

  /**
   * This method only for get genders
   * @returns array of string
   */
  public gender(): string[] {
    return ['Male', 'Female', 'Not Specified'];
  }

  /**
   * This method only for get category
   * @returns array of string
   */
  public statuses(): string[] {
    return ['Tentative', 'Planned', 'Conducted', 'Billed', 'Completed'];
  }

  /**
   * This method only for get category
   * @returns array of string
   */
  public sources(): string[] {
    return ['External', 'Internal'];
  }

  /**
   * This method for static verification
   * @returns Verification
   */
  public verificationStatus() {
    return [
      { id: 1, name: 'Not Verified' },
      { id: 2, name: 'Verified' },
    ];
  }

  /**
   * This method for static months
   * @returns months
   */
  public months() {
    return [
      { id: 1, name: 'January' },
      { id: 2, name: 'February' },
      { id: 3, name: 'March' },
      { id: 4, name: 'April' },
      { id: 5, name: 'May' },
      { id: 6, name: 'June' },
      { id: 7, name: 'July' },
      { id: 8, name: 'August' },
      { id: 9, name: 'September' },
      { id: 10, name: 'October' },
      { id: 11, name: 'November' },
      { id: 12, name: 'December' },
    ];
  }

  /**
   * This method only for get Years
   * @returns array of number
   */
  public years(): number[] {
    return [2025, 2026, 2027, 2028, 2029, 2030];
  }

  /**
   * This method only for get risk
   * @returns array of string
   */
  public risk(): string[] {
    return ['Average', 'High', 'Low', 'Medium', 'Safe Driver'];
  }

  /**
   * This method will use for license Verification
   * @param item {number} licensenumber
   * @returns {string} status
   */
  public convertLicenseNumber(item: number): string {
    if (item === 1) {
      return 'Not Verified';
    } else if (item === 2) {
      return 'Verified';
    } else {
      return 'Not-Configured';
    }
  }

  /**
   * This method is only for format the validator
   * @param control
   * @returns nic format
   */
  formatValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null; // No validation needed if the field is empty
    }

    const formatRegex = /^\d{5}-\d{7}-\d{1}$/;
    return formatRegex.test(value) ? null : { invalidFormat: true };
  }

  /**
   * This method will load the c&t logo image
   * @returns logo image
   */
  public async loadImage(path: string): Promise<ArrayBuffer> {
    return fetch(path).then((response) => response.arrayBuffer());
  }
}
