import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, forkJoin, map, Observable, tap, throwError } from 'rxjs';
import { apiDriverModel } from '../Models/Driver';
import { ContractorService } from './contractor.service';
import { DltypeService } from './dltype.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { apiContractorModel } from '../Models/Contractor';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private readonly apiURL = `${environment.apiUrl}driver/`;
  private drivers = signal<apiDriverModel[]>([]);
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);
  private cService = inject(ContractorService);
  private dlService = inject(DltypeService);

  /**
   * Get all drivers
   * @returns Observable
   */
  getAllDrivers(): Observable<apiDriverModel[]> {
    return this.http.get<apiDriverModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method will fetch all the driver and contractor name & dl type
   * @returns Observable
   */
  getDriversWithContractorNames(
    driverParam: Observable<apiDriverModel[]>
  ): Observable<any[]> {
    return forkJoin({
      drivers: driverParam,
      contractors: this.cService.getAll(),
      dlTypes: this.dlService.getAllDLTypes(),
    }).pipe(
      map(({ drivers, contractors, dlTypes }) => {
        const contractorMap = contractors.reduce((map, contractor: any) => {
          map[contractor.id] = contractor.name;
          return map;
        }, {} as Record<number, string>);
        const dltypeMap = dlTypes.reduce((map, dltype: any) => {
          map[dltype.id] = dltype.name;
          return map;
        }, {} as Record<number, string>);
        // Map drivers to include contractorName
        return drivers.map((driver) => ({
          ...driver,
          contractorName: contractorMap[driver.contractorid] || '',
          licensetypeName: dltypeMap[driver.licensetypeid] || '',
        }));
      })
    );
  }

  /**
   * This method will fetch driver & session count for dashboard
   * @returns Observable
   */
  getDriverCount(): Observable<any> {
    return this.http.get<any>(this.apiURL + 'dashboardcounts');
  }

  /**
   * This method only for get driver via valid nic
   * @param nic NIC string
   * @returns Observable
   */
  getDriverByNIC(nic: string) {
    return this.http.get<apiDriverModel>(this.apiURL + 'nic', {
      params: { nic },
    });
  }

  /**
   * This method for get user by its id
   * @param id number Userid
   * @returns Observable
   */
  getDriverByID(id: number) {
    return this.http.get<apiDriverModel>(this.apiURL + id);
  }

  /**
   * This mehtod for dactivete driver
   * @param id number
   * @returns Observable
   */
  deleteDriverByID(id: number) {
    return this.http
      .delete<apiDriverModel>(this.apiURL + id, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          // console.log(`Status: ${response.status}`); // Access status code
          return response.body; // Return response body
        }),
        catchError((error) => {
          // console.log('Full error response:', error); // Log the full error object

          // Extract the message from the error object.
          let errorMessage = 'An unknown error occurred'; // Fallback message

          // Check if the error has a response body with a message.
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              errorMessage = error.error.message; // Check if error message exists in the error object
            } else if (error.message) {
              errorMessage = error.message; // Use general error message if available
            }
          } else if (error.message) {
            errorMessage = error.message; // Use the top-level error message if no nested error object
          }

          return throwError(() => new Error(errorMessage)); // Pass the correct error message
        })
      );
  }

  /**
   * This method will fetch nic and will work as ajax
   * @param query string query
   * @returns Observable
   */
  GetSearch(query: string) {
    return this.http.get<apiDriverModel>(`${this.apiURL}search?nic=${query}`);
  }

  /**
   * This method will search driver
   * @param nic string
   * @param licenseNumber string
   * @param name string
   * @param contractorid number
   * @param permitexpiry date
   * @param permitnumber string
   * @returns Observable
   */
  searchDrivers(
    nic?: any,
    licenseNumber?: any,
    name?: any,
    contractorid?: any,
    permitexpiry?: any,
    permitnumber?: any
  ): Observable<apiDriverModel[]> {
    let params = new HttpParams();

    // Add parameters only if they are provided (not undefined or empty)
    if (nic) {
      params = params.set('nic', nic);
    }
    if (licenseNumber) {
      params = params.set('licensenumber', licenseNumber);
    }
    if (name) {
      params = params.set('name', name);
    }
    if (contractorid) {
      params = params.set('contractorid', contractorid);
    }
    if (permitexpiry) {
      params = params.set('permitexpiry', permitexpiry);
    }
    if (permitnumber) {
      params = params.set('permitnumber', permitnumber);
    }
    // console.log('what are my params: ' + params);
    // Make GET request with query parameters
    return this.http.get<apiDriverModel[]>(`${this.apiURL}/search`, { params });
  }

  /**
   * This method will search against query
   * @param query string
   * @returns Observable
   */
  GetAllDriverSearch(query: string) {
    return this.http.get<apiDriverModel>(`${this.apiURL}/search?${query}`);
  }

  /**
   * Update driver by id
   * @param id id
   * @param name name
   * @param gender gender
   * @param dob date of birth
   * @param nic nic
   * @param nicexpiry nic expiry
   * @param licensenumber license number
   * @param licensetypeid license type
   * @param licenseexpiry expiry
   * @param designation designation
   * @param department department
   * @param permitnumber permit number
   * @param permitissue permit issue date
   * @param permitexpiry permit expiry date
   * @param bloodgroupid blood group id
   * @param contractorid contractor id
   * @param visualid visual id
   * @param ddccount ddc count number
   * @param experience existing driver experience
   * @param code existing driver code
   * @param comment comment
   * @returns Observable
   */
  updatedriver(
    id: number,
    name: string,
    gender: string,
    dob: string,
    nic: string,
    nicexpiry: Date,
    licensenumber: string,
    licensetypeid: number,
    licenseexpiry: Date,
    licenseverified: number,
    designation: string,
    department: string,
    permitnumber: string,
    permitissue: Date,
    permitexpiry: Date,
    bloodgroupid: number,
    contractorid: number,
    visualid: number,
    ddccount: number,
    experience: number,
    code: string,
    comment: string
  ): Observable<apiDriverModel> {
    return this.http.put<apiDriverModel>(this.apiURL + id, {
      name,
      gender,
      dob,
      nic,
      nicexpiry,
      licensenumber,
      licensetypeid,
      licenseexpiry,
      licenseverified,
      designation,
      department,
      permitnumber,
      permitissue,
      permitexpiry,
      bloodgroupid,
      contractorid,
      visualid,
      ddccount,
      experience,
      code,
      comment,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * Create Driver
   * @param name name
   * @param gender driver gender
   * @param dob date of birth
   * @param nic nic
   * @param nicexpiry nic expiry
   * @param licensenumber license number
   * @param licensetypeid license type
   * @param licenseexpiry expiry
   * @param designation designation
   * @param department department
   * @param permitnumber permit number
   * @param permitissue permit issue date
   * @param permitexpiry permit expiry date
   * @param bloodgroupid blood group id
   * @param contractorid contractor
   * @param visualid visual
   * @param ddccount ddc count number
   * @param experience existing driver experience
   * @param code existing driver code
   * @param comment comment
   * @returns Observable
   */
  createDriver(
    name: string,
    gender: string,
    dob: string,
    nic: string,
    nicexpiry: Date,
    licensenumber: string,
    licensetypeid: number,
    licenseexpiry: Date,
    licenseverified: number,
    designation: string,
    department: string,
    permitnumber: string,
    permitissue: Date,
    bloodgroupid: number,
    contractorid: number,
    visualid: number,
    ddccount: number,
    experience: number,
    code: string,
    comment: string
  ): Observable<apiDriverModel> {
    return this.http
      .post<apiDriverModel>(
        this.apiURL + 'create',
        {
          name,
          gender,
          dob,
          nic,
          nicexpiry,
          licensenumber,
          licensetypeid,
          licenseexpiry,
          licenseverified,
          designation,
          department,
          permitnumber,
          permitissue,
          bloodgroupid,
          contractorid,
          visualid,
          ddccount,
          experience,
          code,
          comment,
          userid: this.authService.getUserID(),
        },
        { observe: 'response' }
      )
      .pipe(
        map((response: HttpResponse<any>) => {
          // console.log(`Status: ${response.status}`); // Access status code
          return response.body; // Return response body
        }),
        catchError((error) => {
          // console.log('Full error response:', error); // Log the full error object

          // Extract the message from the error object.
          let errorMessage = 'An unknown error occurred'; // Fallback message

          // Check if the error has a response body with a message.
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              errorMessage = error.error.message; // Check if error message exists in the error object
            } else if (error.message) {
              errorMessage = error.message; // Use general error message if available
            }
          } else if (error.message) {
            errorMessage = error.message; // Use the top-level error message if no nested error object
          }

          return throwError(() => new Error(errorMessage)); // Pass the correct error message
        })
      );
  }
}
