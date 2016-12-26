import { Component, Input, OnInit, OnDestroy } from '@angular/core'; // Add Input, OnDestroy for menu communication
import { Router } from '@angular/router';
import { Subscription }   from 'rxjs/Subscription';     // Needed for menu communication
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable'; // For Timer
import { FormsModule } from '@angular/forms'; // Needed for ngModel
import 'rxjs/add/operator/map';
//
import { MenuService } from './menu.service';           // Needed for menu communication
import { HttpRequestService, IHttpRequestConf } from './httprequest.service';
import { GlobalVariables } from './global';

declare var $: any;

@Component({
    selector: 'recordcams-view', 
    templateUrl: 'recordCams.component.html',
    styleUrls: ['recordCams.component.css']
})

export class RecordCamsComponent implements OnInit, OnDestroy {  

// Properties    
    subscription: Subscription;            // Needed for menu communication

    currentView: string = "";      // Used to control the 'child view' of the camera window (Multi or Single)

    ngOnInit() {
        this.menuService.activateMenu(true);    // Shows the nav-menu on page load
    }

    // Prevents memory leakage when this view is destroyed
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    // The formatted constructor receives the menu information when changed in parent
    constructor(private menuService: MenuService, private httpRequestService: HttpRequestService) {  
        this.subscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
            if (menuItem === "Add Camera"){
            }
            if (menuItem === "Record Cams") {
                this.currentView = "recordcams";
            }
            if (menuItem === "Cam DVR") {
                this.currentView = "camdvr";
            }
        });
    }

}
