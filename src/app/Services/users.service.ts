import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { apiUserModel } from '../Models/User';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiURL = `${environment.apiUrl}users/`;
  private usersLoaded = false;
  private usersBS: BehaviorSubject<apiUserModel[]> = new BehaviorSubject<
    apiUserModel[]
  >([]);
  public users$: Observable<apiUserModel[]> = this.usersBS.asObservable();
  private userBS: BehaviorSubject<apiUserModel[]> = new BehaviorSubject<
    apiUserModel[]
  >([]);
  public user$: Observable<apiUserModel[]> = this.userBS.asObservable();

  /**
   * This method will fetch all the active users
   */
  getAllUsers(): void {
    if (!this.usersLoaded) {
      this.http
        .get<apiUserModel[]>(this.apiURL + 'getusers')
        .pipe(
          tap((data) => {
            this.usersBS.next(data);
            this.usersLoaded = true;
          })
        )
        .subscribe();
    } else {
      console.log('i am in else block', false);
    }
  }
  /**
   * This method will fetch all the active users
   */
  getUsersMust(): void {
    this.http
      .get<apiUserModel[]>(this.apiURL + 'getusers')
      .pipe(
        tap((data) => {
          this.usersBS.next(data);
          this.usersLoaded = true;
        })
      )
      .subscribe();
  }

  /**
   * This method will fetch the user detail against user id
   * @param id number userid
   */
  getUserByID(id: string): void {
    if (this.userBS.value.length < 1) {
      this.http
        .get<apiUserModel[]>(this.apiURL + `${id}`)
        .pipe(
          tap((data) => {
            this.userBS.next(data);
          })
        )
        .subscribe();
    } else {
      console.log('i am in else block');
    }
  }
  /**
   * This method will fetch the user detail against user id
   * @param id number userid
   */
  getUserByIDMust(id: string): void {
    this.http
      .get<apiUserModel[]>(this.apiURL + `${id}`)
      .pipe(
        tap((data) => {
          this.userBS.next(data);
        })
      )
      .subscribe();
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
