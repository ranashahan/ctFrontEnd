import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { apiGenericModel } from '../Models/Generic';

@Injectable({
  providedIn: 'root',
})
export class DltypeService {
  private readonly apiURL = `${environment.apiUrl}dltype/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * Get all Driver license types
   * @returns Observable
   */
  getAllDLTypes(): Observable<apiGenericModel[]> {
    return this.http.get<apiGenericModel[]>(this.apiURL + 'getAll');
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
