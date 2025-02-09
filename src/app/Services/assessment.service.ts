import { computed, inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import {
  apiAssessmentFormModel,
  apiAssessmentModel,
  apiSessionDriverReportModel,
  apiSessionModel,
  apiVSessionModel,
} from '../Models/Assessment';
import { ContractorService } from './contractor.service';
import { LocationService } from './location.service';
import { ResultService } from './result.service';
import { StageService } from './stage.service';
import { apiContractorModel } from '../Models/Contractor';
import { apiGenericModel } from '../Models/Generic';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  Activity,
  AssessmentFormModel,
  MasterCategory,
  Slavecategory,
} from '../Models/AssessmentEXP';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private readonly apiURL = `${environment.apiUrl}assessment/`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cService = inject(ContractorService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private stageService = inject(StageService);

  private contractors = this.cService.contractors;
  private locations = this.locationService.locations;
  private results = this.resultService.results;
  private stages = this.stageService.stages;

  /**
   * Assessment API call
   */
  private assessmentResponse = rxResource({
    loader: () => this.http.get<MasterCategory[]>(this.apiURL + 'getAllExp'),
  });

  /**
   * Readonly Computed assessments
   */
  public assessments = computed(
    () => this.assessmentResponse.value() ?? ([] as MasterCategory[])
  );

  /**
   * Refresh Assessment API call
   */
  public refreshAssessments() {
    this.assessmentResponse.reload();
  }

  /**
   * Get all assessments
   * @returns response
   */
  public getAllAssessments(): Observable<any> {
    return this.http.get(this.apiURL + 'getAll');
  }

  /**
   * This method will search sassions against query
   * @param nic string driver nic
   * @param name string sesion name
   * @param sessiondate date session date
   * @param contractorid number contractor id
   * @param resultid number result id
   * @param stageid number stage id
   * @param locationid number location id
   * @param startDate date search start date
   * @param endDate date search end date
   * @returns
   */
  public getSessionbydate(
    nic?: any,
    name?: any,
    sessiondate?: any,
    contractorid?: any,
    resultid?: any,
    stageid?: any,
    locationid?: any,
    startDate?: string,
    endDate?: string
  ): Observable<apiSessionModel[]> {
    let params = new HttpParams();
    if (nic) {
      params = params.set('nic', nic);
    }
    if (name) {
      params = params.set('name', name);
    }
    if (sessiondate) {
      params = params.set('sessiondate', sessiondate);
    }
    if (contractorid) {
      params = params.set('contractorid', contractorid);
    }
    if (resultid) {
      params = params.set('resultid', resultid);
    }
    if (stageid) {
      params = params.set('stageid', stageid);
    }
    if (locationid) {
      params = params.set('locationid', locationid);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<apiSessionModel[]>(this.apiURL + 'getbydate', {
      params,
    });
  }

  /**
   * This method will fetch the assessment report records
   * @param clientid clientid
   * @param contractorid contractorid
   * @param startDate start date
   * @param endDate end date
   * @returns Observable
   */
  public getSessionReportByDate(
    clientid?: number,
    contractorid?: number,
    startDate?: string,
    endDate?: string
  ): Observable<apiSessionModel[]> {
    let params = new HttpParams();
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

    return this.http.get<apiSessionModel[]>(this.apiURL + 'getReportByDate', {
      params,
    });
  }

  /**
   * This method will fetch all the session + driver records for report.
   * @param startDate {Date} start date
   * @param endDate {Date} end date
   * @param licensetypeid {number} licensetype
   * @param bloodgroupid {number} bloodgroup
   * @param visualid {number} visual
   * @param locationid {number} location
   * @param resultid {number} result
   * @param stageid {number} stage
   * @param titleid {number} title
   * @param vehicleid {number} vehicle
   * @param contractorid {number} contractor
   * @param trainerid {number} trainer
   * @returns Observable
   */
  public getSessionReportAll(
    name?: string,
    licensetypeid?: number,
    bloodgroupid?: number,
    visualid?: number,
    locationid?: number,
    resultid?: number,
    stageid?: number,
    titleid?: number,
    vehicleid?: number,
    contractorid?: number,
    trainerid?: number,
    startDate?: string,
    endDate?: string
  ): Observable<apiSessionDriverReportModel[]> {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    if (licensetypeid) {
      params = params.set('licensetypeid', licensetypeid);
    }
    if (bloodgroupid) {
      params = params.set('bloodgroupid', bloodgroupid);
    }
    if (visualid) {
      params = params.set('visualid', visualid);
    }
    if (locationid) {
      params = params.set('locationid', locationid);
    }
    if (resultid) {
      params = params.set('resultid', resultid);
    }
    if (stageid) {
      params = params.set('stageid', stageid);
    }
    if (titleid) {
      params = params.set('titleid', titleid);
    }
    if (vehicleid) {
      params = params.set('vehicleid', vehicleid);
    }
    if (contractorid) {
      params = params.set('contractorid', contractorid);
    }
    if (trainerid) {
      params = params.set('trainerid', trainerid);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<apiSessionDriverReportModel[]>(
      this.apiURL + 'getReportAll',
      {
        params,
      }
    );
  }

  /**
   * This method will fetch all the sessions with contractor,location,result,stages names
   * @returns Session Signal
   */
  public getSessionsWithNames(sessionParam: Signal<apiSessionModel[]>) {
    return computed(() => {
      const sessions = sessionParam();
      const contractorsValue = this.contractors();
      const locationsValue = this.locations();
      const resultsValue = this.results();
      const stagesValue = this.stages();

      const contractorMap = contractorsValue.reduce(
        (map, contractor: apiContractorModel) => {
          map[contractor.id] = contractor.name;
          return map;
        },
        {} as Record<number, string>
      );

      const locationMap = locationsValue.reduce(
        (map, location: apiGenericModel) => {
          map[location.id] = location.name;
          return map;
        },
        {} as Record<number, string>
      );

      const resultMap = resultsValue.reduce((map, result: apiGenericModel) => {
        map[result.id] = result.name;
        return map;
      }, {} as Record<number, string>);

      const stageMap = stagesValue.reduce((map, stage: apiGenericModel) => {
        map[stage.id] = stage.name;
        return map;
      }, {} as Record<number, string>);

      return sessions.map((session) => ({
        ...session,
        contractorName: contractorMap[session.contractorid] || '',
        locationName: locationMap[session.locationid] || '',
        resultName: resultMap[session.resultid] || '',
        stageName: stageMap[session.stageid] || '',
      }));
    });
  }

  /**
   * This method will fetch session by its id
   * @param id number sessionid
   * @returns response
   */
  public getSessionbyID(id: number) {
    return this.http.get(this.apiURL + id);
  }

  /**
   * This method will diactive the session and remove its all relevent entries
   * @param id number sessionid
   * @returns response
   */
  deleteSessionByID(id: number) {
    return this.http.delete(this.apiURL + id);
  }

  createSessoinTraining(payload: any) {
    return this.http.post(this.apiURL + 'createst', {
      payload,
    });
  }

  /**
   * This method will fetch all the session against training id
   * @param trainingid training id
   * @returns Observable
   */
  getSessoinTraining(trainingid: number): Observable<apiVSessionModel[]> {
    let params = new HttpParams();
    params = params.set('trainingid', trainingid);
    return this.http.get<apiVSessionModel[]>(this.apiURL + 'getst', {
      params,
    });
  }

  /**
   * This method will delete training session relationship
   * @param trainingid number
   * @param sessionid session
   * @returns Observalbe
   */
  public deleteSessionTraining(trainingid: number, sessionid: number) {
    return this.http.post(this.apiURL + 'deletets', {
      trainingid,
      sessionid,
    });
  }

  /**
   * This method will create assessment form with driver and trainer information
   * @param driverId Driver ID
   * @param contractorid Contractor ID
   * @param obj Complete form object with assessment scores
   * @returns response
   */
  public createAssessment(
    driverId: number,
    contractorid: number,
    obj: apiAssessmentFormModel
  ): Observable<apiAssessmentFormModel> {
    var answerCategories = obj.categories;
    var answerSessionDate = obj.sessionDate;

    const jsonResult = this.convertCategoriesToJson(
      answerCategories,
      answerSessionDate
    );
    // Convert to JSON string if needed
    //const jsonString = JSON.stringify(jsonResult, null, 2);
    obj.totalScore = jsonResult.totalScore;
    obj.assessmentData = jsonResult.data;

    return this.http.post<apiAssessmentFormModel>(this.apiURL + 'create', {
      driverId,
      obj,
      contractorid,
      userid: this.authService.getUserID(),
    });
  }

  public createAssessmentExp(
    driverId: number,
    contractorid: number,
    obj: AssessmentFormModel
  ): Observable<AssessmentFormModel> {
    var answerCategories = obj.categories;
    var answerSessionDate = obj.sessionDate;

    const jsonResult = this.convertCategoriesToJsonExp(
      answerCategories,
      answerSessionDate
    );
    obj.totalScore = jsonResult.totalScore;
    obj.assessmentData = jsonResult.data;

    return this.http.post<AssessmentFormModel>(this.apiURL + 'create', {
      driverId,
      obj,
      contractorid,
      userid: this.authService.getUserID(),
    });
  }
  /**
   * This method will update assessment form with driver and trainer information
   * @param driverId Driver ID
   * @param obj Complete form object with assessment scores
   * @returns response
   */
  public updateAssessment(id: number, obj: apiAssessmentFormModel) {
    var answerCategories = obj.categories;
    var answerSessionDate = obj.sessionDate;

    const jsonResult = this.convertCategoriesToJson(
      answerCategories,
      answerSessionDate
    );

    obj.totalScore = jsonResult.totalScore;
    obj.assessmentData = jsonResult.data;

    return this.http.put<apiAssessmentFormModel>(this.apiURL + id, {
      obj,
      userid: this.authService.getUserID(),
    });
    //   ,
    //   { observe: 'response' }
    // )
    // .pipe(
    //   map((response: HttpResponse<any>) => {
    //     // console.log(`Status: ${response.status}`); // Access status code
    //     return response.body; // Return response body
    //   }),
    //   catchError((error) => {
    //     // console.log('Full error response:', error); // Log the full error object

    //     // Extract the message from the error object.
    //     let errorMessage = 'An unknown error occurred'; // Fallback message

    //     // Check if the error has a response body with a message.
    //     if (error.error && typeof error.error === 'object') {
    //       if (error.error.message) {
    //         errorMessage = error.error.message; // Check if error message exists in the error object
    //       } else if (error.message) {
    //         errorMessage = error.message; // Use general error message if available
    //       }
    //     } else if (error.message) {
    //       errorMessage = error.message; // Use the top-level error message if no nested error object
    //     }

    //     return throwError(() => new Error(errorMessage)); // Pass the correct error message
    //   })
    // );
  }

  public updateAssessmentExp(
    id: number,
    obj: AssessmentFormModel
  ): Observable<AssessmentFormModel> {
    var answerCategories = obj.categories;
    var answerSessionDate = obj.sessionDate;

    const jsonResult = this.convertCategoriesToJsonExp(
      answerCategories,
      answerSessionDate
    );

    obj.totalScore = jsonResult.totalScore;
    obj.assessmentData = jsonResult.data;

    return this.http.put<AssessmentFormModel>(this.apiURL + id, {
      obj,
      userid: this.authService.getUserID(),
    });
  }

  /**
   * This method for match data
   * @param originalSessionData orignalSession Data
   * @param updatedFormValues Form values
   * @returns Updated values (excluded orginal session values)
   */
  private matchData(originalSessionData: any, updatedFormValues: any) {
    const filteredUpdatedValues = {
      ...updatedFormValues,
      categories: updatedFormValues.categories
        ? updatedFormValues.categories.map((category: any) => ({
            ...category,
            assessments: category.assessments
              ? category.assessments
                  .map((assessment: any) => {
                    // Check if any score in the current assessment is non-null
                    const hasValidScores =
                      assessment.scoreInitial !== null ||
                      assessment.scoreMiddle !== null ||
                      assessment.scoreFinal !== null;

                    if (!hasValidScores) {
                      // console.log(
                      //   'Assessment with all null scores found:',
                      //   assessment
                      // );
                      return null; // Mark as null for filtering out later
                    }

                    // Remove scores that are null, leaving only non-null values
                    return {
                      ...assessment,
                      scoreInitial:
                        assessment.scoreInitial !== null
                          ? assessment.scoreInitial
                          : undefined,
                      scoreMiddle:
                        assessment.scoreMiddle !== null
                          ? assessment.scoreMiddle
                          : undefined,
                      scoreFinal:
                        assessment.scoreFinal !== null
                          ? assessment.scoreFinal
                          : undefined,
                    };
                  })
                  // Remove assessments that are null (i.e., had all null scores)
                  .filter((assessment: any) => assessment !== null)
              : [], // If 'assessments' is undefined, return an empty array
          }))
        : [], // If 'categories' is undefined, return an empty array
    };

    const originalAssessments = originalSessionData?.assessments;
    const updatedAssessments = filteredUpdatedValues.categories.flatMap(
      (category: any) => category.assessments
    );
    const assessmentsToUpdate = updatedAssessments.flatMap((updated: any) => {
      // Find all original assessments with the same activityid
      const matchingOriginals = originalAssessments.filter(
        (original: any) => original.activityid === updated.id
      );

      let changes: any[] = [];

      // Check each assessment type (Final, Middle, Initial) separately
      matchingOriginals.forEach((original: any) => {
        if (
          original.assessment_type === 'Final' &&
          original.score !== updated.scoreFinal
        ) {
          changes.push({ ...updated, assessment_type: 'Final' });
        }
        if (
          original.assessment_type === 'Middle' &&
          original.score !== updated.scoreMiddle
        ) {
          changes.push({ ...updated, assessment_type: 'Middle' });
        }
        if (
          original.assessment_type === 'Initial' &&
          original.score !== updated.scoreInitial
        ) {
          changes.push({ ...updated, assessment_type: 'Initial' });
        }
      });

      // Return the changes for this assessment (can be Final, Middle, Initial, or all)
      return changes;
    });
    const assessmentsToInsert = updatedAssessments.filter(
      (updated: any) =>
        !originalAssessments.some(
          (original: any) => original.activityid === updated.id
        )
    );
    const objReturn = { assessmentsToUpdate, assessmentsToInsert };
    return objReturn;
  }

  /**
   * This method for covert data into json
   * @param categories category
   * @param sessionDate session date
   * @returns json
   */
  private convertCategoriesToJson(
    categories: any[],
    sessionDate: string
  ): { data: any[]; totalScore: number } {
    const result: any[] = [];
    let totalScore = 0;
    categories.forEach((category) => {
      category.assessments.forEach((assessment: apiAssessmentModel) => {
        if (assessment.scoreInitial != null) {
          result.push({
            slavecategoryid: category.id,
            activityid: assessment.id,
            assessmenttype: 'Initial',
            score: assessment.scoreInitial,
            assessmentdate: sessionDate,
          });
          totalScore += assessment.scoreInitial;
        }

        if (assessment.scoreMiddle != null) {
          result.push({
            slavecategoryid: category.id,
            activityid: assessment.id,
            assessmenttype: 'Middle',
            score: assessment.scoreMiddle,
            assessmentdate: sessionDate,
          });
          totalScore += assessment.scoreMiddle;
        }

        if (assessment.scoreFinal != null) {
          result.push({
            slavecategoryid: category.id,
            activityid: assessment.id,
            assessmenttype: 'Final',
            score: assessment.scoreFinal,
            assessmentdate: sessionDate,
          });
          totalScore += assessment.scoreFinal;
        }
      });
    });
    return { data: result, totalScore };
  }

  /**
   * This method for covert data into json
   * @param categories category
   * @param sessionDate session date
   * @returns json
   */
  private convertCategoriesToJsonExp(
    categories: MasterCategory[],
    sessionDate: string
  ): { data: any[]; totalScore: number } {
    const result: any[] = [];
    let totalScore = 0;
    categories.forEach((category) => {
      category.slavecategories.forEach((slavecategory: Slavecategory) => {
        slavecategory.activities.forEach((activity: Activity) => {
          if (activity.scoreInitial != null) {
            result.push({
              slavecategoryid: slavecategory.id,
              activityid: activity.id,
              assessmenttype: 'Initial',
              score: activity.scoreInitial,
              assessmentdate: sessionDate,
            });
            totalScore += activity.scoreInitial;
          }
          if (activity.scoreMiddle != null) {
            result.push({
              slavecategoryid: slavecategory.id,
              activityid: activity.id,
              assessmenttype: 'Middle',
              score: activity.scoreMiddle,
              assessmentdate: sessionDate,
            });
            totalScore += activity.scoreMiddle;
          }

          if (activity.scoreFinal != null) {
            result.push({
              slavecategoryid: slavecategory.id,
              activityid: activity.id,
              assessmenttype: 'Final',
              score: activity.scoreFinal,
              assessmentdate: sessionDate,
            });
            totalScore += activity.scoreFinal;
          }
        });
      });
    });
    return { data: result, totalScore };
  }
}
