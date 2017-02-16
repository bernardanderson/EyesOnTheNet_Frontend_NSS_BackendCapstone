import { Component } from '@angular/core'; // Add Input, OnDestroy for menu communication
import { Router } from '@angular/router';

// Needed for menu communication
import { Subscription }   from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { MenuService } from './menu.service';

@Component({
    selector: 'topmenu', 
    templateUrl: 'topmenu.component.html',
    styleUrls: ['topmenu.component.css'],
})

export class TopMenuComponent { 
    
  router: Router;
  menuSubscription: Subscription;            // Needed for menu communication
  menuItem: string = "";
  menuActive: boolean = false;

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
      break;
      case "Multi-Camera":
      this.router.navigateByUrl("/camera/multicamera");
      break;
      case "Single Camera":
      this.router.navigateByUrl("/camera/singlecamera");
      break;
      case "Record Feeds":
      this.router.navigateByUrl("/camera/record");
      break;
      case "Cam DVR":
      this.router.navigateByUrl("/camdvr");
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
