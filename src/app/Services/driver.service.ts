import { computed, inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiDriverModel } from '../Models/Driver';
import { ContractorService } from './contractor.service';
import { DltypeService } from './dltype.service';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private readonly apiURL = `${environment.apiUrl}driver/`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cService = inject(ContractorService);
  private dlService = inject(DltypeService);
  /**
   * Contractor signal
   */
  private contractors = this.cService.contractors;
  /**
   * Driver License Types signal
   */
  private dltypes = this.dlService.dltypes;

  /**
   * Get all drivers
   * @returns Observable
   */
  getAllDrivers(): Observable<apiDriverModel[]> {
    return this.http.get<apiDriverModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method will fetch all the drivers and contractor name & client name
   * @param driverParam driver signal
   * @returns drivers signal
   */
  getDriversWithNames(driverParam: Signal<apiDriverModel[]>) {
    return computed(() => {
      const drivers = driverParam();
      const contractorsValue = this.contractors();
      const dlTypesValue = this.dltypes();

      const contractorMap = contractorsValue.reduce((map, contractor: any) => {
        map[contractor.id] = contractor.name;
        return map;
      }, {} as Record<number, string>);

      const dlTypesMap = dlTypesValue.reduce((map, dlType: any) => {
        map[dlType.id] = dlType.name;
        return map;
      }, {} as Record<number, string>);

      return drivers.map((driver) => ({
        ...driver,
        contractorName: contractorMap[driver.contractorid] || '',
        licensetypeName: dlTypesMap[driver.licensetypeid] || '',
      }));
    });
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
   * This method will fetch driver sessions
   * @param id {number} driver id
   * @returns Observable
   */
  getDriverSessionByID(id: number) {
    let params = new HttpParams();
    if (id) {
      params = params.set('id', id);
    }
    return this.http.get(this.apiURL + 'sessiondriver/', { params });
  }

  /**
   * This mehtod for dactivete driver
   * @param id number
   * @returns Observable
   */
  deleteDriverByID(id: number) {
    return this.http.delete<apiDriverModel>(this.apiURL + id);
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
    nic?: string,
    licenseNumber?: string,
    name?: string,
    contractorid?: number,
    permitnumber?: string,
    startDate?: string,
    endDate?: string
  ): Observable<apiDriverModel[]> {
    let params = new HttpParams();
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
    if (permitnumber) {
      params = params.set('permitnumber', permitnumber);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<apiDriverModel[]>(`${this.apiURL}search`, { params });
  }

  expiryReport(param: string) {
    let params = new HttpParams();
    params = params.set('param', param);

    return this.http.get(`${this.apiURL}expiry`, { params });
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
   * @param mobile mobile
   * @param licenseverified verification
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
   * @param medicalexpiry medical expiry date
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
    mobile: string,
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
    medicalexpiry: Date,
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
      mobile,
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
      medicalexpiry,
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
   * @param mobile mobile
   * @param nic nic
   * @param nicexpiry nic expiry
   * @param licensenumber license number
   * @param licensetypeid license type
   * @param licenseexpiry expiry
   * @param permitnumber permit number
   * @param permitissue permit issue
   * @param permitexpiry permit expiry
   * @param designation designation
   * @param department department
   * @param licenseverified licenseVerified
   * @param medicalexpiry medical expiry date
   * @param bloodgroupid blood group id
   * @param contractorid contractor id
   * @param visualid visual id
   * @param ddccount ddc count
   * @param experience experience
   * @param code code
   * @param comment comment
   * @returns Observable
   */
  createDriver(
    name: string,
    gender: string,
    dob: string,
    mobile: string,
    nic: string,
    nicexpiry: Date,
    licensenumber: string,
    licensetypeid: number,
    licenseexpiry: Date,
    permitnumber: string,
    permitissue: Date,
    permitexpiry: Date,
    licenseverified: number,
    designation: string,
    department: string,
    medicalexpiry: Date,
    bloodgroupid: number,
    contractorid: number,
    visualid: number,
    ddccount: number,
    experience: number,
    code: string,
    comment: string
  ): Observable<apiDriverModel> {
    return this.http.post<apiDriverModel>(this.apiURL + 'create', {
      name,
      gender,
      dob,
      mobile,
      nic,
      nicexpiry,
      licensenumber,
      licensetypeid,
      licenseexpiry,
      permitnumber,
      permitissue,
      permitexpiry,
      licenseverified,
      designation,
      department,
      medicalexpiry,
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
   * This method will fetch count driver
   */
  countDriver = httpResource<number>(() => {
    return `${this.apiURL}getCount`;
  });

  /**
   * This method will generate key for auto increasement
   * @returns string generetedKey
   */
  async generateKey(): Promise<string> {
    await this.countDriver.reload(); // Ensures the latest value is fetched
    await new Promise((resolve) => setTimeout(resolve, 100)); // S
    const count = this.countDriver.value(); // Get the latest value
    if (count === undefined) throw new Error('Count not loaded'); // Handle potential undefined values
    const key = `CNTD-${this.countDriver.value()}`;
    return key; // Return k
  }
}
