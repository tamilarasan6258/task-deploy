//------------------ ENUM-LIKE TYPES ------------------

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'to-do' | 'in-progress' | 'done' | 'backlog';

//--------------------REQUEST--------------------

export interface TaskCreateRequest {
  taskName: string;
  taskDesc: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  project: string;
}

export interface TaskEditRequest {
  taskName?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

//--------------------RESPONSE--------------------

//Defines core task structure(for reusability in task creation and updation)
export interface TaskStructure {
  _id: string;
  taskName: string;
  taskDesc: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  project: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  __v: number;
}

//Get task by project id
export interface TaskSummaryResponse {
  _id: string;
  taskName: string;
  taskDesc: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  project: null | string | {
    _id: string;
    projectName: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  __v: number;
}

//Add/Create Task
export interface TaskInputResponse {
  msg: string;
  task: TaskStructure;
}

//Update/Edit Task
export interface TaskEditResponse {
  msg: string;
  task: TaskStructure;
}

//Delete task
export interface TaskDeleteResponse {
  msg: string;
}

//Get project by id(to display project name in kanban board page)
export interface ProjectDetail {
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
  updatedAt: string;
  __v: number;
}