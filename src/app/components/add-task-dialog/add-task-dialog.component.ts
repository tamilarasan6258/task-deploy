import { Component, inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatInputModule, MatDialogModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule
  ],
  templateUrl: './add-task-dialog.component.html',
  styleUrl: './add-task-dialog.component.css'
})

export class AddTaskDialogComponent {
  dialogRef = inject(MatDialogRef<AddTaskDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as {
    status: string,
    projectId: string,
    existingTaskNames: string[],
    projectDueDate: string
  };

  minDate: Date = new Date();
  maxDate: Date = new Date(this.data.projectDueDate);

  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      taskName: ['', [Validators.required, this.taskNamePatternValidator.bind(this)]],
      taskDesc: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required]
    });
  }

  dateFilter = (date: Date | null): boolean => {
    return !!date && date >= this.minDate && date <= this.maxDate;
  };

  taskNamePatternValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').trim();

    if (!value) return null;

    const onlyLetters = /^[A-Za-z]+$/;
    const hasLetters = /[A-Za-z]/;
    const hasNumbersOrSymbols = /[\d\W]/;
    const onlyNumbers = /^\d+$/;
    const onlySymbols = /^[^A-Za-z0-9]+$/;

    const isDuplicate = this.data.existingTaskNames.includes(value.toLowerCase());
    if (isDuplicate) return { duplicate: true };

    if (onlyNumbers.test(value) || onlySymbols.test(value)) {
      return { invalidPattern: true };
    }

    if (!onlyLetters.test(value) && !(hasLetters.test(value) && hasNumbersOrSymbols.test(value))) {
      return { invalidPattern: true };
    }

    return null;
  }

  addTask() {
    if (this.taskForm.valid) {
      const task = {
        ...this.taskForm.value,
        status: this.data.status,
        projectId: this.data.projectId
      };
      this.dialogRef.close(task);
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  @HostListener('click', ['$event'])
  onHostClick(event: Event) {
    // Close dialog when clicking on the backdrop (host element)
    this.cancel();
  }

  get taskNameControl() {
    return this.taskForm.get('taskName');
  }

  get taskDescControl() {
    return this.taskForm.get('taskDesc');
  }

  get dueDateControl() {
    return this.taskForm.get('dueDate');
  }

  get priorityControl() {
    return this.taskForm.get('priority');
  }
}
