import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskCreateRequest, TaskEditRequest, 
  TaskSummaryResponse, TaskInputResponse, TaskEditResponse, TaskDeleteResponse, ProjectDetail
} from '../../models/task.model';

@Injectable({ providedIn: 'root' })

export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = environment.task_apiBaseUrl;
  private projectUrl = environment.project_apiBaseUrl;

  getTasksByProject(projectId: string): Observable<TaskSummaryResponse[]> 
  {
    return this.http.get<TaskSummaryResponse[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  createTask(taskData: TaskCreateRequest): Observable<TaskInputResponse> 
  {
    return this.http.post<TaskInputResponse>(this.baseUrl, taskData);
  }

  updateTask(id: string, data: TaskEditRequest): Observable<TaskEditResponse> 
  {
    return this.http.put<TaskEditResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteTask(id: string): Observable<TaskDeleteResponse> 
  {
    return this.http.delete<TaskDeleteResponse>(`${this.baseUrl}/${id}`);
  }

  getProjectById(projectId: string): Observable<ProjectDetail> 
  {
    return this.http.get<ProjectDetail>(`${this.projectUrl}/${projectId}`);
  }
}
