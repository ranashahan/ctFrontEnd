import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUserModel } from '../Models/User';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiURL = `${environment.apiUrl}users/`;
  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);

  /**
   * This method will fetch all the active users
   * @returns Observable
   */
  getAllUsers(): Observable<apiUserModel[]> {
    return this.http.get<apiUserModel[]>(this.apiURL + 'getusers');
  }

  /**
   * This method will fetch the user detail against user id
   * @param id number userid
   * @returns Observable
   */
  getUserByID(id: string): Observable<apiUserModel> {
    return this.http.get<apiUserModel>(this.apiURL + `${id}`);
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
   * This method will create the user
   * @param obj user object
   * @returns Observable
   */
  createUser(obj: apiUserModel): Observable<apiUserModel> {
    console.log(obj);
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
