import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProjectInputRequest, ProjectEditRequest,
  ProjectInputResponse, ProjectSummaryResponse, ProjectDetailResponse, ProjectEditResponse, ProjectRemoveResponse
} from '../../models/project.model';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  private baseUrl = environment.project_apiBaseUrl;

  constructor(private http: HttpClient) { }

  createProject(data: ProjectInputRequest): Observable<ProjectInputResponse> 
  {
    return this.http.post<ProjectInputResponse>(`${this.baseUrl}`, data);
  }

  getProjectsByUser(userId: string): Observable<ProjectSummaryResponse[]> 
  {
    return this.http.get<ProjectSummaryResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  getProjectById(projectId: string): Observable<ProjectDetailResponse> 
  {
    return this.http.get<ProjectDetailResponse>(`${this.baseUrl}/${projectId}`);
  }

  updateProject(projectId: string, data: ProjectEditRequest): Observable<ProjectEditResponse> 
  {
    return this.http.put<ProjectEditResponse>(`${this.baseUrl}/${projectId}`, data);
  }

  deleteProject(projectId: string): Observable<ProjectRemoveResponse> 
  {
    return this.http.delete<ProjectRemoveResponse>(`${this.baseUrl}/${projectId}`);
  }
}
