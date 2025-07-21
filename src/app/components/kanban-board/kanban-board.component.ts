import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
 
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
 
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
 
import { HeaderComponent } from '../header/header.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';
 
import { TaskService } from '../../services/tasks/task.service';
import { AuthService } from '../../services/auth/auth.service';
import { TaskStructure, TaskStatus } from '../../models/task.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
 
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    DragDropModule,
    TaskCardComponent,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
 
export class KanbanBoardComponent implements OnInit {
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
 
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
 
  projectId!: string;
  projectName: string = '';
 
  selectedDueDate: Date | null = null;
 
  username: string = '';
  email: string = '';
 
  statuses : TaskStatus[]= ['backlog', 'to-do', 'in-progress', 'done'];
  dropListIds = this.statuses;
 
  tasks: { [key in TaskStatus]: TaskStructure[] } = {
    'backlog': [],
    'to-do': [],
    'in-progress': [],
    'done': []
  };
 
  allTasks: TaskStructure[] = [];
 
  selectedPriority: string = '';
 
  startDate: Date | null = null;
  endDate: Date | null = null;
 
  isProfileMenuOpen = false;
  filtersExpanded = true;
  dateValidationError: boolean = false;
 
  searchTerm: string = '';

  isLoading = false; // Loading state for spinner
 
  // Add below your existing properties
  pageSize = 4; // Number of tasks per page
 
  currentPage: { [key in TaskStatus]: number } = {
    'backlog': 0,
    'to-do': 0,
    'in-progress': 0,
    'done': 0
  };
 
  paginatedTasks: { [key in TaskStatus]: TaskStructure[] } = {
    'backlog': [],
    'to-do': [],
    'in-progress': [],
    'done': []
  };
 
  ngOnInit() {
    this.isLoading = true;
  // Get project ID from route param
  this.route.paramMap.subscribe(params => {
    this.projectId = params.get('id')!;
    this.loadTasks();
  });
 
  // Get project name and due date from query params
  this.route.queryParamMap.subscribe(queryParams => {
    this.projectName = queryParams.get('name') || 'Project'; // Default fallback
    const dueDateStr = queryParams.get('due');
    this.selectedDueDate = dueDateStr ? new Date(dueDateStr) : null;
  });
 
}
 
 
  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
 
  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.profile-container')) {
      this.isProfileMenuOpen = false;
    }
  }
 
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
 
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }
 
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`toast-${type}`]
    };
 
    this.snackBar.open(message, 'Close', config);
  }
 
