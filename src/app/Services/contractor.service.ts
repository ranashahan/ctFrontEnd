import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiContractorModel } from '../Models/Contractor';
import { environment } from '../../environments/environment';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ContractorService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}sponsor/contractor/`;
  /**
   * Contractor API call
   */
  private contractorResponse = rxResource({
    loader: () => this.http.get<apiContractorModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed contractors
   */
  public contractors = computed(
    () => this.contractorResponse.value() ?? ([] as apiContractorModel[])
  );

  /**
   * Refresh Contractor API call
   */
  public refreshContractors() {
    this.contractorResponse.reload();
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
    clientid: number,
    industriesid: number
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
      industriesid,
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
