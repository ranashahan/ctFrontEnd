import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { apiGenericModel } from '../Models/Generic';
import { Observable } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class StageService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}stage/`;
  /**
   * Stage API call
   */
  private stageResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed stages
   */
  public stages = computed(
    () => this.stageResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh stage API call
   */
  public refreshStages() {
    this.stageResponse.reload();
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
