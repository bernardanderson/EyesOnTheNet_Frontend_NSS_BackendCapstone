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

  constructor(private menuService: MenuService, router: Router) {
    this.router = router;
    menuService.showMenu$.subscribe(
      selectedMenu => {
        this.menuActive = selectedMenu;
      });
  }

  userMenuSelection(sentEvent): void {
    // When a menu item is clicked, this sends out the annoucement to all subscribers
    let message: string;
    if (sentEvent.target.tagName === "I"){
      this.menuItem = sentEvent.target.parentElement.innerText;
    } else {
      this.menuItem = sentEvent.target.innerText;
    }
    this.menuService.annouceMenuItem(this.menuItem);

    // This checks to see what action should be taken
    if (this.menuItem === "Logout") {
      this.userLogout();

    }

  }

  userLogout() {
    document.cookie = "access_token=;Path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    this.menuService.activateMenu(false);
    this.router.navigateByUrl('');
  }
}