import { computed, inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { apiTrainingModel } from '../Models/Training';
import { ClientService } from './client.service';
import { ContractorService } from './contractor.service';
import { CourseService } from './course.service';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  /**
   * API URL
   */
  private readonly apiURL = `${environment.apiUrl}training/`;
  /**
   * HttpClient
   */
  private http = inject(HttpClient);

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
   * Course Service
   */
  private courseService = inject(CourseService);
  /**
   * Category Service
   */
  private categoryService = inject(CategoryService);
  /**
   * Course signal
   */
  private courses = this.courseService.courses;
  /**
   * Categories signal
   */
  private categories = this.categoryService.categories;
  /**
   * Client signal
   */
  private clients = this.clientService.clients;
  /**
   * Contractor signal
   */
  private contractors = this.cService.contractors;
  /**
   * Counter
   */
  private counter: number = 1;
  /**
   * Key
   */
  private keys: Set<string> = new Set();

  /**
   * This method will fetch all the active trainings
   * @returns Observable
   */
  getAllTraining(): Observable<apiTrainingModel[]> {
    return this.http.get<apiTrainingModel[]>(this.apiURL + 'getAll');
  }

  /**
   * This method will fetch all the trainings and contractor name & client name
   * @param trainingParam training signal
   * @returns training signal
   */
  getTrainingsWithContractorNames(trainingParam: Signal<apiTrainingModel[]>) {
    return computed(() => {
      const trainings: apiTrainingModel[] = trainingParam();
      const contractorsValue = this.contractors();
      const clientsValue = this.clients();
      const coursesValue = this.courses();
      const categoriesValue = this.categories();

      const contractorMap = contractorsValue.reduce((map, contractor: any) => {
        map[contractor.id] = contractor.name;
        return map;
      }, {} as Record<number, string>);

      const clientsMap = clientsValue.reduce((map, client: any) => {
        map[client.id] = client.name;
        return map;
      }, {} as Record<number, string>);

      const coursesMap = coursesValue.reduce((map, course: any) => {
        map[course.id] = course.name;
        return map;
      }, {} as Record<number, string>);

      const categoriesMap = categoriesValue.reduce((map, category: any) => {
        map[category.id] = category.name;
        return map;
      }, {} as Record<number, string>);

      return trainings.map((training) => ({
        ...training,
        contractorName: contractorMap[training.contractorid] || '',
        clientName: clientsMap[training.clientid] || '',
        courseName: coursesMap[training.courseid] || '',
        categoryName: categoriesMap[training.categoryid] || '',
      }));
    });
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
    courseid?: string,
    categoryid?: string,
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
    if (courseid) {
      params = params.set('courseid', courseid);
    }
    if (categoryid) {
      params = params.set('categoryid', categoryid);
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
    courseid: number,
    categoryid: number,
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
      courseid,
      categoryid,
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
   * This method will update training
   * @param id {number} training id
   * @param name {string} training name
   * @param courseid {number} course id
   * @param categoryid {number} category id
   * @param plandate {date} training date
   * @param startdate {date} training start date
   * @param enddate {date} training end date
   * @param duration {string} training duration
   * @param titleid {number} title id
   * @param clientid {number} client id
   * @param contractorid {number} contractor id
   * @param trainerid {number} trainer id
   * @param trainingexpiry {date} training expiry
   * @param invoicenumber {string} invoice number
   * @param invoicedate {date} invoice date
   * @param charges {number} invoice charges
   * @param transportation {number} transportation charges
   * @param miscexpense {number} misc expenses
   * @param tax {number} tax
   * @param total {number} auto calculated
   * @param bank {string} bank name
   * @param cheque {string} cheque
   * @param amountreceived {number}
   * @param requestedby {string} requested person name
   * @param contactnumber {string} requested person contact
   * @param source {string} source
   * @param venue {string} venue
   * @param locationid {number} location id
   * @param status {string} job status
   * @param classroom {number} classroom (yes or no)
   * @param assessment {number} assessment (yes or no)
   * @param commentry {number} commentry (yes or no)
   * @returns
   */
  updateTraining(
    id: number,
    name: string,
    courseid: number,
    categoryid: number,
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
      courseid,
      categoryid,
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

  /**
   * This method will generate key for auto increasement
   * @returns string generetedKey
   */
  generateKey(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    let key = `CNTT-${year}${month}${day}-${this.counter}`;

    while (this.keys.has(key)) {
      this.counter++;
      key = `CNTT-${year}${month}${day}-${this.counter}`;
    }

    this.keys.add(key);
    return key;
  }

  /**
   * This method will generate report
   * @param name {string} training name
   * @param courseid {number} training course id
   * @param categoryid {number} training category id
   * @param clientid {number} training client id
   * @param contractorid {number} training contractor id
   * @param titleid {number} training title id
   * @param trainerid {number} training trainer id
   * @param locationid {number} training location id
   * @param source {string} training source
   * @param status {string} training status
   * @param startDate {date} training start date
   * @param endDate {date} training end
   * @returns Observable
   */
  public getTrainingReportAll(
    name?: string,
    courseid?: number,
    categoryid?: number,
    clientid?: number,
    contractorid?: number,
    titleid?: number,
    trainerid?: number,
    locationid?: number,
    source?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Observable<apiTrainingModel[]> {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    if (courseid) {
      params = params.set('courseid', courseid);
    }
    if (categoryid) {
      params = params.set('categoryid', categoryid);
    }
    if (clientid) {
      params = params.set('clientid', clientid);
    }
    if (contractorid) {
      params = params.set('contractorid', contractorid);
    }
    if (titleid) {
      params = params.set('titleid', titleid);
    }
    if (trainerid) {
      params = params.set('trainerid', trainerid);
    }
    if (locationid) {
      params = params.set('locationid', locationid);
    }
    if (source) {
      params = params.set('source', source);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<apiTrainingModel[]>(this.apiURL + 'getReportAll', {
      params,
    });
  }

  /**
   * This method will get finance report
   * @param month {number} month in number
   * @param year {year} year in number
   * @returns Observable
   */
  public getTrainingFinanceReport(
    month?: number,
    year?: number
  ): Observable<apiTrainingModel[]> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    if (year) {
      params = params.set('year', year);
    }
    return this.http.get<apiTrainingModel[]>(this.apiURL + 'getFinanceReport', {
      params,
    });
  }
}
