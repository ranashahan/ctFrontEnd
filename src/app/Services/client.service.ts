import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiClientModel } from '../Models/Client';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly apiURL = `${environment.apiUrl}client/`;
  private readonly apiURLCC = `${environment.apiUrl}cc/`;

  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * This method for fetch all the clients
   * @returns Observable
   */
  getAll(): Observable<apiClientModel[]> {
    return this.http.get<apiClientModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method for fetch client by contractor id
   * @param id number client id
   * @returns Observable
   */
  getByContractorID(id: number): Observable<any> {
    const url = `${this.apiURLCC}contractorid/${id}`;
    return this.http.get(url);
  }

  /**
   * This method for create client
   * @param name string client name
   * @param contactperson string client contact person
   * @param contactnumber string client contact number
   * @param address string client address
   * @param website string client website
   * @param agentname string client agent name
   * @param agentnumber string client agent number
   * @returns Observable
   */
  createClient(
    name: string,
    contactperson: string,
    contactnumber: string,
    address: string,
    website: string,
    agentname: string,
    agentnumber: string
  ): Observable<apiClientModel> {
    return this.http.post<apiClientModel>(this.apiURL + 'create', {
      name,
      contactperson,
      contactnumber,
      address,
      website,
      agentname,
      agentnumber,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method for update client
   * @param name string client name
   * @param contactperson string client contact person
   * @param contactnumber string client contact number
   * @param address string client address
   * @param website string client website
   * @param agentname string client agent name
   * @param agentnumber string client agent number
   * @param id number client id
   * @returns Observable
   */
  updateClient(
    name: string,
    contactperson: string,
    contactnumber: string,
    address: string,
    website: string,
    agentname: string,
    agentnumber: string,
    id: number
  ): Observable<apiClientModel> {
    return this.http.put<apiClientModel>(this.apiURL + id, {
      name,
      contactperson,
      contactnumber,
      address,
      website,
      agentname,
      agentnumber,
      userid: this.authService.getUserID(),
    });
  }
}
