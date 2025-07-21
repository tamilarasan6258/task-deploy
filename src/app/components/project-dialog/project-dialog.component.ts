import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectStructure } from '../../models/project.model';

interface ProjectDialogData {
  project?: ProjectStructure;
  allProjects?: ProjectStructure[];
}

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    MatInputModule, MatDatepickerModule, MatNativeDateModule,
    ReactiveFormsModule, MatFormFieldModule, MatButtonModule, 
    MatIconModule, CommonModule
  ],
  templateUrl: './project-dialog.component.html',
  styleUrl: './project-dialog.component.css'
})
export class ProjectDialogComponent {
  projectForm: FormGroup<{
    projectName: FormControl<string>;
    projectDesc: FormControl<string>;
    dueDate: FormControl<Date | null>;
  }>;
  
  isChanged = false;
  nameExists = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectDialogData
  ) {
    this.projectForm = this.fb.nonNullable.group({
      projectName: [
        data?.project?.projectName || '',
        [
          Validators.required,
          this.customProjectNameValidator
        ]
      ],
      projectDesc: [data?.project?.projectDesc || '', Validators.required],
      dueDate: [data?.project?.dueDate ? new Date(data.project.dueDate) : null, Validators.required],
    });

    this.projectForm.valueChanges.subscribe(() => {
      this.detectChanges();
    });

    this.projectForm.get('projectName')?.valueChanges.subscribe((name) => {
      if (name) {
        this.checkDuplicateName(name);
      }
    });
  }

  detectChanges(): void {
    const initialValue = {
      projectName: this.data?.project?.projectName || '',
      projectDesc: this.data?.project?.projectDesc || '',
      dueDate: this.data?.project?.dueDate ? new Date(this.data.project.dueDate) : null
    };
    this.isChanged = JSON.stringify(this.projectForm.value) !== JSON.stringify(initialValue);
  }

  checkDuplicateName(name: string): void {
    const control = this.projectForm.get('projectName');
    if (!this.data?.allProjects) {
      this.nameExists = false;
      return;
    }

    this.nameExists = this.data.allProjects.some(
      (proj) => proj._id !== this.data?.project?._id &&
        proj.projectName.toLowerCase() === name.toLowerCase()
    );

    if (this.nameExists) {
      control?.setErrors({ duplicate: true });
      control?.markAsTouched();
    } else if (control?.hasError('duplicate')) {
      control?.setErrors(null);
    }
  }

  customProjectNameValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').trim();
    if (!value) return null;

    const onlyLetters = /^[A-Za-z]+$/;
    const lettersNumbersSymbols = /^(?=.*[A-Za-z])(?=.*[\d\W]).+$/;
    const onlyNumbers = /^[0-9]+$/;
    const onlySymbols = /^[^A-Za-z0-9]+$/;

    if (onlyNumbers.test(value) || onlySymbols.test(value)) {
      return { invalidPattern: true };
    }

    if (!onlyLetters.test(value) && !lettersNumbersSymbols.test(value)) {
      return { invalidPattern: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.projectForm.valid && !this.nameExists) {
      this.dialogRef.close(this.projectForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}