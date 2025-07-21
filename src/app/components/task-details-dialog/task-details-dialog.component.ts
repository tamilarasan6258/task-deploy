import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TaskService } from '../../services/tasks/task.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TaskStructure } from '../../models/task.model';

@Component({
  selector: 'app-task-details-dialog',
  standalone: true,
  templateUrl: './task-details-dialog.component.html',
  styleUrl: './task-details-dialog.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule
  ]
})
export class TaskDetailsDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<TaskDetailsDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
  taskService = inject(TaskService);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  editable = false;
  duplicateNameError = false;

  minDate: Date = new Date();
  maxDate: Date | null = null;
  taskForm!: FormGroup;
  originalTask!: TaskStructure;
  existingTaskNames: string[] = [];

  ngOnInit(): void {
    const task = this.data.task;
    this.originalTask = { ...task };

    const rawDueDate = task.project?.dueDate || this.data.projectDueDate;
    this.maxDate = rawDueDate ? new Date(rawDueDate) : null;

    this.taskForm = this.fb.group({
      taskName: [
        { value: task.taskName, disabled: true },
        [Validators.required, this.taskNamePatternValidator()]
      ],
      taskDesc: [{ value: task.taskDesc, disabled: true }, Validators.required],
      dueDate: [{ value: new Date(task.dueDate), disabled: true }, Validators.required],
      priority: [{ value: task.priority, disabled: true }, Validators.required],
      status: [{ value: task.status, disabled: true }, Validators.required],
    });

    const projectId = task.project?._id || task.project;
    this.taskService.getTasksByProject(projectId).subscribe(tasks => {
      this.existingTaskNames = tasks
        .filter(t => t._id !== task._id)
        .map(t => t.taskName.trim().toLowerCase());
    });
  }

  taskNamePatternValidator(): Validators {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null;

      const onlyLetters = /^[A-Za-z]+$/;
      const lettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
      const lettersNumbersSymbols = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).+$/;
      const onlySymbols = /^[^A-Za-z\d\s]+$/;
      const onlyNumbers = /^\d+$/;

      if (onlyLetters.test(value)) return null;
      if (lettersAndNumbers.test(value)) return null;
      if (lettersNumbersSymbols.test(value)) return null;
      if (onlySymbols.test(value)) return { invalidPattern: true };
      if (onlyNumbers.test(value)) return { invalidPattern: true };

      return null;
    };
  }

  enableEdit(): void {
    this.editable = true;
    Object.keys(this.taskForm.controls).forEach(field => {
      this.taskForm.get(field)?.enable();
    });
  }

  hasChanges(): boolean {
    const currentValues = { ...this.taskForm.getRawValue() };
    const original = {
      taskName: this.originalTask.taskName,
      taskDesc: this.originalTask.taskDesc,
      dueDate: new Date(this.originalTask.dueDate).toISOString(),
      priority: this.originalTask.priority,
      status: this.originalTask.status
    };

    return JSON.stringify({
      ...currentValues,
      dueDate: new Date(currentValues.dueDate).toISOString()
    }) !== JSON.stringify(original);
  }

  updateTask(): void {
    const formValue = this.taskForm.getRawValue();
    const taskName = formValue.taskName.trim().toLowerCase();

    if (this.existingTaskNames.includes(taskName)) {
      this.duplicateNameError = true;
      return;
    }

    const updatedTask = {
      ...this.originalTask,
      ...formValue
    };

    this.taskService.updateTask(this.originalTask._id, updatedTask).subscribe({
      next: res => this.dialogRef.close({ updated: true, task: res }),
      error: err => console.error('Update failed:', err)
    });
  }

  deleteTask(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this task?' }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskService.deleteTask(this.originalTask._id).subscribe({
          next: () => this.dialogRef.close({ deleted: true }),
          error: err => console.error('Delete failed:', err)
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  dateFilter = (date: Date | null): boolean => {
    return !date ? false : date >= this.minDate && (!this.maxDate || date <= this.maxDate);
  };

  getStatusIcon(status: string): string {
    switch (status) {
      case 'backlog':
        return 'inventory_2';
      case 'to-do':
        return 'list';
      case 'in-progress':
        return 'play_circle';
      case 'done':
        return 'check_circle';
      default:
        return 'task';
    }
  }
}
