import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-front-page',
  imports: [RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './front-page.component.html',
  styleUrl: './front-page.component.css'
})

export class FrontPageComponent {
  constructor() { }

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
