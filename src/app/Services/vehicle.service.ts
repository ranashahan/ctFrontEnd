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
export class VehicleService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}vehicle/`;
  /**
   * Vehicle API call
   */
  private vehicleResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed vehicles
   */
  public vehicles = computed(
    () => this.vehicleResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh vehicle API call
   */
  public refreshVehicles() {
    this.vehicleResponse.reload();
  }

  /**
   * This method for update Vehicle
   * @param id Vehicle ID
   * @param name Vehicle name
   * @param description Vehicle description
   * @returns Observable
   */
  updateVehicle(
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
   * This method use for create Vehicle
   * @param name Vehicle name
   * @param description Vehicle description
   * @returns Observable
   */
  createVehicle(
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
