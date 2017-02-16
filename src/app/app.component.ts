import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';  // Needed for menu communication

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MenuService]                    // Needed for menu communication, all children inherit this so don't put it in the children
})

export class AppComponent {

  router: Router;

  refreshTimerOptions: {                 // Time options for the multi/single camera refreshes (in seconds)
    message: string,
    time: number } [] =          
    [ {message: "Off", time:0},
      {message: "5s",  time:5000},
      {message: "10s", time:10000},
      {message: "15s", time:15000},
      {message: "30s", time:30000},
      {message: "60s", time:60000}];

  // Sets up the router and menuService to watch clicks to the menu
  constructor(router: Router) {
    this.router = router;
  }
}