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
export class TitleService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}title/`;
  /**
   * Title API call
   */
  private titleResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed titles
   */
  public titles = computed(
    () => this.titleResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh title API call
   */
  public refreshTitles() {
    this.titleResponse.reload();
  }

  /**
   * This method for update Title
   * @param id Title ID
   * @param name Title name
   * @param description Title description
   * @returns Observable
   */
  updateTitle(
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
   * This method use for create Title
   * @param name Title name
   * @param description Title description
   * @returns Observable
   */
  createTitle(name: string, description: string): Observable<apiGenericModel> {
    return this.http.post<apiGenericModel>(this.apiURL + 'create', {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }
}
