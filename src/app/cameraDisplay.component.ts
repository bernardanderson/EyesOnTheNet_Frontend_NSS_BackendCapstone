import { Component, Input, OnDestroy } from '@angular/core'; // Add Input, OnDestroy for menu communication
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';           // Needed for menu communication
import { Subscription }   from 'rxjs/Subscription';     // Needed for menu communication
import 'rxjs/add/operator/map';
//
import { GlobalVariables } from './global';

declare var $: any;

@Component({
    selector: 'cameraDisplay-view', 
    templateUrl: 'cameraDisplay.component.html',
    styleUrls: ['cameraDisplay.component.css']
})

// Add implements OnDestroy for menu communictation
export class CameraDisplayComponent implements OnDestroy {  

    // Inputted from menu communictation in App.Component
    @Input() selectedMenu:string;                           
    
    ngOnInit() {
        this.menuService.activateMenu(true);
        //this.getCameraList();
    }

    // Prevents memory leakage when this view is destroyed
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    // Needed for menu communication
    subscription:Subscription;                              
    
    userCameraList: {
        id: string,
        name: string,
        location: string
    }[];

    // The formatted constructor receives the menu information when changed in parent
    constructor(private menuService: MenuService) {          
        this.subscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
                         // Put code here to run functions or access the menuItems
        });
    }














}