import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../model/task';
import { NgZone } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CreateTask } from '../../model/create-task';
import { UserService } from '../../services/user';
import { PageResponse } from '../../model/page-response.model';
import { ToastService } from '../../toast/toast';
import Chart from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { AdminUser } from '../../model/admin-user';
import { UserRoleDTO } from '../../model/user-role-dto';
import { ToastrService } from 'ngx-toastr';
import { ApiResponseDTO } from '../../model/api-response-dto';


@Component({
  selector: 'app-manage-roles',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manage-roles.html',
  styleUrl: './manage-roles.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ManageRoles {


  totalUsers: number = 0;
  users: UserRoleDTO[] = [];
  isBrowser: boolean = false;
  searchUser: string = '';
  loading: boolean = false;
  filteredUsers: UserRoleDTO[] = [];
  loadingUserId: number | null = null;
  selectedRole: string = '';

  constructor(private toastr: ToastrService, private toastService: ToastService, @Inject(PLATFORM_ID) private platformId: Object, private authService: Auth, private cd: ChangeDetectorRef, private router: Router, private zone: NgZone, private userService: UserService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.fetchAllUsers();
      this.cd.detectChanges();

      console.log("Check Method call on Manage Roles.");
    }
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  fetchAllUsers() {
    this.loading = true;

    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = this.formatUsers(data);
        this.filteredUsers = [...this.users];
        console.log("All users Manage : " + data);
        this.loading = false;

        this.cd.markForCheck();

      },
      error: (err) => {
        console.error("User Error: ", err);
        setTimeout(() => {
          this.loading = false;
          console.log("User Loading: " + this.loading);
        });
      }
    });
  }
  formatUsers(users: any[]): any[] {
    return users.map(user => ({
      ...user,
      rolesDisplay: this.formatRoles(user.roles)
    }));
  }
  formatRoles(roles: any[]): string {

    if (!roles || roles.length === 0) return '[]';
    const formatted = roles.map(role => {
      let name = role.name || role; // support string or object

      name = name.replace('ROLE_', '');     // remove prefix
      name = name.toLowerCase();            // lowercase
      name = name.charAt(0).toUpperCase() + name.slice(1); // capitalize

      return `${name} Role`;

    });

    return `${formatted.join(', ')}`;
  }


  searchUsers() {
    const search = this.searchUser.toLocaleLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLocaleLowerCase().includes(search) ||
      user.email.toLocaleLowerCase().includes(search)
    )

  }
  toggleRole(user: any, checked: boolean) {

    this.loadingUserId = user.id;
    const role = checked ? 'ROLE_ADMIN' : 'ROLE_USER';
    this.authService.updateUserRole(user.id, role).subscribe({
      next: (response: ApiResponseDTO) => {

        if (response.success) {
          setTimeout(() => {
            user.roles = [{ name: role }];
            this.cd.detectChanges();
            this.cd.markForCheck();
          });
          console.log("check ResponseApi :  ", response.success);

          this.toastr.success(response.message);
          this.toastService.show(response.message, "success");

        }
        this.loadingUserId = null;
      },

      error: (error) => {
        console.log("check ResponseApi :  ");
        this.loadingUserId = null;
        const message = error.error?.message || error?.message || "Role update failed!";
        this.toastService.show(message, "error");
        this.toastr.error("Role update failed");

      }
    });
  }

  isAdmin(user: UserRoleDTO): boolean {
    return user.roles?.some(role => role.name === 'ROLE_ADMIN');
  }


}
