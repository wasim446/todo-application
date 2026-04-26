import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../services/auth';
import { NgIf } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../model/task';
import { NgZone } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CreateTask } from '../model/create-task';
import { error } from 'console';
import { UserService } from '../services/user';
import { PageResponse } from '../model/page-response.model';
import { ToastService } from '../toast/toast';
import Chart from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Dashboard implements OnInit, AfterViewInit {

  @ViewChild('statusChartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;
  statusChart: any;

  newTask: CreateTask = {
    title: '',
    description: '',
    completed: false,
    createdBy: ''
  };
  completedCount = 0;
  pendingCount = 0;
  profilePhoto: string | null = null;
  selectedSort: string = 'latest';
  selectedTask: any = null;
  tasks: Task[] = [];
  // filteredTasks: Task[] = [];
  searchText: string = '';
  isEditMode: boolean = false;
  // filter: string = 'all';

  task: CreateTask = this.createEmptyTask();
  selectedTaskId: number | null = null;
  searchTerm: string = '';
  filter: 'all' | 'completed' | 'pending' = 'all';

  currentPage: number = 1;
  pageSize = 8;
  totalPages = 0;
  totalElements = 0;

  sortBy = 'createdDate';
  direction = 'desc';
  isAdmin: boolean = false;

  constructor(private toastService: ToastService, @Inject(PLATFORM_ID) private platformId: Object, private authService: Auth, private cd: ChangeDetectorRef, private router: Router, private zone: NgZone, private userService: UserService) {
  }

  getLoggedInUser() {
    return localStorage.getItem('username') || '';
  }
  ngOnInit() {
    console.log("ngOnInit called");
    if (!this.profilePhoto) {
      this.loadPhoto();
      this.cd.detectChanges();
    }

    this.userService.getPhoto().subscribe(photo => {
      this.profilePhoto = photo;
    });
    // debugger;


    if (isPlatformBrowser(this.platformId)) {
      const role = this.authService.getRole();
      this.isAdmin = !!role?.includes('ADMIN');
      console.log("Roles: ", role);
    }
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCounts();
      this.fetchTasks();
      this.cd.detectChanges();
    }
  }

  renderChart() {

    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.chartRef) return;

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    this.statusChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [this.completedCount, this.pendingCount],
          backgroundColor: ['#28a745', '#ffc107']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const total = this.completedCount + this.pendingCount;
                const value = context.raw;
                const percent = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }


  loadCounts() {
    console.log("Counts API Called");

    //   if (!isPlatformBrowser(this.platformId)) {
    //   return; // Only skip SSR
    // }

    this.authService.getTaskCounts().subscribe(counts => {
      this.completedCount = counts.completed;
      this.pendingCount = counts.pending;
      this.totalElements = counts.total;
      this.cd.detectChanges();
      // console.log("After assign: RRRRRRRRRRRRR", this.completedCount, this.pendingCount);
      this.renderChart();
    });
  }

  getCompletionPercentage(): number {
    const total = this.completedCount + this.pendingCount;
    if (total === 0) return 0;
    return Math.round((this.completedCount / total) * 100);
  }
  fetchTasks() {
    // if (!isPlatformBrowser(this.platformId)) {
    //   return;
    // }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log("Token in dashboard:", token);
      const backendPage = this.currentPage > 0 ? this.currentPage - 1 : 0;
      this.authService.getTasks(backendPage, this.pageSize, this.sortBy, this.direction).subscribe((response: PageResponse<Task>) => {
        // this.tasks = [...data];
        this.tasks = [...response.content];
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.cd.detectChanges();
        console.log("Data from backend:", response.content);
        console.log("Tasks array after assign:", this.tasks);
        console.log("Token in dashboard:", token);
      });
    }

  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.fetchTasks();
  }

  loadPhoto() {
    this.authService.getPhoto().subscribe({
      next: (blob) => {

        if (!blob || blob.size === 0) {
          this.profilePhoto = 'assets/default-user.png';
          return;
        }
        const url = URL.createObjectURL(blob);
        this.profilePhoto = url;
        this.userService.setPhoto(url);   // store globally
        this.cd.detectChanges();
        //  console.log("Image Loaded: ", this.previewUrl);
      },
      error: () => {
        this.profilePhoto = null;
        // 'assets/default-user.png';
        console.log("Image didn't load.");
      }
    });
  }


  saveTask() {
    this.task.createdBy = this.getLoggedInUser();
    if (this.isEditMode && this.selectedTaskId !== null) {
      // UPDATE
      this.authService.updateTask(this.selectedTaskId, this.task)
        .subscribe(() => {
          // this.tasks = this.tasks.map(t =>
          //   t.id === this.selectedTaskId ? updatedTask : t
          // );

          this.fetchTasks();
          this.loadCounts();
          this.toastService.show("Task updated successfully!", "success");
          this.resetForm();
          this.closeModal();
          this.cd.detectChanges();
        });

    } else {
      this.authService.createTask(this.task).subscribe({
        next: (response: any) => {
          this.fetchTasks();
          this.loadCounts();
          this.toastService.show("Task added successfully!", "success");
          this.resetForm();
          this.closeModal();
          this.cd.detectChanges();
        },
        error: (err: any) => {
          console.log(err);
          const errorMsg = err.error?.message || "Failed to add task. Please try again.";
          this.toastService.show(errorMsg, "error");
        }
      });
    }
  }

  downloadReport() {
    this.authService.generateReport().subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'task-report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }


  openTask(task: any) {
    this.selectedTask = task;

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('viewTaskModal')
    );
    modal.show();
  }

  get filteredTasks(): Task[] {
    let result = this.tasks;
    if (this.filter === 'completed') {
      result = result.filter(t => t.completed);
    }
    if (this.filter === 'pending') {
      result = result.filter(t => !t.completed);
    }
    const value = this.searchTerm.toLowerCase().trim();
    if (value) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(value)
      );
    }

    return result;
  }
  private createEmptyTask(): CreateTask {
    return {
      title: '',
      description: '',
      completed: false,
      createdBy: ''
    };
  }

  onSortChange() {
    if (this.selectedSort === 'latest') {
      this.sortBy = 'createdDate';
      this.direction = 'desc';
    }

    if (this.selectedSort === 'oldest') {
      this.sortBy = 'createdDate';
      this.direction = 'asc';
    }

    if (this.selectedSort === 'titleAsc') {
      this.sortBy = 'title';
      this.direction = 'asc';
    }

    if (this.selectedSort === 'titleDesc') {
      this.sortBy = 'title';
      this.direction = 'desc';
    }

    if (this.selectedSort === 'completed') {
      this.sortBy = 'completed';
      this.direction = 'desc';
    }

    if (this.selectedSort === 'pending') {
      this.sortBy = 'completed';
      this.direction = 'asc';    // false first
    }


    this.currentPage = 0; // reset to first page
    this.fetchTasks();
  }


  resetForm() {
    this.task = this.createEmptyTask();
    this.selectedTaskId = null;
    this.isEditMode = false;
  }
  openNewTask() {
    this.isEditMode = false;
    this.task = this.createEmptyTask();
  }
  openModal() {
    const modalElement = document.getElementById('taskModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  closeModal() {
    const modal = document.getElementById('taskModal');
    const modalInstance = (window as any).bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }

  }

  toggleComplete(index: number) {
    this.tasks[index].completed = !this.tasks[index].completed;
  }

  toggleStatus(task: any) {
    task.completed = !task.completed;

    this.authService.updateTask(task.id, task)
      .subscribe((updatedTask: Task) => {
        // Update local array immutably
        this.tasks = this.tasks.map((t: Task) =>
          t.id === updatedTask.id ? updatedTask : t

        );
        this.loadCounts();
        this.cd.detectChanges();
        this.closeModal();
        this.isEditMode = false;

      });
  }
  editTask(task: Task) {
    // this.task = { ...task };   // clone
    this.isEditMode = true;
    this.selectedTaskId = task.id!;   // store id
    this.task = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdBy: this.getLoggedInUser()
    };

    this.openModal();
  }

  deleteTask(id: number) {
    this.authService.deleteTask(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log(response.success);
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.fetchTasks();
          this.loadCounts();
          this.cd.markForCheck();
        }
      },
      error: (error) => {
        console.error("Delete error:", error);
      }
    });

  }

  trackById(index: number, task: Task) {
    return task.id;
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    // this.router.navigate(['/login'], { replaceUrl: true });
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

}