loadTasks() {
  this.taskService.getTasksByProject(this.projectId).subscribe((res) => {
    console.log('Loaded tasks:', res);
 
    const normalizedTasks: TaskStructure[] = res.map(task => ({
      ...task,
      project: typeof task.project === 'string'
        ? task.project
        : task.project?._id || '' // fallback if project is null
    }));
 
    this.allTasks = normalizedTasks;
    this.applyFilters(); // apply filters on latest fetch
  });
  
}
 
 
  // Method to paginate tasks
  paginateTasks() {
    this.statuses.forEach(status => {
      const start = this.currentPage[status] * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedTasks[status] = this.tasks[status].slice(start, end);
    });
  }
 
  // Update your applyFilters method to call paginateTasks
  applyFilters() {
    // Don't apply filters if there's a date validation error
    if (this.dateValidationError) {
      return;
    }
 
    const start = this.startDate ? new Date(this.startDate).setHours(0, 0, 0, 0) : null;
    const end = this.endDate ? new Date(this.endDate).setHours(23, 59, 59, 999) : null;
 
    const filtered = this.allTasks.filter(task => {
      const due = new Date(task.dueDate).getTime();
      const matchesPriority = !this.selectedPriority || task.priority === this.selectedPriority;
      const matchesStart = !start || due >= start;
      const matchesEnd = !end || due <= end;
      const matchesSearch = !this.searchTerm || task.taskName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesPriority && matchesStart && matchesEnd && matchesSearch;
    });
 
    this.statuses.forEach(status => {
      this.tasks[status] = filtered.filter(task => task.status === status);
      this.currentPage[status] = 0; // Reset to first page on filter
    });
 
    this.paginateTasks(); // Apply pagination after filtering
    this.isLoading = false; // Set loading to false after tasks are loaded
  }
 
 
  getTotalPages(taskCount: number): number {
    const totalPages = Math.ceil(taskCount / this.pageSize);
    return totalPages > 0 ? totalPages : 1; // Always show at least 1 page
  }
 
  // Navigation methods
  prevPage(status: TaskStatus) {
    if (this.currentPage[status] > 0) {
      this.currentPage[status]--;
      this.paginateTasks();
    }
  }
 
  nextPage(status: TaskStatus) {
    const totalPages = Math.ceil(this.tasks[status].length / this.pageSize);
    if (this.currentPage[status] < totalPages - 1) {
      this.currentPage[status]++;
      this.paginateTasks();
    }
  }
 
  clearFilters() {
    this.selectedPriority = '';
    this.startDate = null;
    this.endDate = null;
    this.searchTerm = '';
    this.applyFilters();
  }
 
  onDrop(event: CdkDragDrop<TaskStructure[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.isLoading = true;
      const task = event.previousContainer.data[event.previousIndex];
      const oldStatus = task.status;
 
      task.status = newStatus;
 
      this.taskService.updateTask(task._id, task).subscribe({
        next: updatedTask => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.loadTasks();
        },
        error: err => {
          this.isLoading = false; // Set loading to false after tasks are loaded
          console.error('Task status update failed:', err);
          task.status = oldStatus;
        }
      });
    }
  }
 
  openAddTaskDialog(status: string) {
    const existingTaskNames = this.allTasks.map(task => task.taskName.toLowerCase());
    console.log(this.selectedDueDate, "dsd");
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      data: {
        status,
        projectId: this.projectId,
        projectDueDate: this.selectedDueDate,
        existingTaskNames
      }
    });
 
    dialogRef.afterClosed().subscribe(taskData => {
      if (taskData) {
        const formattedData = {
          ...taskData,
          project: taskData.projectId
        };
        delete formattedData.projectId;
 
        this.taskService.createTask(formattedData).subscribe({
          next: () => {
            this.loadTasks();
            this.showToast('Task created successfully!', 'success');
          },
          error: err => {
            console.error('Failed to create task', err);
            this.showToast('Failed to create task. Please try again.', 'error');
          }
        });
      }
    });
  }
 
  openTaskDetails(task: TaskStructure) {
    const dialogRef = this.dialog.open(TaskDetailsDialogComponent, {
      data: {
        task,
        projectDueDate: this.selectedDueDate
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.loadTasks();
        this.showToast('Task updated successfully!', 'success');
      } else if (result?.deleted) {
        this.loadTasks();
        this.showToast('Task deleted successfully!', 'success');
      }
    });
  }

goToChartSummary(selectedChart: string) {
  let targetRoute = '';
  if (selectedChart === 'echarts') {
    targetRoute = '/echarts-summary';
  } else if (selectedChart === 'chartjs') {
    targetRoute = '/chartjs-summary';
  } else if (selectedChart === 'highcharts') {
    targetRoute = '/highcharts-summary';
  }

  if (targetRoute) {
    this.router.navigate([`${targetRoute}/${this.projectId}`], {
      queryParams: {
        projectId:this.projectId,
        projectName: this.projectName,
        due: this.selectedDueDate
      }
    });
  }
}


 
  get isTaskListEmpty(): boolean {
    return this.allTasks.length === 0;
  }
 
  navigateToProfile(): void {
    this.isProfileMenuOpen = false; // Close the dropdown
    this.router.navigate(['/profile']);
  }
 
  onStartDateChange(date: Date): void {
    this.startDate = date;
    this.validateDateRange();
    this.applyFilters();
  }
 
  onEndDateChange(date: Date): void {
    this.endDate = date;
    this.validateDateRange();
    this.applyFilters();
  }
 
  private validateDateRange(): void {
    this.dateValidationError = false;
   
    if (this.startDate && this.endDate) {
      const startDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);
     
      if (endDate < startDate) {
        this.dateValidationError = true;
        // Clear the invalid end date
        this.endDate = null;
      }
    }
  }
}