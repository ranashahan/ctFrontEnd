import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import {
  apiAssessmentFormModel,
  apiAssessmentModel,
} from '../Models/Assessment';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private readonly apiURL = `${environment.apiUrl}assessment/`;
  authService = inject(AuthService);
  constructor(private http: HttpClient) {}

  /**
   * Get all assessments
   * @returns response
   */
  getAllAssessments(): Observable<any> {
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
  getSessionbydate(
    nic?: any,
    name?: any,
    sessiondate?: any,
    contractorid?: any,
    resultid?: any,
    stageid?: any,
    locationid?: any,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
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
    return this.http.get(this.apiURL + 'getbydate', { params });
  }

  /**
   * This method will fetch session by its id
   * @param id number sessionid
   * @returns response
   */
  getSessionbyID(id: number) {
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

  /**
   * This method will create assessment form with driver and trainer information
   * @param driverId Driver ID
   * @param contractorid Contractor ID
   * @param obj Complete form object with assessment scores
   * @returns response
   */
  createAssessment(
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

    return this.http
      .post<apiAssessmentFormModel>(
        this.apiURL + 'create',
        {
          driverId,
          obj,
          contractorid,
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
   * This method will update assessment form with driver and trainer information
   * @param driverId Driver ID
   * @param obj Complete form object with assessment scores
   * @returns response
   */
  updateAssessment(id: number, obj: apiAssessmentFormModel) {
    console.log('this is my assessment object : ', obj);
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
    console.log(obj.totalScore);
    console.log(obj.assessmentData);

    // const objReturn = this.matchData(objOriginal, obj);
    // console.log(objReturn);

    return this.http
      .put<apiAssessmentFormModel>(
        this.apiURL + id,
        {
          obj,
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
}
