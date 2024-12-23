import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CourseService } from '../../Services/course.service';
import { UtilitiesService } from '../../Services/utilities.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { apiGenericModel } from '../../Models/Generic';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-course',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css',
})
export class CourseComponent implements OnInit, OnDestroy {
  private courseService = inject(CourseService);
  private utils = inject(UtilitiesService);
  /**
   * course signal
   */
  courses = this.courseService.courses;
  /**
   * Form for creating new category
   */
  formSaveCourse = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
  });
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Courses');
  }

  /**
   * This method will update course against id
   * @param id {number} course id
   * @param name {string} course name
   * @param description {string} course description
   */
  updateCourse(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.courseService.updateCourse(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Course updated successfully.', 'success');
          this.courseService.refreshCourses();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }
  /**
   * This method will create new course
   * @param name {string} course name
   * @param description {string} course description
   */
  createCourse(name: string, description: string) {
    this.subscriptionList.push(
      this.courseService.createCourse(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.courseService.refreshCourses();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will enable editalble fields.
   * @param course course
   */
  onEdit(course: any) {
    this.courses().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    course.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('course-table', 'Consult-courses-export');
  }
  /**
   * This method will reset the form value to blank
   */
  formReset() {
    this.formSaveCourse.reset();
  }
  /**
   * This method will destory all the subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptionList.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }
}
