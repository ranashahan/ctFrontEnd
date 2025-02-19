import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { apiContractorModel } from '../../Models/Contractor';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { ContractorService } from '../../Services/contractor.service';
import { ClientService } from '../../Services/client.service';
import { IndustriesService } from '../../Services/industries.service';

@Component({
  selector: 'app-contractor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './contractor.component.html',
  styleUrl: './contractor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractorComponent implements OnInit, OnDestroy {
  private cService = inject(ContractorService);
  private clientService = inject(ClientService);
  private utils = inject(UtilitiesService);
  private industriesService = inject(IndustriesService);
  /**
   * contractor signal
   */
  contractors = this.cService.contractors;
  /**
   * client signal
   */
  clients = this.clientService.clients;

  /**
   * Industries signal
   */
  industries = this.industriesService.industries;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];
  /**
   * Form for creating new contractor
   */
  formSaveContractor = new FormGroup({
    name: new FormControl(),
    ntnnumber: new FormControl(),
    contactname: new FormControl(),
    contactnumber: new FormControl(),
    contactdesignation: new FormControl(),
    contactdepartment: new FormControl(),
    address: new FormControl(),
    initials: new FormControl(),
    clientid: new FormControl(),
    clientnames: new FormControl(),
    industriesid: new FormControl(),
  });

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Contractor');
  }

  /**
   * This method will set blood group name against blood group ID
   * @param itemId blood group ID
   * @returns string blood group name
   */
  getClientName(itemId: number): string {
    return this.utils.getGenericName(this.clients(), itemId);
  }
  /**
   * This method will set blood group name against blood group ID
   * @param itemId blood group ID
   * @returns string blood group name
   */
  getIndustriesName(itemId: number): string {
    return this.utils.getGenericName(this.industries(), itemId);
  }

  /**
   * This method will update visual against id
   * @param id {number} contractor id
   * @param name {string} contractor name
   * @param ntnnumber {string} contractor ntn number
   * @param contactname {string} contractor contact name
   * @param contactnumber {string} contractor contact number
   * @param contactdesignation {string} contractor contact designation
   * @param contactdepartment {string} contractor contact department
   * @param address {string} contractor address
   * @param initials {string} contractor initials
   * @param clientids {array of strings} contractor client IDs
   */
  updateContractor(
    id: number,
    name: string,
    ntnnumber: string,
    contactname: string,
    contactnumber: string,
    contactdesignation: string,
    contactdepartment: string,
    address: string,
    initials: string,
    clientid: number,
    industriesid: number
  ) {
    if (!clientid) {
      this.utils.showToast(
        'Client Ids are mandatory, please associate some clients with contractor',
        'error'
      );
    } else {
      this.subscriptionList.push(
        this.cService
          .updateContractor(
            id,
            name,
            ntnnumber,
            contactname,
            contactnumber,
            contactdesignation,
            contactdepartment,
            address,
            initials,
            clientid,
            industriesid
          )
          .subscribe({
            next: (res: any) => {
              this.utils.showToast(
                'Contractor updated successfully.',
                'success'
              );
              this.cService.refreshContractors();
            },
            error: (err: any) => {
              const errorMessage =
                err?.message || 'An unexpected error occurred';
              this.utils.showToast(errorMessage, 'error'); // Show error toast
            },
          })
      );
    }
  }

  /**
   * this method for only create contractor
   * @param object of formContractor
   */
  createContractor(obj: any) {
    this.subscriptionList.push(
      this.cService.createContractor(obj).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.cService.refreshContractors();
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
   * @param contractor contractor
   */
  onEdit(contractor: any) {
    this.contractors().forEach((element: apiContractorModel) => {
      element.isEdit = false;
    });
    contractor.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('contractor-table', 'Consult-contractor-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveContractor.reset();
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
