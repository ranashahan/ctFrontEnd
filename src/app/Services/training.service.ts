import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { forkJoin, map, Observable } from 'rxjs';
import { apiTrainingModel } from '../Models/Training';
import { ClientService } from './client.service';
import { ContractorService } from './contractor.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  /**
   * API URL
   */
  private readonly apiURL = `${environment.apiUrl}training/`;

  /**
   * Auth service
   */
  private authService = inject(AuthService);
  /**
   * Client service
   */
  private clientService = inject(ClientService);
  /**
   * Contractor Service
   */
  private cService = inject(ContractorService);

  /**
   * Constructor
   * @param http httpclient
   */
  constructor(private http: HttpClient) {}

  /**
   * This method will fetch all the active trainings
   * @returns Observable
   */
  getAllTraining(): Observable<apiTrainingModel[]> {
    return this.http.get<apiTrainingModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method will fetch all the trainings and contractor name & client name
   * @param trainingParam training observable
   * @returns Observable
   */
  getTrainingsWithContractorNames(
    trainingParam: Observable<apiTrainingModel[]>
  ): Observable<any[]> {
    return forkJoin({
      trainings: trainingParam,
      contractors: this.cService.getAll(),
      clients: this.clientService.getAll(),
    }).pipe(
      map(({ trainings, contractors, clients }) => {
        const contractorMap = contractors.reduce((map, contractor: any) => {
          map[contractor.id] = contractor.name;
          return map;
        }, {} as Record<number, string>);
        const clientMap = clients.reduce((map, client: any) => {
          map[client.id] = client.name;
          return map;
        }, {} as Record<number, string>);
        // Map drivers to include contractorName
        return trainings.map((training) => ({
          ...training,
          contractorName: contractorMap[training.contractorid] || '',
          clientName: clientMap[training.clientid] || '',
        }));
      })
    );
  }

  /**
   * This method will fecth training records as per criteria
   * @param name training name
   * @param plandate training plan date
   * @param cource training course title
   * @param category training category
   * @param clientid training client id
   * @param contractorid training contractor id
   * @param startDate training start date
   * @param endDate training end date
   * @returns Observable
   */
  getSessionbydate(
    name?: string,
    plandate?: string,
    cource?: string,
    category?: string,
    clientid?: number,
    contractorid?: number,
    startDate?: string,
    endDate?: string
  ): Observable<apiTrainingModel[]> {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    if (plandate) {
      params = params.set('plandate', plandate);
    }
    if (cource) {
      params = params.set('cource', cource);
    }
    if (category) {
      params = params.set('category', category);
    }
    if (clientid) {
      params = params.set('clientid', clientid);
    }
    if (contractorid) {
      params = params.set('contractorid', contractorid);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<apiTrainingModel[]>(this.apiURL + 'getbydate', {
      params,
    });
  }

  /**
   * This method for get training by its id
   * @param id number trainingid
   * @returns Observable
   */
  getTrainingByID(id: number) {
    return this.http.get<apiTrainingModel>(this.apiURL + id);
  }

  /**
   * This method will create training
   * @param name training name
   * @param cource training course
   * @param category training category
   * @param plandate training plan date
   * @param startdate training start date
   * @param enddate training end date
   * @param duration training duration
   * @param titleid title id
   * @param clientid client id
   * @param contractorid contractor id
   * @param trainerid trainer id
   * @param trainingexpiry training expiry date
   * @param invoicenumber training invoice number
   * @param invoicedate training invoice date
   * @param charges training charges
   * @param transportation training transportation charges
   * @param miscexpense training misc. expenses
   * @param tax training tax charges
   * @param total training total charges
   * @param bank training bank name
   * @param cheque training cheque number
   * @param amountreceived training amount received
   * @param requestedby training requested by name
   * @param contactnumber training requested by contact info
   * @param source training source
   * @param venue training venue
   * @param locationid training location
   * @param status training status
   * @param classroom training class room
   * @param assessment training assessment
   * @param commentry training commentry
   * @returns Observable
   */
  createTraining(
    name: string,
    cource: string,
    category: string,
    plandate: Date,
    startdate: Date,
    enddate: Date,
    duration: string,
    titleid: number,
    clientid: number,
    contractorid: number,
    trainerid: number,
    trainingexpiry: Date,
    invoicenumber: string,
    invoicedate: Date,
    charges: number,
    transportation: number,
    miscexpense: number,
    tax: number,
    total: number,
    bank: string,
    cheque: string,
    amountreceived: number,
    requestedby: string,
    contactnumber: string,
    source: string,
    venue: string,
    locationid: number,
    status: string,
    classroom: number,
    assessment: number,
    commentry: number
  ): Observable<apiTrainingModel> {
    return this.http.post<apiTrainingModel>(this.apiURL + 'create', {
      name,
      cource,
      category,
      plandate,
      startdate,
      enddate,
      duration,
      titleid,
      clientid,
      contractorid,
      trainerid,
      trainingexpiry,
      invoicenumber,
      invoicedate,
      charges,
      transportation,
      miscexpense,
      tax,
      total,
      bank,
      cheque,
      amountreceived,
      requestedby,
      contactnumber,
      source,
      venue,
      locationid,
      status,
      classroom,
      assessment,
      commentry,
      userid: this.authService.getUserID(),
    });
  }

  updateTraining(
    id: number,
    name: string,
    cource: string,
    category: string,
    plandate: Date,
    startdate: Date,
    enddate: Date,
    duration: string,
    titleid: number,
    clientid: number,
    contractorid: number,
    trainerid: number,
    trainingexpiry: Date,
    invoicenumber: string,
    invoicedate: Date,
    charges: number,
    transportation: number,
    miscexpense: number,
    tax: number,
    total: number,
    bank: string,
    cheque: string,
    amountreceived: number,
    requestedby: string,
    contactnumber: string,
    source: string,
    venue: string,
    locationid: number,
    status: string,
    classroom: number,
    assessment: number,
    commentry: number
  ): Observable<apiTrainingModel> {
    return this.http.put<apiTrainingModel>(this.apiURL + id, {
      name,
      cource,
      category,
      plandate,
      startdate,
      enddate,
      duration,
      titleid,
      clientid,
      contractorid,
      trainerid,
      trainingexpiry,
      invoicenumber,
      invoicedate,
      charges,
      transportation,
      miscexpense,
      tax,
      total,
      bank,
      cheque,
      amountreceived,
      requestedby,
      contactnumber,
      source,
      venue,
      locationid,
      status,
      classroom,
      assessment,
      commentry,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method will delete training
   * @param id training ID
   * @returns 201 status
   */
  deleteTrainingByID(id: number) {
    return this.http.delete(this.apiURL + id);
  }
}
