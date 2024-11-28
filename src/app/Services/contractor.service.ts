import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiContractorModel } from '../Models/Contractor';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContractorService {
  private readonly apiURL = `${environment.apiUrl}contractor/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * Get all contractors
   * @returns Observable
   */
  getAllContractors(): Observable<apiContractorModel[]> {
    return this.http.get<apiContractorModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method for get assigned client
   * @param id number client id
   * @returns Observable
   */
  getAssignedClients(id: number): Observable<any> {
    return this.http.get(environment.apiUrl + 'cc/' + id);
  }

  /**
   * Update contractor by id
   * @param id id
   * @param name name
   * @param contact contact
   * @param address address
   * @returns Observable
   */
  updateContractor(
    id: number,
    name: string,
    ntnnumber: string,
    contactname: string,
    contactnumber: string,
    contactdesignation: string,
    contactdepartment: string,
    address: string,
    initials: string,
    clientid: number
  ): Observable<apiContractorModel> {
    return this.http.put<apiContractorModel>(this.apiURL + id, {
      name,
      ntnnumber,
      contactname,
      contactnumber,
      contactdesignation,
      contactdepartment,
      address,
      initials,
      clientid,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * Create contractor
   * @param {object} obj which contain all contractor fields
   * @returns Observable
   */
  createContractor(obj: apiContractorModel): Observable<apiContractorModel> {
    return this.http.post<apiContractorModel>(this.apiURL + 'create', {
      obj,
      userid: this.authService.getUserID(),
    });
  }
}
