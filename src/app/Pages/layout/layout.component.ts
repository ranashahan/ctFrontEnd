import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from '../../Widgets/profile/profile.component';
import { AuthService } from '../../Services/auth.service';
import { Menu } from '../../Models/Menu';
import { debounceTime } from 'rxjs';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { httpResource } from '@angular/common/http';
import { apiDriverModel } from '../../Models/Driver';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    FooterComponent,
    ProfileComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {
  searchControl = new FormControl(); // Reactive form control for search input
  isLoading = signal<boolean>(false); // Show loading indicator
  username = signal<string>('');
  @ViewChild(ProfileComponent) userprofileComponent!: ProfileComponent;
  dropdownMenus: any = [];
  userRoles: string[] = [];
  searchQuery = signal<string>('');
  searchEnable = computed(() => this.searchQuery().length > 0);

  /**
   * Constructor
   * @param authService auth service
   * @param driverService driver service
   * @param cdRef Change detector Reference
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.dropdownMenus = Menu.dropdownMenus;
    this.authService.setUserRole();
    this.userRoles = [this.authService.getUserRole() ?? 'member'];
    this.username.set(this.authService.getUsername() ?? 'dummyUser');
    this.searchControl.valueChanges
      .pipe(debounceTime(800))
      .subscribe((query) => {
        this.searchQuery.set(query);
      });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {}

  /**
   * This method for get search
   */
  searchResource = httpResource<apiDriverModel[]>(() => {
    const enabled = this.searchEnable();
    return enabled
      ? `${environment.apiUrl}driver/search?nic=${this.searchQuery()}`
      : undefined;
  });
  /**
   * This method to navigate programatically
   * @param id driver ID
   */
  navigateToDriver(id: number): void {
    this.router.navigate(['/alldrivers', id]).then(() => {
      this.clearSearch();
      this.cdRef.detectChanges();
    });
  }

  /**
   * This method for clear search
   */
  clearSearch(): void {
    this.searchResource.set([]);
    this.searchControl.setValue(''); // Clear the search input
  }

  /**
   * This method for logout user
   */
  onLogOut(): void {
    this.authService.logout();
  }

  /**
   * This method for open user profile
   */
  openUserProfileModal(): void {
    this.userprofileComponent.openModal();
  }
  /**
   * This method for verify access against userrole
   * @param roles
   * @returns boolean
   */
  canAccess(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }
}
