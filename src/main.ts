import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { RecaptchaComponent } from 'ng-recaptcha-2';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

RecaptchaComponent.prototype.ngOnDestroy = function () {};
