import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiGenericModel } from '../Models/Generic';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class IndustriesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}sponsor/industries/`;
  /**
   * Industries API call
   */
  private IndustriesResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed Industriess
   */
  public Industriess = computed(
    () => this.IndustriesResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh Industries API call
   */
  public refreshIndustriess() {
    this.IndustriesResponse.reload();
  }

  /**
   * This method for update Industries
   * @param id Industries ID
   * @param name Industries name
   * @param description Industries description
   * @returns Observable
   */
  updateIndustries(
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
   * This method use for create Industries
   * @param name Industries name
   * @param description Industries description
   * @returns Observable
   */
  createIndustries(
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
