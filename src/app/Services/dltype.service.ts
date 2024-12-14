import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { apiGenericModel } from '../Models/Generic';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class DltypeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}dltype/`;
  /**
   * DLtype API call
   */
  private dltypeResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed dltypes
   */
  public dltypes = computed(
    () => this.dltypeResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh DLtype API call
   */
  public refreshDltypes() {
    this.dltypeResponse.reload();
  }

  /**
   * This method for update driver license types
   * @param id Driver license type ID
   * @param name Driver license type
   * @param description Driver license type description
   * @returns Observable
   */
  updateDLTypes(
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
   * This method use for create Driver license type
   * @param name Driver license type
   * @param description Driver license type description
   * @returns Observable
   */
  createDLTypes(
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
