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
import { error } from 'console';
import { UserService } from '../../services/user';
import { PageResponse } from '../../model/page-response.model';
import { ToastService } from '../../toast/toast';
import Chart from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { AdminUser } from '../../model/admin-user';
import { window } from 'rxjs';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ManageUsers {

  searchText: string = '';

  totalUsers: number = 0;
  users: AdminUser[] = [];
  isBrowser: boolean = false;
  loading: boolean = false;
  searchUser: string = '';
  filteredUsers: AdminUser[] = [];
  currentUserId!: number | null;

  constructor(private toastService: ToastService, @Inject(PLATFORM_ID) private platformId: Object, private authService: Auth, private cd: ChangeDetectorRef, private router: Router, private zone: NgZone, private userService: UserService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.fetchAllUsers();
      this.currentUserId = this.authService.getCurrentUserId();
      console.log("Check Method call on ManageUsers. ");
    }
  }

  fetchAllUsers() {
    this.loading = true;

    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = this.formatUsers(data);
        this.filteredUsers = [...this.users];
        console.log("All users Manage : " + JSON.stringify(data));
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
  isAdminss(user: AdminUser): boolean {
    return user.roles?.some(role => role.name === 'ROLE_ADMIN');
  }


  searchUsers() {
    const search = this.searchUser.toLocaleLowerCase().trim();

    this.filteredUsers = this.users.filter(user =>
      user.username.toLocaleLowerCase().includes(search) ||
      user.email.toLocaleLowerCase().includes(search)
    )

  }


  confirmDelete() {

    if (this.selectedUserId !== null) {
      this.deleteUser(this.selectedUserId);

    }

    // call your delete API here


  }

  deleteUser(userId: number) {

    // if (!confirm("Are you sure you want to delete this user?")) {
    //   return;
    // }

    if (userId === this.currentUserId) {
      this.toastService.show("You cannot delete your own account", "error");
      this.showDeleteDialog = false;
      return;
    }

    this.authService.deleteUser(userId).subscribe({
      next: () => {
        this.toastService.show("User deleted successfully!", "success");
        this.users = this.users.filter(u => u.id !== userId);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== userId);
        this.showDeleteDialog = false;
      },

      error: (error) => {
        console.log("check Delete Log:  ");
        console.log("check Delete Log:  ", error.error.status);
        if (error.error.status === 404) {
          this.toastService.show(error.error.message, "error");
        } else {
          const message = error.error?.message || error?.message || "Failed to delete user!";
          this.toastService.show(message, "error");
          this.showDeleteDialog = false;
        }
      }

    });

  }

  showDeleteDialog: boolean = false;
  selectedUserId: number | null = null;

  openDeleteDialog(userId: number) {
    this.selectedUserId = userId;
    this.showDeleteDialog = true;
  }

  closeDialog() {
    this.showDeleteDialog = false;
  }



}
