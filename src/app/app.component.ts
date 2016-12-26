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
  menuItem: string = "Multi-Camera";
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
    switch (this.menuItem) {
      case "Logout": 
      this.userLogout();
      break;
      case "Add Camera":
      console.log("Add Camera");
      break;
      case "Multi-Camera":
      this.router.navigateByUrl("/cameras");
      console.log("Multi-Camera");
      break;
      case "Single Camera":
      this.router.navigateByUrl("/cameras");
      console.log("Single Camera")
      break;
      case "Record Cams":
      this.router.navigateByUrl("/record");
      console.log("Record Cams")
      break;
      case "Cam DVR":
      this.router.navigateByUrl("/record");
      console.log("Cam DVR")
      break;
    }
  }

  // For the Logout function, deletes Cookie, resets the Ang2 routing
  userLogout() {
    document.cookie = "access_token=;Path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    this.menuService.activateMenu(false);
    this.router.navigateByUrl('');
  }
}