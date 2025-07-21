import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';


// ...existing code...
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'Task-Management-System';

}