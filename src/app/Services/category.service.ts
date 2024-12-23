import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { rxResource } from '@angular/core/rxjs-interop';
import { apiGenericModel } from '../Models/Generic';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}category/`;

  /**
   * Category API call
   */
  private categoryResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed categories
   */
  public categories = computed(
    () => this.categoryResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh Category API call
   */
  public refreshCategories() {
    this.categoryResponse.reload();
  }

  /**
   * This method for update the courses
   * @param id number course id
   * @param name string course name
   * @param description string course description
   * @returns Observable
   */
  updateCategory(
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
   * This method for create new category
   * @param name string category name
   * @param description string category description
   * @returns Observable
   */
  createCategory(
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
