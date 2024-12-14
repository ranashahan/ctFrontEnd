import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { apiGenericModel } from '../Models/Generic';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class BloodgroupService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}bloodgroup/`;

  /**
   * BloodGroup API call
   */
  private bgResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed bloodgroups
   */
  public bloodGroups = computed(
    () => this.bgResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh BlooGroup API call
   */
  public refreshBloodGroups() {
    this.bgResponse.reload();
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
