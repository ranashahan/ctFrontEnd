import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/login/login.component';
import { LayoutComponent } from './Pages/layout/layout.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { authGuard } from './Guard/auth.guard';
import { GuestdashboardComponent } from './Pages/guestdashboard/guestdashboard.component';
import { AlldriversComponent } from './Pages/alldrivers/alldrivers.component';
import { DriverdetailComponent } from './Pages/driverdetail/driverdetail.component';
import { AdddriverComponent } from './Pages/adddriver/adddriver.component';
import { DriversreportComponent } from './Pages/driversreport/driversreport.component';
import { AllassessmentsComponent } from './Pages/allassessments/allassessments.component';
import { AssessmentdetailComponent } from './Pages/assessmentdetail/assessmentdetail.component';
import { AddassessmentComponent } from './Pages/addassessment/addassessment.component';
import { AssessmentsreportComponent } from './Pages/assessmentsreport/assessmentsreport.component';
import { ConfigureassessmentComponent } from './Pages/configureassessment/configureassessment.component';
import { TrainersComponent } from './Pages/trainers/trainers.component';
import { BloodgroupComponent } from './Pages/bloodgroup/bloodgroup.component';
import { ClientComponent } from './Pages/client/client.component';
import { ContractorComponent } from './Pages/contractor/contractor.component';
import { DltypeComponent } from './Pages/dltype/dltype.component';
import { LocationComponent } from './Pages/location/location.component';
import { ResultComponent } from './Pages/result/result.component';
import { StageComponent } from './Pages/stage/stage.component';
import { TitleComponent } from './Pages/title/title.component';
import { VehicleComponent } from './Pages/vehicle/vehicle.component';
import { VisualComponent } from './Pages/visual/visual.component';
import { PagenotfoundComponent } from './Pages/pagenotfound/pagenotfound.component';
import { UnauthorizedComponent } from './Pages/unauthorized/unauthorized.component';
import { AllusersComponent } from './Pages/allusers/allusers.component';
import { AlltrainingsComponent } from './Pages/alltrainings/alltrainings.component';
import { TrainingdetailComponent } from './Pages/trainingdetail/trainingdetail.component';
import { AddtrainingComponent } from './Pages/addtraining/addtraining.component';
import { TrainingsreportComponent } from './Pages/trainingsreport/trainingsreport.component';
import { CategoryComponent } from './Pages/category/category.component';
import { CourseComponent } from './Pages/course/course.component';
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'gdashboard',
        component: GuestdashboardComponent,
        canActivate: [authGuard],
        data: { roles: ['guest'] },
      },
      {
        path: 'alldrivers',
        component: AlldriversComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'alldrivers/:id',
        component: DriverdetailComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'adddriver',
        component: AdddriverComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'driversreport',
        component: DriversreportComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff'] },
      },
      {
        path: 'allassessments',
        component: AllassessmentsComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'allassessments/:id',
        component: AssessmentdetailComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'addassessment',
        component: AddassessmentComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff', 'member'] },
      },
      {
        path: 'assessmentsreport',
        component: AssessmentsreportComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager', 'staff'] },
      },
      {
        path: 'assessmentsconfigure',
        component: ConfigureassessmentComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'alltrainings',
        component: AlltrainingsComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'alltrainings/:id',
        component: TrainingdetailComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'addtraining',
        component: AddtrainingComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'trainingsreport',
        component: TrainingsreportComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'trainer',
        component: TrainersComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'blood',
        component: BloodgroupComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'category',
        component: CategoryComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'client',
        component: ClientComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'contractor',
        component: ContractorComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'course',
        component: CourseComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'dltype',
        component: DltypeComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'location',
        component: LocationComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'result',
        component: ResultComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'stage',
        component: StageComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'title',
        component: TitleComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'vehicle',
        component: VehicleComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'visual',
        component: VisualComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'allusers',
        component: AllusersComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  { path: '**', component: PagenotfoundComponent },
];
