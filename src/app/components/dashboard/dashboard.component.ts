import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { forkJoin, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

import { ProjectDialogComponent } from '../project-dialog/project-dialog.component';
import { DescriptionPopupComponent } from '../description-popup/description-popup.component';

import { ProjectService } from '../../services/projects/project.service';
import { TaskService } from '../../services/tasks/task.service';
import { AuthService } from '../../services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

import { HeaderComponent } from '../header/header.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

interface Task {
  _id: string;
  status: string;
  name?: string; 
}

interface Project {
  _id: string;
  projectName: string;
  projectDesc: string;
  dueDate: string;
  userId?: string;
  progress?: number;
  tasks: Task[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    LoadingSpinnerComponent,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
     MatProgressSpinnerModule
    
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {
  projects: Project[] = [];

  searchTerm: string = '';

  userId: string = '';
  username: string = '';
  email: string = '';

  isProfileMenuOpen: boolean = false;

  isExpanded: { [key: string]: boolean } = {};

  currentPage: number = 1;
  projectsPerPage: number = 3; 
  
  selectedStatus: 'all' | 'completed' | 'incomplete' = 'all';

  startDate: Date | null = null;
  endDate: Date | null = null;
  startDateString: string = '';
  endDateString: string = '';

  isSearchMode: boolean = false;
  isDateMode: boolean = false;
  filtersExpanded: boolean = false;
  dateValidationError: boolean = false;

  isMobileMenuOpen = false;
  mobileFiltersExpanded = false;

  isLoading = false;

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMobileFilters() {
    this.mobileFiltersExpanded = !this.mobileFiltersExpanded;
  }

  get paginatedProjects(): Project[] {
    const filtered = this.getFilteredProjects();
    const start = (this.currentPage - 1) * this.projectsPerPage;
    return filtered.slice(start, start + this.projectsPerPage);
  }

  // Helper getter for filtered projects in template
  get FilteredProjects(): () => Project[] {
    return () => this.getFilteredProjects();
  }

  get totalPages(): number {
    return Math.ceil(this.getFilteredProjects().length / this.projectsPerPage);
  }

  changePage(direction: 'prev' | 'next'): void {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();

    if (user?.id) {
      this.userId = user.id;
      this.username = user.name || 'User';
      this.email = user.email || '';
      this.fetchProjects();
    } 
    else {
      console.warn('No logged-in user.');
      this.router.navigate(['/']); 
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '400px',
      data: { allProjects: this.projects } 
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newProject = { ...result, userId: this.userId };
        this.projectService.createProject(newProject).subscribe({
          next: () => {
            this.fetchProjects();
            this.showToast('Project created successfully!', 'success');
          },
          error: (err) => {
            console.error('Error creating project:', err);
            this.showToast('Failed to create project. Please try again.', 'error');
          }
        });
      }
    });
  }

  fetchProjects(): void {
    this.projectService.getProjectsByUser(this.userId).subscribe({
      next: (projects) => {
        this.projects = projects.map(project => ({
          ...project,
          tasks: [] // Initialize tasks array
         
        }));

        // Fetch tasks for each project dynamically
        const taskRequests = this.projects.map(project =>
          this.taskService.getTasksByProject(project._id).pipe(
            tap((tasks: Task[]) => project.tasks = tasks) 
          )
        );

        // Wait for all task requests to complete before updating UI
        forkJoin(taskRequests).subscribe({
          next: () => {
            console.log('All tasks successfully fetched');
          },
          error: (err: HttpErrorResponse) => console.error('Error fetching tasks:', err) 
        });

         this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
         this.isLoading = false;
        console.error('Error fetching projects:', err);
      }
    });
  }

  calculateProgress(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) return 0;

    const completedTasks = project.tasks.filter((task: { status: string }) => task.status === 'done').length;
    const totalTasks = project.tasks.length;

    return totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  }

  updateProgress(): void {
    this.projects.forEach(project => {
      project.progress = this.calculateProgress(project);
    });
    this.cdRef.detectChanges();
  }

  editProject(project: Project): void {
  const dialogRef = this.dialog.open(ProjectDialogComponent, {
    width: '400px',
    data: { project: { ...project }, allProjects: this.projects } 
  });

  dialogRef.afterClosed().subscribe((result) => {
    console.log("Dialog closed with result:", result);

    // If result is undefined or null (cancel clicked)
    if (!result) {
      console.log("Dialog canceled, no update performed.");
      return;
    }

    // Check if values actually changed
    const hasChanges =
      project.projectName !== result.projectName ||
      project.projectDesc !== result.projectDesc ||
      project.dueDate !== result.dueDate;

    if (!hasChanges) {
      console.log("No changes detected, skipping update.");
      return;
    }

    this.projectService.updateProject(project._id, result).subscribe({
      next: () => {
        this.fetchProjects();
        this.showToast('Project updated successfully!', 'success');
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.showToast('Failed to update project. Please try again.', 'error');
      }
    });
  });
}


  confirmDelete(project: Project): void {
    const hasInProgressTasks = project.tasks.some((task: Task) => task.status === 'in-progress');
    // Show warning only if there are tasks in progress
    const message = hasInProgressTasks
      ? "⚠ Some tasks are in progress! Are you sure you want to delete the project?"
      : "Are you sure you want to delete this project?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.deleteProject(project._id).subscribe({
          next: () => {
            this.fetchProjects();
            this.showToast('Project deleted successfully!', 'success');
          },
          error: (err) => {
            console.error('Error deleting project:', err);
            this.showToast('Failed to delete project. Please try again.', 'error');
          }
        });
      }
    });
  }
  getDueDateClass(dueDateStr: string): string {
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    const diffInDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return 'due-overdue';
    else if (diffInDays <= 3) return 'due-soon';
    else return 'due-later';
  }

  onView(projectId: string, projectName: string, dueDate: string): void {
    this.router.navigate(['/projects', projectId], {
      queryParams: { name: projectName, due: dueDate }
    });
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleReadMore(projectId: string): void {
    this.isExpanded[projectId] = !this.isExpanded[projectId];
  }

  openDescriptionPopup(project: Project, event: Event): void {
    event.stopPropagation(); 
    const dialogRef = this.dialog.open(DescriptionPopupComponent, {
      width: '600px',
      data: {
        title: project.projectName,
        description: project.projectDesc
      },
      panelClass: 'description-popup-dialog' // Optional custom class
    });

    dialogRef.afterClosed().subscribe(() => {
      // Handle any post-close actions if needed
    });
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenu(event: Event): void {
    if (!(event.target as HTMLElement)?.closest('.profile-container')) {
      this.isProfileMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    // this.router.navigate(['/']); // Back to login
  }

  navigateToProfile(): void {
    this.isProfileMenuOpen = false; // Close the dropdown
    this.router.navigate(['/profile']);
  }

  getFilteredProjects(): Project[] {
    let filtered = this.projects;

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter((project) =>
        project.projectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.projectDesc.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((project) => {
        const progress = this.calculateProgress(project);
        if (this.selectedStatus === 'completed') {
          return progress === 100;
        } else if (this.selectedStatus === 'incomplete') {
          return progress < 100;
        }
        return true;
      });
    }

    // Filter by date range
    if (this.startDate || this.endDate) {
      filtered = filtered.filter((project) => {
        const projectDate = new Date(project.dueDate);
        // Normalize project date to start of day for comparison
        projectDate.setHours(0, 0, 0, 0);
        
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;
        
        // Normalize start and end dates to start/end of day for inclusive comparison
        if (start) {
          start.setHours(0, 0, 0, 0);
        }
        if (end) {
          end.setHours(23, 59, 59, 999);
        }

        if (start && end) {
          return projectDate >= start && projectDate <= end;
        } else if (start) {
          return projectDate >= start;
        } else if (end) {
          return projectDate <= end;
        }
        return true;
      });
    }

    return filtered;
  }

  // Filter methods
  setStatusFilter(status: 'all' | 'completed' | 'incomplete'): void {
    this.selectedStatus = status;
    this.currentPage = 1; // Reset to first page when filtering
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filtering
    // Convert date strings to Date objects if needed
    if (this.startDateString) {
      this.startDate = new Date(this.startDateString);
    }
    if (this.endDateString) {
      this.endDate = new Date(this.endDateString);
    }
  }

  clearFilters(): void {
    this.selectedStatus = 'all';
    this.startDate = null;
    this.endDate = null;
    this.startDateString = '';
    this.endDateString = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.isSearchMode = false;
    this.isDateMode = false;
    this.applyFilters();
  }
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  // Get project counts for status filters
  getProjectCounts(): { all: number; completed: number; incomplete: number } {
    if (!this.projects || !Array.isArray(this.projects)) {
      return { all: 0, completed: 0, incomplete: 0 };
    }
    
    const all = this.projects.length;
    const completed = this.projects.filter(project => this.calculateProgress(project) === 100).length;
    const incomplete = this.projects.filter(project => this.calculateProgress(project) < 100).length;
    
    return { all, completed, incomplete };
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

  toggleDateMode(): void {
    this.isDateMode = !this.isDateMode;
    if (!this.isDateMode) {
      this.startDateString = '';
      this.endDateString = '';
      this.startDate = null;
      this.endDate = null;
      this.applyFilters();
    }
  }

  closeDateMode(): void {
    this.isDateMode = false;
    this.startDate = null;
    this.endDate = null;
    this.startDateString = '';
    this.endDateString = '';
    this.applyFilters();
  }

  onStartDateChange(dateString: string): void {
    this.startDateString = dateString;
    this.validateDateRange();
    this.applyFilters();
  }

  onEndDateChange(dateString: string): void {
    this.endDateString = dateString;
    this.validateDateRange();
    this.applyFilters();
  }

  private validateDateRange(): void {
    this.dateValidationError = false;
    
    if (this.startDateString && this.endDateString) {
      const startDate = new Date(this.startDateString);
      const endDate = new Date(this.endDateString);
      
      if (endDate < startDate) {
        this.dateValidationError = true;
        // Clear the invalid end date
        this.endDateString = '';
        this.endDate = null;
      }
    }
  }
}