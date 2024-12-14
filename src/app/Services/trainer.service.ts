import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { apiTrainerModel } from '../Models/Trainer';
import { environment } from '../../environments/environment';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class TrainerService {
  /**
   * HttpClient
   */
  private http = inject(HttpClient);
  /**
   * Auth service
   */
  private authService = inject(AuthService);
  /**
   * API URL
   */
  private readonly apiURL = `${environment.apiUrl}trainer/`;
  /**
   * Trainer API call
   */
  private trainerResponse = rxResource({
    loader: () => this.http.get<apiTrainerModel[]>(this.apiURL + 'getAll'),
  });

  /**
   * Readonly Computed trainers
   */
  public trainers = computed(
    () => this.trainerResponse.value() ?? ([] as apiTrainerModel[])
  );

  /**
   * Refresh trainer API call
   */
  public refreshTrainers() {
    this.trainerResponse.reload();
  }

  /**
   * This method will update trainer
   * @param id number trainer id
   * @param name string trainer name
   * @param initials string trainer initials
   * @param mobile string trainer mobile
   * @param address string trainer address
   * @returns
   */
  updateTrainer(
    id: number,
    name: string,
    initials: string,
    mobile: string,
    address: string
  ): Observable<apiTrainerModel> {
    return this.http.put<apiTrainerModel>(this.apiURL + id, {
      name,
      initials,
      mobile,
      address,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will create trainer
   * @param name string trainer name
   * @param initials string trainer initials
   * @param mobile string trainer mobile
   * @param address string trainer address
   * @returns Observable
   */
  createTrainer(
    name: string,
    initials: string,
    mobile: string,
    address: string
  ): Observable<apiTrainerModel> {
    return this.http.post<apiTrainerModel>(this.apiURL + 'create', {
      name,
      initials,
      mobile,
      address,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will fetch trainer count for dashboard
   * @returns Observable
   */
  getTrainerCount(): Observable<any> {
    return this.http.get(this.apiURL + 'dashboardcounts');
  }
}
