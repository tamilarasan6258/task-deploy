import { Routes } from '@angular/router';

import { FrontPageComponent } from './components/front-page/front-page.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { EchartsSummaryComponent } from './components/echarts-summary/echarts-summary.component';
import { HighchartsSummaryComponent } from './components/highcharts-summary/highcharts-summary.component';
import { ChartjsSummaryComponent } from './components/chartjs-summary/chartjs-summary.component';

import { authGuard } from './guards/authGuard/auth.guard';
import { loginGuard } from './guards/loginGuard/login.guard';
import { AutoLoginGuard } from './guards/autologin/autologin.guard';

export const routes: Routes = [
  { path: '', component: FrontPageComponent,canActivate:[AutoLoginGuard] },

  { path: 'register', component: RegisterComponent ,canActivate:[loginGuard]},

  { path: 'login', component: LoginComponent, canActivate: [loginGuard]},

  { path: 'profile', component: ProfileComponent,canActivate: [authGuard]},

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},

  { path: 'projects/:id', component: KanbanBoardComponent,canActivate: [authGuard]},

  { path: 'reset-password/:token', component: ResetPasswordComponent },

  { path: 'echarts-summary/:projectId', component: EchartsSummaryComponent, canActivate: [authGuard] },

  { path: 'chartjs-summary/:projectId', component: ChartjsSummaryComponent, canActivate: [authGuard] },
  
  { path: 'highcharts-summary/:projectId', component: HighchartsSummaryComponent, canActivate: [authGuard] }
];