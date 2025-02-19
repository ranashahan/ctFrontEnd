import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { Subscription } from 'rxjs';
import { apiClientModel } from '../../Models/Client';
import { ClientService } from '../../Services/client.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { IndustriesService } from '../../Services/industries.service';

@Component({
  selector: 'app-client',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ToastComponent],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientComponent implements OnInit, OnDestroy {
  private clientService = inject(ClientService);
  private industriesService = inject(IndustriesService);
  private utils = inject(UtilitiesService);
  /**
   * client signal
   */
  clients = this.clientService.clients;
  industries = this.industriesService.industries;
  /**
   * Form for creating new client
   */
  formSaveClient = new FormGroup({
    name: new FormControl(),
    contactperson: new FormControl(),
    contactnumber: new FormControl(),
    address: new FormControl(),
    website: new FormControl(),
    agentname: new FormControl(),
    agentnumber: new FormControl(),
    industriesid: new FormControl(),
  });
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Clients');
  }

  /**
   * This method will set industry name against industries ID
   * @param itemId industries ID
   * @returns string industry name
   */
  getIndustriesName(itemId: number): string {
    return this.utils.getGenericName(this.industries(), itemId);
  }

  /**
   * This method will update client against id
   * @param id
   * @param name
   * @param contactperson
   * @param contactnumber
   * @param address
   * @param website
   * @param agentname
   * @param agentnumber
   */
  update(
    id: number,
    name: string,
    contactperson: string,
    contactnumber: string,
    address: string,
    website: string,
    agentname: string,
    agentnumber: string,
    industriesid: number
  ) {
    this.subscriptionList.push(
      this.clientService
        .updateClient(
          name,
          contactperson,
          contactnumber,
          address,
          website,
          agentname,
          agentnumber,
          industriesid,
          id
        )
        .subscribe({
          next: (res: any) => {
            this.utils.showToast('Client updated successfully.', 'success');
            this.clientService.refreshClients();
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error'); // Show error toast
          },
        })
    );
  }

  /**
   * This method will create new client
   * @param name
   * @param contactperson
   * @param contactnumber
   * @param address
   * @param website
   * @param agentname
   * @param agentnumber
   */
  create(
    name: string,
    contactperson: string,
    contactnumber: string,
    address: string,
    website: string,
    agentname: string,
    agentnumber: string,
    industriesid: number
  ) {
    this.subscriptionList.push(
      this.clientService
        .createClient(
          name,
          contactperson,
          contactnumber,
          address,
          website,
          agentname,
          agentnumber,
          industriesid
        )
        .subscribe({
          next: (res: any) => {
            this.utils.showToast(res.message, 'success');
            this.clientService.refreshClients();
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
   * @param client client
   */
  onEdit(client: any) {
    this.clients().forEach((element: apiClientModel) => {
      element.isEdit = false;
    });
    client.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('client-table', 'Consult-client-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveClient.reset();
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
