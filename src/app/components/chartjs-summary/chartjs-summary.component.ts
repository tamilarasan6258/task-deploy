import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { HeaderComponent } from '../header/header.component';
import { TaskService } from '../../services/tasks/task.service';
import { TaskSummaryResponse } from '../../models/task.model';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-chartjs-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    HeaderComponent
  ],
  templateUrl: './chartjs-summary.component.html',
  styleUrl: './chartjs-summary.component.css'
})
export class ChartjsSummaryComponent implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);

  // Dashboard data
  totalTasks = 0;
  completedTasks = 0;
  incompleteTasks = 0;
  loading = true;

  // Project data
  projectId: string = '';
  projectName: string = '';

  // Chart data
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Backlog', 'To-Do', 'In Progress', 'Done'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        '#FF6384',
        '#36A2EB', 
        '#FFCE56',
        '#4BC0C0'
      ],
      borderColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56', 
        '#4BC0C0'
      ],
      borderWidth: 2
    }]
  };

  barChartData: ChartData<'bar'> = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Number of Tasks',
      data: [0, 0, 0],
      backgroundColor: [
        '#4CAF50',
        '#FF9800',
        '#F44336'
      ],
      borderColor: [
        '#4CAF50',
        '#FF9800',
        '#F44336'
      ],
      borderWidth: 2
    }]
  };

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Tasks Due',
      data: [],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2196F3',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  // Task Completion Time Analysis - Area Spline Chart
  completionTimeChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Completion Time (Days)',
      data: [],
      borderColor: '#9C27B0',
      backgroundColor: 'rgba(156, 39, 176, 0.2)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#9C27B0',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };


  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `Week of ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} tasks`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Week'
        },
        grid: {
          display: true
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tasks'
        },
        ticks: {
          stepSize: 1
        },
        grid: {
          display: true
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Task Completion Time Analysis Chart Options
  completionTimeChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} days`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Task Name'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Completion Time (Days)'
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + 'd';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };



  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading = true;
    
    // Get project ID from route query parameters (passed from kanban board)
    this.route.queryParamMap.subscribe(queryParams => {
      this.projectId = queryParams.get('projectId') || '';
      this.projectName = queryParams.get('projectName') || 'Project Charts';
      
      if (!this.projectId) {
        console.error('No project ID provided');
        this.loading = false;
        return;
      }
      
      // Load tasks for the specific project
      this.loadProjectTasks();
    });
  }

  private loadProjectTasks() {
    this.loading = true;
    
    // Get tasks for the specific project
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks: TaskSummaryResponse[]) => {
        this.processTasksData(tasks);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching tasks for project:', error);
        this.loading = false;
      }
    });
  }

  private processTasksData(tasks: TaskSummaryResponse[]) {
    this.totalTasks = tasks.length;
    this.completedTasks = tasks.filter(task => task.status === 'done').length;
    this.incompleteTasks = this.totalTasks - this.completedTasks;

    // Process status data for doughnut chart
    const statusCounts = {
      'backlog': 0,
      'to-do': 0,
      'in-progress': 0,
      'done': 0
    };

    tasks.forEach(task => {
      statusCounts[task.status]++;
    });

    this.doughnutChartData = {
      labels: ['Backlog', 'To-Do', 'In Progress', 'Done'],
      datasets: [{
        data: [
          statusCounts['backlog'],
          statusCounts['to-do'],
          statusCounts['in-progress'],
          statusCounts['done']
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ],
        borderWidth: 2
      }]
    };

    // Process priority data for bar chart
    const priorityCounts = {
      'low': 0,
      'medium': 0,
      'high': 0
    };

    tasks.forEach(task => {
      priorityCounts[task.priority]++;
    });

    this.barChartData = {
      labels: ['Low', 'Medium', 'High'],
      datasets: [{
        label: 'Number of Tasks',
        data: [
          priorityCounts['low'],
          priorityCounts['medium'],
          priorityCounts['high']
        ],
        backgroundColor: [
          '#4CAF50',
          '#FF9800',
          '#F44336'
        ],
        borderColor: [
          '#4CAF50',
          '#FF9800',
          '#F44336'
        ],
        borderWidth: 2
      }]
    };

    // Process due date data for line chart
    this.processTasksDueOverTime(tasks);

    // Process completion time data for area spline chart
    this.processCompletionTimeData(tasks);
  }

  private processTasksDueOverTime(tasks: TaskSummaryResponse[]) {
    // Filter tasks that have due dates
    const tasksWithDueDates = tasks.filter(task => task.dueDate);
    
    if (tasksWithDueDates.length === 0) {
      this.lineChartData = {
        labels: ['No Due Dates'],
        datasets: [{
          label: 'Tasks Due',
          data: [0],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2196F3',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      };
      return;
    }

    // Group tasks by week
    const weeklyData: { [key: string]: number } = {};
    const currentDate = new Date();
    
    // Generate 8 weeks (4 weeks back, current week, 3 weeks forward)
    for (let i = -4; i <= 7; i++) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + (i * 7));
      const weekKey = this.getWeekKey(weekStart);
      weeklyData[weekKey] = 0;
    }

    // Count tasks for each week
    tasksWithDueDates.forEach(task => {
      const dueDate = new Date(task.dueDate!);
      const weekStart = new Date(dueDate);
      weekStart.setDate(dueDate.getDate() - dueDate.getDay());
      const weekKey = this.getWeekKey(weekStart);
      
      if (weeklyData.hasOwnProperty(weekKey)) {
        weeklyData[weekKey]++;
      }
    });

    // Sort weeks chronologically
    const sortedWeeks = Object.keys(weeklyData).sort((a, b) => {
      const dateA = new Date(a.split(' - ')[0]);
      const dateB = new Date(b.split(' - ')[0]);
      return dateA.getTime() - dateB.getTime();
    });

    const labels = sortedWeeks.map(week => week.split(' - ')[0]); // Show only start date
    const data = sortedWeeks.map(week => weeklyData[week]);

    this.lineChartData = {
      labels: labels,
      datasets: [{
        label: 'Tasks Due',
        data: data,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2196F3',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };
  }

  private getWeekKey(date: Date): string {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatDate = (d: Date) => {
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${month}/${day}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  private processCompletionTimeData(tasks: TaskSummaryResponse[]) {
    // Filter completed tasks only
    const completedTasks = tasks.filter(task => task.status === 'done');
    
    if (completedTasks.length === 0) {
      this.completionTimeChartData = {
        labels: ['No Completed Tasks'],
        datasets: [{
          label: 'Completion Time (Days)',
          data: [0],
          borderColor: '#9C27B0',
          backgroundColor: 'rgba(156, 39, 176, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#9C27B0',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      };
      return;
    }

    // Calculate completion time for each task (updatedAt - createdAt)
    const completionData = completedTasks.map(task => {
      const createdDate = new Date(task.createdAt);
      const completedDate = new Date(task.updatedAt); // Assuming updatedAt is completion time
      const completionTimeMs = completedDate.getTime() - createdDate.getTime();
      const completionTimeDays = Math.round(completionTimeMs / (1000 * 60 * 60 * 24) * 10) / 10; // Round to 1 decimal
      
      return {
        taskName: task.taskName.length > 15 ? task.taskName.substring(0, 15) + '...' : task.taskName,
        completionTime: Math.max(completionTimeDays, 0.1) // Minimum 0.1 day to show on chart
      };
    });

    // Sort by completion time for better visualization
    //completionData.sort((a, b) => a.completionTime - b.completionTime);

    // Limit to top 10 tasks for better readability
    const displayData = completionData.slice(0, 10);

    const labels = displayData.map(item => item.taskName);
    const data = displayData.map(item => item.completionTime);

    this.completionTimeChartData = {
      labels: labels,
      datasets: [{
        label: 'Completion Time (Days)',
        data: data,
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#9C27B0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
  }


}