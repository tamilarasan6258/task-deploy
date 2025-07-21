import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { TaskService } from '../../services/tasks/task.service';
import { TaskSummaryResponse } from '../../models/task.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import * as echarts from 'echarts';

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  statusCounts: { [key: string]: number };
  priorityCounts: { [key: string]: number };
  dueDateData: { date: string; count: number; overdue: number }[];
  completionTimeData: { taskName: string; completionTime: number }[];
}

@Component({
  selector: 'app-echarts-summary',
  standalone: true,
  imports: [HeaderComponent, CommonModule, MatCardModule, MatIconModule],
  templateUrl: './echarts-summary.component.html',
  styleUrl: './echarts-summary.component.css'
})
export class EchartsSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  projectId!: string;
  projectName: string = '';
  tasks: TaskSummaryResponse[] = [];
  taskStats: TaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    statusCounts: {},
    priorityCounts: {},
    dueDateData: [],
    completionTimeData: []
  };

  private statusChart: echarts.ECharts | null = null;
  private priorityChart: echarts.ECharts | null = null;
  private dueDateChart: echarts.ECharts | null = null;
  private completionTimeChart: echarts.ECharts | null = null;

  ngOnInit() {
    // Get project ID from route params
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('projectId')!;
      this.loadTasks();
    });

    // Get project name from query params
    this.route.queryParamMap.subscribe(queryParams => {
      this.projectName = queryParams.get('projectName') || 'Project';
    });
  }

  ngAfterViewInit() {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private loadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.calculateStats();
        this.updateCharts();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  private calculateStats() {
    this.taskStats = {
      totalTasks: this.tasks.length,
      completedTasks: this.tasks.filter(task => task.status === 'done').length,
      incompleteTasks: this.tasks.filter(task => task.status !== 'done').length,
      statusCounts: {},
      priorityCounts: {},
      dueDateData: [],
      completionTimeData: []
    };

    // Calculate status counts
    const statuses = ['backlog', 'to-do', 'in-progress', 'done'];
    statuses.forEach(status => {
      this.taskStats.statusCounts[status] = this.tasks.filter(task => task.status === status).length;
    });

    // Calculate priority counts
    const priorities = ['low', 'medium', 'high'];
    priorities.forEach(priority => {
      this.taskStats.priorityCounts[priority] = this.tasks.filter(task => task.priority === priority).length;
    });

    // Calculate due date data
    this.calculateDueDateData();
    
    // Calculate completion time data
    this.calculateCompletionTimeData();
  }

  private initializeCharts() {
    this.initStatusChart();
    this.initPriorityChart();
    this.initDueDateChart();
    this.initCompletionTimeChart();
  }

  private initStatusChart() {
    const chartElement = document.getElementById('statusChart');
    if (chartElement) {
      this.statusChart = echarts.init(chartElement);
      this.updateStatusChart();
    }
  }

  private initPriorityChart() {
    const chartElement = document.getElementById('priorityChart');
    if (chartElement) {
      this.priorityChart = echarts.init(chartElement);
      this.updatePriorityChart();
    }
  }

  private updateCharts() {
    if (this.statusChart) {
      this.updateStatusChart();
    }
    if (this.priorityChart) {
      this.updatePriorityChart();
    }
    if (this.dueDateChart) {
      this.updateDueDateChart();
    }
    if (this.completionTimeChart) {
      this.updateCompletionTimeChart();
    }
  }

  private updateStatusChart() {
    if (!this.statusChart) return;

    const data = [
      { value: this.taskStats.statusCounts['backlog'] || 0, name: 'Backlog' },
      { value: this.taskStats.statusCounts['to-do'] || 0, name: 'To-Do' },
      { value: this.taskStats.statusCounts['in-progress'] || 0, name: 'In Progress' },
      { value: this.taskStats.statusCounts['done'] || 0, name: 'Done' }
    ];

    const option = {
      title: {
        text: 'Task Status Overview',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['Backlog', 'To-Do', 'In Progress', 'Done']
      },
        toolbox: {
        show: true,
        feature: {
          saveAsImage: { show: true }
        },
    
      },
      series: [
        {
          name: 'Task Status',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data,
          color: ['#ff7f7f', '#ffb347', '#87ceeb', '#90ee90']
        }
      ]
    };

    this.statusChart.setOption(option);
  }

  private updatePriorityChart() {
    if (!this.priorityChart) return;

    const option = {
      title: {
        text: 'Task Priority Distribution',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Low', 'Medium', 'High'],
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
        toolbox: {
        show: true,
        feature: {
          saveAsImage: { show: true }
        }
       
      },
      series: [
        {
          name: 'Number of Tasks',
          type: 'bar',
          barWidth: '60%',
          data: [
            this.taskStats.priorityCounts['low'] || 0,
            this.taskStats.priorityCounts['medium'] || 0,
            this.taskStats.priorityCounts['high'] || 0
          ],
          itemStyle: {
            color: function(params: any) {
              const colors = ['#90ee90', '#ffb347', '#ff7f7f'];
              return colors[params.dataIndex];
            },
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };

    this.priorityChart.setOption(option);
  }

  private calculateDueDateData() {
    // Group tasks by week for the line chart
    const dueDateMap = new Map<string, { count: number; overdue: number }>();
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Get the start of current week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Generate 12 weeks of data (4 weeks back, current week, 7 weeks forward)
    for (let i = -4; i <= 7; i++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekKey = this.formatWeekRange(weekStart, weekEnd);
      dueDateMap.set(weekKey, { count: 0, overdue: 0 });
    }

    // Count tasks for each week
    this.tasks.forEach(task => {
      if (task.dueDate) {
        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);
        
        // Find which week this task belongs to
        for (let i = -4; i <= 7; i++) {
          const weekStart = new Date(startOfWeek);
          weekStart.setDate(startOfWeek.getDate() + (i * 7));
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          if (taskDueDate >= weekStart && taskDueDate <= weekEnd) {
            const weekKey = this.formatWeekRange(weekStart, weekEnd);
            const weekData = dueDateMap.get(weekKey)!;
            weekData.count++;
            
            // Check if task is overdue (due date passed and not completed)
            if (taskDueDate < currentDate && task.status !== 'done') {
              weekData.overdue++;
            }
            break;
          }
        }
      }
    });

    // Convert map to array
    this.taskStats.dueDateData = Array.from(dueDateMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      overdue: data.overdue
    }));
  }

  private formatWeekRange(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }

  private initDueDateChart() {
    const chartElement = document.getElementById('dueDateChart');
    if (chartElement) {
      this.dueDateChart = echarts.init(chartElement);
      this.updateDueDateChart();
    }
  }

  private updateDueDateChart() {
    if (!this.dueDateChart) return;

    const dates = this.taskStats.dueDateData.map(item => item.date);
    const totalTasks = this.taskStats.dueDateData.map(item => item.count);
    const overdueTasks = this.taskStats.dueDateData.map(item => item.overdue);

    const option = {
      title: {
        text: 'Tasks Due Over Time',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function(params: any) {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Total Tasks Due', 'Overdue Tasks'],
        top: '10%'
      },
        toolbox: {
        show: true,
        feature: {
          saveAsImage: { show: true }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        min: 0
      },
      series: [
        {
          name: 'Total Tasks Due',
          type: 'line',
          smooth: true,
          data: totalTasks,
          itemStyle: {
            color: '#5470c6'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
              ]
            }
          }
        },
        {
          name: 'Overdue Tasks',
          type: 'line',
          smooth: true,
          data: overdueTasks,
          itemStyle: {
            color: '#ee6666'
          },
          lineStyle: {
            width: 3
          },
          emphasis: {
            focus: 'series'
          }
        }
      ]
    };

    this.dueDateChart.setOption(option);
  }

  private calculateCompletionTimeData() {
    // Filter completed tasks only
    const completedTasks = this.tasks.filter(task => task.status === 'done');
    
    if (completedTasks.length === 0) {
      this.taskStats.completionTimeData = [];
      return;
    }

    // Calculate completion time for each task (updatedAt - createdAt)
    const completionData = completedTasks.map(task => {
      const createdDate = new Date(task.createdAt);
      const completedDate = new Date(task.updatedAt); // Assuming updatedAt is completion time
      const completionTimeMs = completedDate.getTime() - createdDate.getTime();
      const completionTimeDays = Math.round(completionTimeMs / (1000 * 60 * 60 * 24) * 10) / 10; // Round to 1 decimal
      
      return {
        taskName: task.taskName.length > 20 ? task.taskName.substring(0, 20) + '...' : task.taskName,
        completionTime: Math.max(completionTimeDays, 0.1) // Minimum 0.1 day to show on chart
      };
    });

    // Sort by completion time for better visualization
    // completionData.sort((a, b) => a.completionTime - b.completionTime);

    // Limit to top 15 tasks for better readability
    this.taskStats.completionTimeData = completionData.slice(0, 15);
  }

  private initCompletionTimeChart() {
    const chartElement = document.getElementById('completionTimeChart');
    if (chartElement) {
      this.completionTimeChart = echarts.init(chartElement);
      this.updateCompletionTimeChart();
    }
  }

  private updateCompletionTimeChart() {
    if (!this.completionTimeChart) return;

    if (this.taskStats.completionTimeData.length === 0) {
      const option = {
        title: {
          text: '📊 Task Completion Time Analysis',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        }
      };
      this.completionTimeChart.setOption(option);
      return;
    }

    const taskNames = this.taskStats.completionTimeData.map(item => item.taskName);
    const completionTimes = this.taskStats.completionTimeData.map(item => item.completionTime);

    const option = {
      title: {
        text: '📊 Task Completion Time Analysis',
        subtext: 'Time taken to complete tasks (from creation to completion)',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function(params: any) {
          const param = params[0];
          return `<strong>${param.axisValue}</strong><br/>
                  ${param.marker} Completion Time: <strong>${param.value} days</strong>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: taskNames,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          interval: 0
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: 'Days',
        nameLocation: 'middle',
        nameGap: 30,
        min: 0,
        axisLabel: {
          formatter: '{value}d'
        }
      },
        toolbox: {
        show: true,
        feature: {
          saveAsImage: { show: true }
        }
        
      },
      series: [
        {
          name: 'Completion Time',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: completionTimes,
          itemStyle: {
            color: '#9C27B0'
          },
          lineStyle: {
            width: 3,
            color: '#9C27B0'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(156, 39, 176, 0.3)' },
                { offset: 1, color: 'rgba(156, 39, 176, 0.05)' }
              ]
            }
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#7B1FA2',
              borderColor: '#fff',
              borderWidth: 2
            }
          },
          markLine: {
            silent: true,
            lineStyle: {
              color: '#E91E63',
              type: 'dashed'
            }
          }
        }
      ]
    };

    this.completionTimeChart.setOption(option);
  }

  ngOnDestroy() {
    if (this.statusChart) {
      this.statusChart.dispose();
    }
    if (this.priorityChart) {
      this.priorityChart.dispose();
    }
    if (this.dueDateChart) {
      this.dueDateChart.dispose();
    }
    if (this.completionTimeChart) {
      this.completionTimeChart.dispose();
    }
  }
}

