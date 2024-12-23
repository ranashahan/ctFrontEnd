import { computed, inject, Injectable } from '@angular/core';
import { apiGenericModel } from '../Models/Generic';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}course/`;

  /**
   * Course API call
   */
  private courseResponse = rxResource({
    loader: () => this.http.get<apiGenericModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed courses
   */
  public courses = computed(
    () => this.courseResponse.value() ?? ([] as apiGenericModel[])
  );

  /**
   * Refresh Course API call
   */
  public refreshCourses() {
    this.courseResponse.reload();
  }

  /**
   * This method for update the courses
   * @param id number course id
   * @param name string course name
   * @param description string course description
   * @returns Observable
   */
  updateCourse(
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
   * This method for create new course
   * @param name string course name
   * @param description string course description
   * @returns Observable
   */
  createCourse(name: string, description: string): Observable<apiGenericModel> {
    return this.http.post<apiGenericModel>(this.apiURL + 'create', {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }
}
