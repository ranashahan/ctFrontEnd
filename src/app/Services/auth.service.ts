import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { Constant } from '../Models/Constants';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}users`;
  private roles: string[] = [];
  constructor(private http: HttpClient) {}

  /**
   * This method will use for login purpose
   * @param email string
   * @param password string
   * @returns Observable
   */
  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((tokens) => {
          localStorage?.setItem('email', this.encryptData(tokens.email));
          localStorage?.setItem('id', this.encryptData(tokens.id));
          localStorage?.setItem('username', this.encryptData(tokens.username));
          localStorage?.setItem('role', this.encryptData(tokens.role));
          this.storeTokens(tokens.accessToken, tokens.refreshToken);
          this.storeUserTheme('light');
        }),
        catchError((error) => {
          // If 401, it means the credentials are incorrect
          if (error.status === 401) {
            console.log('Incorrect credentials, please try again.');
          }
          // Pass the error forward
          return throwError(
            () => new Error('Login failed, please check your credentials.')
          );
        })
      );
  }

  /**
   * This method will automatically fetched new access token
   * @returns Observable
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<any>(`${this.apiUrl}/login/refreshtoken`, { refreshToken })
      .pipe(
        tap((tokens) => {
          this.storeTokens(tokens.accessToken, tokens.refreshToken);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * This method will store accessToken & refreshToken
   * @param accessToken string
   * @param refreshToken string
   */
  public storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * This is getter method for accessToken
   * @returns accessToken
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  /**
   * This method will store theme
   * @param theme string
   */
  public storeUserTheme(theme: string): void {
    localStorage.setItem('theme', theme);
  }
  /**
   * This is getter method for theme
   */
  public getUserTheme(): string {
    const theme = localStorage.getItem('theme');
    if (theme !== null) {
      return theme;
    } else {
      return 'light';
    }
  }

  /**
   * This is getter method for Username
   * @returns Username
   */
  getUsername(): string {
    const username = localStorage.getItem('username');
    if (username !== null) {
      return this.decryptData(username);
    } else {
      return '';
    }
  }

  /**
   * This is getter method for UserID
   * @returns UserID
   */
  getUserID(): string {
    const id = localStorage.getItem('id');
    if (id !== null) {
      return this.decryptData(id);
    } else {
      return '';
    }
  }

  /**
   * This is getter method for UserRole
   * @returns UserRole
   */
  getUserRole(): string {
    const role = localStorage.getItem('role');
    if (role !== null) {
      return this.decryptData(role);
    } else {
      return '';
    }
  }

  /**
   * This is getter method for UserEmail
   * @returns UserEmail
   */
  getUserEmail(): string {
    const email = localStorage.getItem('email');
    if (email !== null) {
      return this.decryptData(email);
    } else {
      return '';
    }
  }

  /**
   * This is getter method for refreshToken
   * @returns refreshToken
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * This method will set User role
   */
  setUserRole() {
    this.roles = [this.getUserRole() ?? 'member'];
  }

  /**
   * This method to check if a user has a specific role
   * @param role string
   * @returns boolean
   */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /**
   * This method to check if a user has any roles from an array
   * @param roles string Array
   * @returns boolean
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }

  /**
   * This method to logout user and remove all localstorage items
   */
  logout(): void {
    const userid = this.getUserID();
    this.http.post(`${this.apiUrl}/logout`, { userid }).subscribe();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('theme');
  }

  /**
   * This method to error handle
   * @param error HttpErrorResponse
   * @returns error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error occurred
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
      console.error(`Error Details: ${error.error}`); // Logs server error details
    }

    return throwError(() => new Error(errorMessage)); // Throw error with message

    //return throwError(() => new Error(error.message || 'Server error'));
  }

  /**
   * This method will encrypt any string
   * @param data string
   * @returns encrypt string
   */
  private encryptData(data: string) {
    return CryptoJS.AES.encrypt(data.toString(), Constant.EN_KEY).toString();
  }

  /**
   * This method will decrypt any encrypted string
   * @param data string
   * @returns decrypt string
   */
  private decryptData(data: string) {
    return CryptoJS.AES.decrypt(data, Constant.EN_KEY).toString(
      CryptoJS.enc.Utf8
    );
  }
}
