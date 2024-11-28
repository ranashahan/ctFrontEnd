import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiGenericModel } from '../Models/Generic';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly apiURL = `${environment.apiUrl}location/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * Get all Locations
   * @returns Observable
   */
  getAllLocations(): Observable<apiGenericModel[]> {
    return this.http.get<apiGenericModel[]>(this.apiURL + 'getAll');
  }
  /**
   * Get all Locations count
   * @returns Observable
   */
  getLocationsCount(): Observable<any> {
    return this.http.get<any>(this.apiURL + 'getLocationCount');
  }

  /**
   * This method for update location
   * @param id Location ID
   * @param name Location name
   * @param description Location description
   * @returns Observable
   */
  updateLocation(
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
   * This method use for create location
   * @param name Location name
   * @param name Location description
   * @returns Observable
   */
  createLocation(
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
