import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AllTask {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdBy: string;
  createdDate: string;
}



@Injectable({
  providedIn: 'root',
})
export class TaskService {
  
  private apiUrl = 'http://localhost:8080/api/admin/tasks'; // change if needed

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<AllTask[]> {
    return this.http.get<AllTask[]>(this.apiUrl);
  }



}
