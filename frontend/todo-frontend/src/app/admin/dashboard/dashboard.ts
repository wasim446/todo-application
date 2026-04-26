import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';

import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../model/task';
import { NgZone } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CreateTask } from '../../model/create-task';
import { error } from 'console';
import { UserService } from '../../services/user';
import { PageResponse } from '../../model/page-response.model';
import Chart from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { TaskService, AllTask } from '../../core/services/alltask';
import { AdminUser } from '../../model/admin-user';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class AdminDashboard  implements OnInit {


  isSidebarCollapsed = false;
  users: AdminUser[] = [];
  loading = false;
  isAdmin: boolean = false;
  isBrowser: boolean = false;

  tasks: AllTask[] = [];
  isTasksLoading = false;



  constructor(private taskService: TaskService, @Inject(PLATFORM_ID) private platformId: Object, private authService: Auth, private cd: ChangeDetectorRef, private router: Router, private zone: NgZone, private userService: UserService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getLoggedInUser() {
    return localStorage.getItem('username') || '';
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.fetchAllUsers();
      this.fetchAllTasks();

      console.log("Check Method call. ");
    }
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {

    }
  }

  isAdminss(user: AdminUser): boolean {
    return user.roles?.some(role => role.name === 'ROLE_ADMIN');
  }

  fetchAllUsers() {
    this.loading = true;

    this.authService.getAllUsers().subscribe({
      next: (data) => {

        this.users = this.formatUsers(data);
        console.log("All users: " + data);
        this.loading = false;
        console.log("User Loading: " + this.loading, this.users.length);
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

  fetchAllTasks(): void {
    this.isTasksLoading = true;

    this.taskService.getAllTasks().subscribe({
      next: (data) => {

        this.tasks = data;
        this.isTasksLoading = false;
        console.log("All Tasks:  ", data);
        console.log(typeof data);
        console.log(Array.isArray(data));
        console.log("Loading: Task " + this.isTasksLoading);
        this.cd.markForCheck();
        setTimeout(() => {
          console.log("Final TasksLoading value:", this.isTasksLoading);
          console.log("Task length:", this.tasks.length);
        }, 2000);

      },
      error: (err) => {
        console.error('Error fetching tasks:', err);

        this.isTasksLoading = false;
        console.log("Loading: Task " + this.isTasksLoading);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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


  get totalUsers(): number {
    return this.users?.length || 0;
  }

  get totalToDos(): number {
    return this.tasks?.length || 0;
  }

  get totalAdmins(): number {
    return this.users?.filter(user =>
      user.roles?.some(role => role.name === 'ROLE_ADMIN')
    ).length || 0;
  }
  logout() {
    this.authService.logout();
    // this.router.navigate(['/login'], { replaceUrl: true });
  }

}
