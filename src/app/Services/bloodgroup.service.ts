import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { apiGenericModel } from '../Models/Generic';

@Injectable({
  providedIn: 'root',
})
export class BloodgroupService {
  private readonly apiURL = `${environment.apiUrl}bloodgroup/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * This method for fetch all the blood groups
   * @returns Observable
   */
  getAllBloodgroups(): Observable<apiGenericModel[]> {
    return this.http.get<apiGenericModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method for update the blood groups
   * @param id number bloodgroup id
   * @param name string bloodgroup name
   * @param description string bloodgroup description
   * @returns Observable
   */
  updateBloodGroup(
    id: number,
    name: string,
    description: string
  ): Observable<apiGenericModel> {
    return this.http.put<apiGenericModel>(this.apiURL + id, {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method for create new blood group
   * @param name string bloodgroup name
   * @param description string bloodgroup description
   * @returns Observable
   */
  createBloodGroup(
    name: string,
    description: string
  ): Observable<apiGenericModel> {
    return this.http.post<apiGenericModel>(this.apiURL + 'create', {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }
}
