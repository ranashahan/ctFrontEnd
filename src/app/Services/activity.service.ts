import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { apiActivityModel } from '../Models/Activity';
import {
  apiMasterCategoryModel,
  apiSlaveCategoryModel,
} from '../Models/Category';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private readonly apiURL = `${environment.apiUrl}activity/`;
  private readonly apiMasterURL = `${environment.apiUrl}activity/master/`;
  private readonly apiSlaveURL = `${environment.apiUrl}activity/slave/`;

  private selectedCategoryId: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  selectedCategoryId$: Observable<number> =
    this.selectedCategoryId.asObservable();

  constructor(private http: HttpClient) {}
  authService = inject(AuthService);

  /**
   * Get all activities
   * @returns response
   */
  getAllActivities(): Observable<apiActivityModel[]> {
    return this.http.get<apiActivityModel[]>(this.apiURL + 'getAll');
  }

  /**
   * Get all activities
   * @returns response
   */
  getAllSlaveCategories(): Observable<apiActivityModel[]> {
    return this.http.get<apiActivityModel[]>(this.apiURL + 'slave/getAll');
  }

  /**
   * This method will fetch all the activity which contain scondary id
   * @param id scondary category id
   * @returns response
   */
  getActivityBySlaveID(id: number) {
    return this.http.get<apiActivityModel>(this.apiURL + 'getbyslave/' + id);
  }

  /**
   * This method for update activity
   * @param id Activity ID
   * @param name name
   * @param description description
   * @param initials initials
   * @param orderid orderid
   * @param slavecategoryid scondarycategory ID
   * @returns
   */
  updateActivity(
    id: number,
    name: string,
    description: string,
    initials: string,
    orderid: number,
    slavecategoryid: number
  ): Observable<apiActivityModel> {
    return this.http.put<apiActivityModel>(this.apiURL + id, {
      name,
      description,
      initials,
      orderid,
      slavecategoryid,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will diactivate activity
   * @param id number
   * @returns Observable
   */
  deleteActivity(id: number): Observable<apiActivityModel> {
    return this.http.post<apiActivityModel>(this.apiURL + id, {
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method use for create activity
   * @param name name
   * @param description description
   * @param initials initials
   * @param orderid orderid
   * @param slavecategoryid scondary category id
   * @returns
   */
  createActivity(
    name: string,
    description: string,
    initials: string,
    orderid: number,
    slavecategoryid: number
  ): Observable<apiActivityModel> {
    return this.http.post<apiActivityModel>(this.apiURL + 'create', {
      name,
      description,
      initials,
      orderid,
      slavecategoryid,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will fetch all the master categories
   * @returns Observable
   */
  getMasterCategoriesAll(): Observable<apiMasterCategoryModel[]> {
    return this.http.get<apiMasterCategoryModel[]>(
      this.apiMasterURL + 'getAll'
    );
  }

  /**
   * This method will update master category
   * @param id number master category id
   * @param name string name
   * @param description string description
   * @returns Observable
   */
  updateMasterCategory(
    id: number,
    name: string,
    description: string
  ): Observable<apiMasterCategoryModel> {
    return this.http.put<apiMasterCategoryModel>(this.apiMasterURL + id, {
      name,
      description,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will create master category
   * @param name string name
   * @param description string description
   * @returns Observable
   */
  createMasterCategory(
    name: string,
    description: string
  ): Observable<apiMasterCategoryModel> {
    return this.http.post<apiMasterCategoryModel>(
      this.apiMasterURL + 'create',
      {
        name,
        description,
        userid: this.authService.getUserID(),
      }
    );
  }

  /**
   * This method will deactivate slave category
   * @param id number slave category id
   * @returns Observable
   */
  deleteMasterCategory(id: number): Observable<apiMasterCategoryModel> {
    return this.http
      .post<apiMasterCategoryModel>(
        this.apiMasterURL + id,
        {
          userid: this.authService.getUserID(),
        },
        { observe: 'response' }
      )
      .pipe(
        map((response: HttpResponse<any>) => {
          // console.log(`Status: ${response.status}`); // Access status code
          return response.body; // Return response body
        }),
        catchError((error) => {
          // console.log('Full error response:', error); // Log the full error object

          // Extract the message from the error object.
          let errorMessage = 'An unknown error occurred'; // Fallback message

          // Check if the error has a response body with a message.
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              errorMessage = error.error.message; // Check if error message exists in the error object
            } else if (error.message) {
              errorMessage = error.message; // Use general error message if available
            }
          } else if (error.message) {
            errorMessage = error.message; // Use the top-level error message if no nested error object
          }

          return throwError(() => new Error(errorMessage)); // Pass the correct error message
        })
      );
  }

  /**
   * This method will fetch all the slave categories
   * @returns Observable
   */
  getSlaveCategoriesAll(): Observable<apiSlaveCategoryModel[]> {
    return this.http.get<apiSlaveCategoryModel[]>(this.apiSlaveURL + 'getAll');
  }

  /**
   * This method will update slave category
   * @param id number id
   * @param name string name
   * @param description string description
   * @param initials string initials
   * @param orderid number orderid
   * @param mastercategoryid number master category id
   * @returns Observable
   */
  updateSlaveCategory(
    id: number,
    name: string,
    description: string,
    initials: string,
    orderid: number,
    mastercategoryid: number
  ): Observable<apiSlaveCategoryModel> {
    return this.http.put<apiSlaveCategoryModel>(this.apiSlaveURL + id, {
      name,
      description,
      initials,
      orderid,
      mastercategoryid,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will create slave category
   * @param name string name
   * @param description string description
   * @param initials string initials
   * @param orderid number orderid
   * @param mastercategoryid number
   * @returns Observable
   */
  createSlaveCategory(
    name: string,
    description: string,
    initials: string,
    orderid: number,
    mastercategoryid: number
  ): Observable<apiSlaveCategoryModel> {
    return this.http.post<apiSlaveCategoryModel>(this.apiSlaveURL + 'create', {
      name,
      description,
      initials,
      orderid,
      mastercategoryid,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will deactivate slave category
   * @param id number slave category id
   * @returns Observable
   */
  deleteSlaveCategory(id: number): Observable<apiSlaveCategoryModel> {
    return this.http
      .post<apiSlaveCategoryModel>(
        this.apiSlaveURL + id,
        {
          userid: this.authService.getUserID(),
        },
        { observe: 'response' }
      )
      .pipe(
        map((response: HttpResponse<any>) => {
          // console.log(`Status: ${response.status}`); // Access status code
          return response.body; // Return response body
        }),
        catchError((error) => {
          // console.log('Full error response:', error); // Log the full error object

          // Extract the message from the error object.
          let errorMessage = 'An unknown error occurred'; // Fallback message

          // Check if the error has a response body with a message.
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              errorMessage = error.error.message; // Check if error message exists in the error object
            } else if (error.message) {
              errorMessage = error.message; // Use general error message if available
            }
          } else if (error.message) {
            errorMessage = error.message; // Use the top-level error message if no nested error object
          }

          return throwError(() => new Error(errorMessage)); // Pass the correct error message
        })
      );
  }
}
