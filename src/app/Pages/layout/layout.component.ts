import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from '../../Widgets/profile/profile.component';
import { AuthService } from '../../Services/auth.service';
import { DriverService } from '../../Services/driver.service';
import { Menu } from '../../Models/Menu';
import { debounceTime, switchMap } from 'rxjs';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

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
  searchResults = signal<any[]>([]); // Store search results
  isLoading = signal<boolean>(false); // Show loading indicator
  username = signal<string>('');
  @ViewChild(ProfileComponent) userprofileComponent!: ProfileComponent;
  dropdownMenus: any = [];
  userRoles: string[] = [];

  /**
   * Constructor
   * @param authService auth service
   * @param driverService driver service
   * @param cdRef Change detector Reference
   */
  constructor(
    private authService: AuthService,
    private driverService: DriverService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.dropdownMenus = Menu.dropdownMenus;
    this.authService.setUserRole();
    this.userRoles = [this.authService.getUserRole() ?? 'member'];
    this.username.set(this.authService.getUsername() ?? 'dummyUser');
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.getSearch();
  }

  /**
   * This method for get search
   */
  getSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(800), // Wait for the user to stop typing for 800ms
        switchMap((query) => {
          if (query) {
            this.isLoading.set(true);
            return this.driverService.GetSearch(query);
          } else {
            // If the query is empty, return an empty array or fetch all
            if (this.isLoading()) {
              this.isLoading.set(false);
            }
            this.clearSearch();
            return [];
          }
        })
      )
      .subscribe((results: any) => {
        if (results) {
          this.isLoading.set(false);
          this.searchResults.set(results);
        }
      });
  }

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
    this.searchResults.set([]);
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
