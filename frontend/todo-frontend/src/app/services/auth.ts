import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../model/task';
import { CreateTask } from '../model/create-task';
import { Profiles } from '../model/profiles';
import { UploadPhotoResponse } from '../model/upload-photo-response';
import { PageResponse } from '../model/page-response.model';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UserService } from './user';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { ApiResponseDTO } from '../model/api-response-dto';




@Injectable({
  providedIn: 'root',
})
export class Auth {

  private baseUrl = 'http://localhost:8080/api/auth';

  private taskUrl = 'http://localhost:8080/api/todos';

  private profileUrl = 'http://localhost:8080/api/todos/profile';

  private adminApiUrl = 'http://localhost:8080/api/admin';


  photoUrl?: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService, private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }


  createTask(data: any) {
    return this.http.post(`${this.taskUrl}/createTask`, data);
  }
  getToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  }

  // getTasks() {
  //   // const token = localStorage.getItem('token');
  //   return this.http.get<Task[]>(`${this.taskUrl}/getTasks`, {
  //     headers: {
  //       Authorization: `Bearer ${this.getToken()}`
  //     }
  //   });
  // }

  getTasks(
    page: number,
    size: number,
    sortBy: string,
    direction: string
  ): Observable<PageResponse<Task>> {

    return this.http.get<PageResponse<Task>>(
      `${this.taskUrl}/getTasks?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
  }

  getTaskCounts(): Observable<any> {
    return this.http.get(`${this.taskUrl}/taskCounts`);
  }

  updateTask(id: number, data: CreateTask) {
    return this.http.put<Task>(`${this.taskUrl}/${id}`, data);
  }
  deleteTask(id: number) {
    return this.http.delete<any>(`${this.taskUrl}/${id}`);
  }



  // ================= GET PROFILE ================= first time


  getProfile(): Observable<Profiles> {
    return this.http.get<Profiles>(this.profileUrl);
  }

  // ================= UPDATE PROFILE =================
  updateProfile(profile: Profiles): Observable<Profiles> {
    return this.http.put<Profiles>(`${this.profileUrl}/updateProfile`, profile);
  }

  // ================= UPLOAD PHOTO =================
  uploadPhoto(file: File): Observable<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadPhotoResponse>(`${this.profileUrl}/uploadPhoto`, formData);
  }

  // ================= GET PHOTO URL =================
  getPhotoUrl(photoId: string): string {
    return `${this.photoUrl}/${photoId}`;
  }
  getPhoto() {
    return this.http.get(
      'http://localhost:8080/api/todos/profile/photo',
      { responseType: 'blob' }
    );
  }

  generateReport() {
    return this.http.get(
      'http://localhost:8080/api/tasks/report',
      { responseType: 'blob' }
    );
  }


  getRole(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const user = localStorage.getItem('user');
    if (!user) return null;

    const parsed = JSON.parse(user);
    return parsed.roles?.[0] || null;
  }

  getCurrentUserId(): number | null {

    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  }



  // getRecentUsers() {
  //   return this.http.get<any[]>(`${this.adminApiUrl}/recentUsers`);
  // }

  getAllUsers() {
    return this.http.get<any[]>(`${this.adminApiUrl}/users`);
  }


  deleteUser(userId: number) {
    return this.http.delete(`${this.adminApiUrl}/users/${userId}`, {
      responseType: 'text'
    });
  }

  updateUserRole(id: number, role: string) {
    return this.http.put<ApiResponseDTO>(`${this.adminApiUrl}/users/${id}/role`, { role });
  }

  // ...............................System Logs ....................................


  getLogs(
    page: number,
    size: number,
    fromDate?: string,
    toDate?: string,
    module?: string,
    status?: string
  ) {

    let params: any = {
      page: page,
      size: size
    };

    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (module) params.module = module;
    if (status) params.status = status;

    return this.http.get(`${this.adminApiUrl}/logs`, { params });
  }


  logout(): void {

    this.userService.setPhoto(null);  // CLEAR IMAGE
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigateByUrl('/login', {
      replaceUrl: true
    });

  }

}
