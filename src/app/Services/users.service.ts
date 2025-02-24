import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { apiUserModel } from '../Models/User';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ROLES } from '../Models/Constants';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}users/`;
  private userid = signal<string>(this.authService.getUserID());

  /**
   * Users API call
   */
  private usersResponse = rxResource({
    loader: () => {
      if (this.authService.getUserRole() !== ROLES.ADMIN) {
        return EMPTY; // Prevents API call if user is not admin
      }
      return this.http.get<apiUserModel[]>(this.apiURL + 'getusers');
    },
  });

  /**
   * Readonly Computed users
   */
  public users = computed(
    () => this.usersResponse.value() ?? ([] as apiUserModel[])
  );

  /**
   * Refresh users API call
   */
  public refreshUsers() {
    this.usersResponse.reload();
  }

  private userResponse = rxResource({
    request: this.userid, // Use parameterized id
    loader: ({ request }) =>
      this.http.get<apiUserModel>(`${this.apiURL}/${request}`),
  });

  /**
   * Readonly Computed user
   */
  public user = computed(
    () => this.userResponse.value() ?? ({} as apiUserModel)
  );

  /**
   * Refresh user API call
   */
  public refreshUser() {
    this.userResponse.reload();
  }

  /**
   * This method will update user non-primary info
   * @param id number
   * @param name string name
   * @param mobile string mobile
   * @param company string company
   * @param designation string designation
   * @param imagepath string image url
   * @param role string user role
   * @returns Observable
   */
  updateUserByID(
    id: number,
    name: string,
    mobile: string,
    company: string,
    designation: string,
    imagepath: string,
    role: string
  ): Observable<apiUserModel> {
    return this.http.put<apiUserModel>(this.apiURL + id, {
      name,
      mobile,
      company,
      designation,
      imagepath,
      role,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will update user password
   * @param id number userid
   * @param password string user password
   * @returns Observable
   */
  updateUserPasswordByID(
    id: number,
    password: string
  ): Observable<apiUserModel> {
    return this.http.post<apiUserModel>(this.apiURL + 'newpassword', {
      id,
      password,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will update user password
   * @param id number userid
   * @param password string user password
   * @returns Observable
   */
  resetUserPasswordByID(
    oldpassword: string,
    newpassword: string
  ): Observable<apiUserModel> {
    return this.http.post<apiUserModel>(this.apiURL + 'resetpassword', {
      id: this.authService.getUserID(),
      oldpassword,
      newpassword,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will create the user
   * @param obj user object
   * @returns Observable
   */
  createUser(obj: apiUserModel): Observable<apiUserModel> {
    return this.http.post<apiUserModel>(this.apiURL + 'register', {
      obj,
    });
  }

  /**
   * This method will deactive the user
   * @param id number
   * @returns Observable
   */
  deleteUser(id: number): Observable<apiUserModel> {
    return this.http.delete<apiUserModel>(this.apiURL + id);
  }
}
