import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiGenericModel } from '../Models/Generic';

@Injectable({
  providedIn: 'root',
})
export class VisualService {
  private readonly apiURL = `${environment.apiUrl}visual/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * Get all Visuals
   * @returns Observable
   */
  getAllVisuals(): Observable<apiGenericModel[]> {
    return this.http.get<apiGenericModel[]>(this.apiURL + 'getAll');
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
