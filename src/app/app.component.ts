import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';  // Needed for menu communication

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MenuService]                    // Needed for menu communication
})

export class AppComponent {

  menuItem: string = "";

  constructor(private menuService: MenuService) {
    /*
    menuService.selectedMenuItem$.subscribe(
      selectedMenu => {
        this.menuItem = selectedMenu;
      });
    */
  }

  userMenuSelection(sentEvent): void {
    let message: string;
    if (sentEvent.target.tagName === "I"){
      this.menuItem = sentEvent.target.parentElement.innerText;
    } else {
      this.menuItem = sentEvent.target.innerText;
    }
    this.menuService.annouceMenuItem(this.menuItem);
  }
}
