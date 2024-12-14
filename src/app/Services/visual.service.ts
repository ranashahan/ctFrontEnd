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
export class VisualService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}visual/`;
  /**
   * Visual API call
   */
  private visualResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed visuals
   */
  public visuals = computed(
    () => this.visualResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh visual API call
   */
  public refreshVisuals() {
    this.visualResponse.reload();
  }

  /**
   * This method for update Visual
   * @param id Visual ID
   * @param name Visual name
   * @param description Visual description
   * @returns Observable
   */
  updateVisual(
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
   * This method use for create Visual
   * @param name Visual name
   * @param description Visual description
   * @returns Observable
   */
  createVisual(name: string, description: string): Observable<apiGenericModel> {
    return this.http.post<apiGenericModel>(this.apiURL + 'create', {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }
}
