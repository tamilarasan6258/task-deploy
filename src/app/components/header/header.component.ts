//Done using shared header (Header component - child component, Other components - parent component)
//Header component : (i) Accepts @Input values from parent
//                   (ii) Emits events to the parent via @Output

// Parent Components of Header component : front-page, login, register, dashboard, kanban-board, profile, echarts, chartjs, highcharts, reset-password
//These become parent component if they include <app-header> in their html

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [MatIconModule,CommonModule,FormsModule,RouterLink]
})

export class HeaderComponent {
  //@Input - allows the parent to control what should be shown
  @Input() showSearch: boolean = false;
  @Input() showProfile: boolean = false;
  @Input() hideAuthButtons: boolean = false;
  @Input() showhamburger: boolean = false;
  @Input() logoutbutton : boolean = false;  

  //@Output - sends search input value back to parent component whenever the input changes.
  @Output() onSearch = new EventEmitter<string>();

  menuOpen = false;       //toggle/switch b/w mobile nav visibility
  profileOpen = false;    //toggle b/w profile dropdown menu
  searchTerm = '';        //holds current search text(via [(ngModel)])

  constructor(private router: Router,private authService : AuthService) {}

  // Without stopPropagation() - the click might trigger other click events in parent
  // With stopPropagation() - the parent's click won't run. Only the child click runs
  toggleProfileMenu(event: Event): void {
    event.stopPropagation();                //stops the event from bubbling up(prevents parent elemts from reacting to the same event of child)
    this.profileOpen = !this.profileOpen;
  }

  //Navigates to profile page and closes dropdown
  goToProfile(event: Event) {
    event.stopPropagation();
    this.profileOpen = false;
    this.router.navigate(['/profile']);
  }

  //Logs out the user by clearing session storage and navigates to login page
  logout(event: Event) {
    event.stopPropagation();
    this.profileOpen = false;
   this.authService.logout(); 
    // this.router.navigate(['/login']);

  }
}