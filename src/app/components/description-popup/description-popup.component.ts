import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-description-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './description-popup.component.html',
  styleUrl: './description-popup.component.css'
})
export class DescriptionPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<DescriptionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; description: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
