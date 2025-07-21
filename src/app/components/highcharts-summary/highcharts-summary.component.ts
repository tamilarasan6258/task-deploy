import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { HeaderComponent } from '../header/header.component';

import { TaskService } from '../../services/tasks/task.service';
import { TaskSummaryResponse, TaskStatus, TaskPriority } from '../../models/task.model';

import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import OfflineExporting from 'highcharts/modules/offline-exporting';


// Initialize exporting features
Exporting(Highcharts);
ExportData(Highcharts);
OfflineExporting(Highcharts); // ✅ This enables local downloads
HighchartsMore(Highcharts);

@Component({
  selector: 'app-highcharts-summary',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartModule,
    HeaderComponent,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './highcharts-summary.component.html',
  styleUrl: './highcharts-summary.component.css'
})

export class HighchartsSummaryComponent implements OnInit {

  route = inject(ActivatedRoute);
  taskService = inject(TaskService);

  Highcharts: typeof Highcharts = Highcharts;
  projectId: string = '';
  projectName: string = '';
  tasks: TaskSummaryResponse[] = [];

  loading = true;
  totalTasks = 0;
  completedTasks = 0;
  incompleteTasks = 0;

  statusChartOptions!: Highcharts.Options;
  priorityChartOptions!: Highcharts.Options;
  dueChartOptions!: Highcharts.Options;
  areaSplineChartOptions!: Highcharts.Options;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.projectId = params.get('projectId') || '';
      this.projectName = params.get('projectName') || 'Project';

      if (this.projectId) {
        this.fetchTasks();
      }
    });
  }

  fetchTasks() {
    this.loading = true;
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (data: TaskSummaryResponse[]) => {
        this.tasks = data;
        this.totalTasks = data.length;
        this.completedTasks = data.filter(t => t.status === 'done').length;
        this.incompleteTasks = this.totalTasks - this.completedTasks;

        this.initStatusChart();
        this.initPriorityChart();
        this.initDueChart();
        this.initCompletionChart();

        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch tasks', err);
        this.loading = false;
      }
    });
  }

  initStatusChart() {
    const statusCount:  Record<TaskStatus, number>  = {
      'backlog': 0,
      'to-do': 0,
      'in-progress': 0,
      'done': 0
    };

    this.tasks.forEach(task => statusCount[task.status]++);

    this.statusChartOptions = {
      chart: {
        type: 'pie',
        height: 300
      },
      title: { text: 'Task Status Overview' },
      subtitle: { text: 'Distribution of tasks by status' },
      credits: {
        enabled: false
      },
      series: [{
          type: 'pie',
          innerSize: '60%',
          data: [
              { name: 'Backlog', y: statusCount['backlog'], color: '#FF87A1' },
              { name: 'To-Do', y: statusCount['to-do'], color: '	#73D4E0' },
              { name: 'In Progress', y: statusCount['in-progress'], color: '#FFD740' },
              { name: 'Done', y: statusCount['done'], color: '#7DDB6A' }
          ]
        }],
          exporting: {
    enabled: true,
    fallbackToExportServer: false, // ❗ force offline mode (local)
    libURL: 'assets/highcharts-lib/',  // Path to your js libraries
  filename: 'task-chart'
  },

    };
  }

  initPriorityChart() {
  const priorityCount: Record<TaskPriority, number> = {
    'low': 0,
    'medium': 0,
    'high': 0
  };  
    this.tasks.forEach(task => priorityCount[task.priority]++);

    this.priorityChartOptions = {
      chart: { type: 'column', height: 300 },
      title: { text: 'Task Priority Distribution' },
      subtitle: { text: 'Number of tasks by priority level' },
      credits: {
         enabled: false
      },
      legend: {
        enabled: false
      },
      xAxis: {
        categories: ['Low', 'Medium', 'High'],
        title: { text: 'Priority' }
      },
      yAxis: {
        min: 0,
        title: { text: 'Number of Tasks' }
      },
      series: [{
        name: 'Tasks',
        type: 'column',
        data: [
          { y: priorityCount['low'], color: '#7DDB6A' },     // Low - Green
          { y: priorityCount['medium'], color: '#FFD740' },  // Medium - Yellow
          { y: priorityCount['high'], color: '#FF87A1' }     // High - Red
        ]
      }],
      
          exporting: {
    enabled: true,
    fallbackToExportServer: false // ❗ force offline mode (local)
  },
    };
  }

  initDueChart() {
    const dueMap: Record<string, number> = {};
    const now = new Date();

    for (let i = -4; i <= 3; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + i * 7);
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      dueMap[label] = 0;
    }

    this.tasks.forEach(task => {
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const label = `${due.getMonth() + 1}/${due.getDate()}`;
        if (label in dueMap) dueMap[label]++;
      }
    });

    const labels = Object.keys(dueMap);
    const values = Object.values(dueMap);

    this.dueChartOptions = {
      chart: {
        type: 'line',
        height: 300
      },
      title: { text: 'Tasks Due Over Time' },
      subtitle: { text: 'Task workload distribution by due date' },
      credits: {
          enabled: false
      },
      xAxis: {
        categories: labels,
        title: { text: 'Week' }
      },
      yAxis: {
        min: 0,
        title: { text: 'Tasks Due' }
      },
      plotOptions: {
        line: { step: 'left' }
      },
      series: [{
        type: 'line',
        name: 'Tasks Due',
        data: values,
        color: '#9F79EE'
      }],
      
          exporting: {
    enabled: true,
    fallbackToExportServer: false // ❗ force offline mode (local)
  },
    };
  }

  initCompletionChart() {
  const completionDurations: { x: number; y: number; name: string }[] = [];

  this.tasks.forEach((task, index) => {
    if (task.status === 'done' && task.createdAt && task.updatedAt) {
      const created = new Date(task.createdAt).getTime();
      const updated = new Date(task.updatedAt).getTime();
      const daysTaken = (updated - created) / (1000 * 60 * 60 * 24);

      completionDurations.push({
        x: index,
        y: parseFloat(daysTaken.toFixed(2)),
        name: task.taskName || `Task ${index + 1}`
      });
    }
  });

  if (completionDurations.length === 0) {
    this.areaSplineChartOptions = {
      title: { text: 'Task Completion Time Analysis' },
      subtitle: { text: 'No completed tasks available' }
    };
    return;
  }

  this.areaSplineChartOptions = {
    chart: {
      type: 'areaspline',
      height: 300
    },
    title: { text: 'Task Completion Time Analysis' },
    subtitle: { text: 'Duration of completed tasks over time' },
    credits: {
      enabled: false
    },
    xAxis: {
      title: { text: 'Tasks' },
      categories: completionDurations.map(d => d.name),
      tickmarkPlacement: 'on',
      labels: {
        rotation: -45
      }
    },
    yAxis: {
      title: { text: 'Days Taken to Complete' },
      min: 0
    },
    tooltip: {
      shared: true,
      valueSuffix: ' days'
    },
    series: [{
      type: 'areaspline',
      name: 'Days Taken',
      data: completionDurations.map(d => d.y),
      color: '#9F79EE',
      fillOpacity: 0.5
    }],
    
          exporting: {
    enabled: true,
    fallbackToExportServer: false // ❗ force offline mode (local)
  },
  };
}

}
