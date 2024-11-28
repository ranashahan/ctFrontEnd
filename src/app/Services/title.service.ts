import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiGenericModel } from '../Models/Generic';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private readonly apiURL = `${environment.apiUrl}title/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * Get all Titles
   * @returns Observable
   */
  getAllTitles(): Observable<apiGenericModel[]> {
    return this.http.get<apiGenericModel[]>(this.apiURL + 'getAll');
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
