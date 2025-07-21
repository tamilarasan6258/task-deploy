import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { EventEmitter, Output } from '@angular/core';
import { TaskCreateRequest, TaskStructure } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, MatCardModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})

export class TaskCardComponent {


    @Input() task!: TaskStructure;
 
  @Output() taskClick = new EventEmitter<TaskStructure>();

  handleClick() {
    this.taskClick.emit(this.task);
  }

  get isOverdue(): boolean {
    if (!this.task?.dueDate) return false;

    const due = new Date(this.task.dueDate).setHours(23, 59, 59, 999);
    const now = new Date().getTime();
    return now > due && (this.task.status === 'to-do' || this.task.status === 'in-progress');
  }

  formatDueDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise, format as MM/DD/YYYY
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

}