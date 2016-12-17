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

  router: Router;
  menuItem: string = "";
  menuActive: boolean = false;

  // Sets up the router and menuService to watch clicks to the menu
  constructor(private menuService: MenuService, router: Router) {
    this.router = router;
    menuService.showMenu$.subscribe(
      selectedMenu => {
        this.menuActive = selectedMenu;
      });
  }

  // When a menu item is clicked, this finds which was cliked and sends out the annoucement to all subscribers
  userMenuSelection(sentEvent): void {

    if (sentEvent.target.parentElement.tagName === "I"){
      this.menuItem = sentEvent.target.parentElement.parentElement.innerText;
    } else if (sentEvent.target.tagName === "I") {
      this.menuItem = sentEvent.target.parentElement.innerText;
    } else {
      this.menuItem = sentEvent.target.innerText;
    }

    this.menuService.annouceMenuItem(this.menuItem);

    // When the user clicks the Logout button
    if (this.menuItem === "Logout") {
      this.userLogout();
    }
  }

  // For the Logout function
  userLogout() {
    document.cookie = "access_token=;Path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    this.menuService.activateMenu(false);
    this.router.navigateByUrl('');
  }
}