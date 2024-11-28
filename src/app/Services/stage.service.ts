import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { apiGenericModel } from '../Models/Generic';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StageService {
  private readonly apiURL = `${environment.apiUrl}stage/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * Get all Stages
   * @returns Observable
   */
  getAllStages(): Observable<apiGenericModel[]> {
    return this.http.get<apiGenericModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method for update Stage
   * @param id Stage ID
   * @param name Stage name
   * @param description Stage description
   * @returns Observable
   */
  updateStage(
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
   * This method use for create Stage
   * @param name Stage name
   * @param description Stage description
   * @returns Observable
   */
  createStage(name: string, description: string): Observable<apiGenericModel> {
    return this.http.post<apiGenericModel>(this.apiURL + 'create', {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }
}
