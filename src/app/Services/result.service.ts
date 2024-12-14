import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { apiGenericModel } from '../Models/Generic';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ResultService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}result/`;
  /**
   * Result API call
   */
  private resultResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed locations
   */
  public results = computed(
    () => this.resultResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh Location API call
   */
  public refreshResults() {
    this.resultResponse.reload();
  }

  /**
   * This method for update Result
   * @param id Result ID
   * @param name Result name
   * @param description Result description
   * @returns Observable
   */
  updateResult(
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
   * This method use for create Result
   * @param name Result name
   * @param description Result description
   * @returns Observable
   */
  createResult(name: string, description: string): Observable<apiGenericModel> {
    return this.http.post<apiGenericModel>(this.apiURL + 'create', {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }
}
