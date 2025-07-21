import {TaskSummaryResponse } from "./task.model";


//--------------------REQUEST--------------------

export interface ProjectInputRequest {
  projectName: string;
  projectDesc: string;
  dueDate: Date;
  userId: string;
}

export interface ProjectEditRequest {
  projectName: string;
  projectDesc: string;
  dueDate: Date;
}

//--------------------RESPONSE--------------------

//Defines core project structure(for reusability in project creation and updation)
export interface ProjectStructure {     
  _id: string;
  projectName: string;
  projectDesc: string;
  dueDate: string;
  user?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

//Create Project
export interface ProjectInputResponse {
  msg: string;
  project: ProjectStructure;
}

//Get Project by user
export interface ProjectSummaryResponse {
  _id: string;
  projectName: string;
  projectDesc: string;
  dueDate: string;
  user: string;
  createdAt: string;
  updatedAt?: string;
  progress?:number;
  tasks?: TaskSummaryResponse[];
  __v: number;
}

//Get Project by id
export interface ProjectDetailResponse {
  _id: string;
  projectName: string;
  projectDesc: string;
  dueDate: string;
  user: {
    _id: string;
    uname: string;
    email: string;
  };
  createdAt: string;
  __v: number;
}

//Update Project
export interface ProjectEditResponse {
  msg: string;
  project: ProjectStructure
}

//Delete Project
export interface ProjectRemoveResponse {
  msg: string;
}
