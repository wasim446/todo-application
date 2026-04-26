import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './system-logs.html',
  styleUrl: './system-logs.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class SystemLogs implements OnInit {

  allLogs: any[] = [];
  filteredLogs: any[] = [];
  isBrowser: boolean = false;
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  searchLog: string = '';
  // Filters
  fromDate: string = '';
  toDate: string = '';
  module: string = '';
  status: string = '';

  loading: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private authService: Auth, private cd: ChangeDetectorRef, private router: Router, private zone: NgZone, private userService: UserService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLogs();
      this.cd.detectChanges();
    }

  }

  // 🔹 Load logs from backend
  loadLogs(): void {
    this.loading = true;

    this.authService.getLogs(
      this.page,
      this.size,
      this.fromDate,
      this.toDate,
      this.module,
      this.status
    ).subscribe({
      next: (res: any) => {
        this.allLogs = res.content;
        this.filteredLogs = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.cd.detectChanges();
        this.cd.markForCheck();

      },
      error: (error) => {
        console.error('Error loading logs', error);
        this.loading = false;
      }
    });
  }
  searchLogs() {
    const search = this.searchLog.toLocaleLowerCase().trim();
    if (!search) {
      this.filteredLogs = this.allLogs;
      return;
    }

    this.filteredLogs = this.allLogs.filter(user =>
      user.performedBy.toLocaleLowerCase().includes(search) ||
      user.action.toLocaleLowerCase().includes(search) ||
      user.module.toLocaleLowerCase().includes(search) ||
      user.status.toLocaleLowerCase().includes(search) ||
      user.message.toLocaleLowerCase().includes(search)
    )

  }

  // Pagination
  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadLogs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadLogs();
    }
  }


  // Apply filters
  applyFilters(): void {
    this.page = 0;
    this.loadLogs();
  }

  // Reset filters
  resetFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.module = '';
    this.status = '';
    this.page = 0;
    this.loadLogs();
  }

}
