import { Component, Input, OnInit, OnDestroy } from '@angular/core'; // Add Input, OnDestroy for menu communication
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';           // Needed for menu communication
import { Subscription }   from 'rxjs/Subscription';     // Needed for menu communication
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable'; // For Timer
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

export class CameraDisplayComponent implements OnInit, OnDestroy {  

    // Inputted from menu communictation in App.Component
    @Input() selectedMenu:string;                           
    
// Properties    
    subscription: Subscription;            // Needed for menu communication
    refreshinterval: number = 5000;        // For cam images refresh
    userCameraList: {}[] = [];             // Array of Possible User Cameras
    refreshTimerClock: Subscription;       // For timer subscription
    refreshTimerOptions: {                 // Time options for the refreshes (in seconds)
            message: string,
            time: number } [] =          
        [ {message: "Off", time:0},
          {message: "5s",  time:5000},
          {message: "10s", time:10000},
          {message: "15s", time:15000},
          {message: "30s", time:30000},
          {message: "60s", time:60000}];
    viewingCameras: {                // Array of which cameras are currently being viewed
        cameraHashId: number,
        cameraURL: string,
        name: string,
        location: string
    } [] = [];
    
    ngOnInit() {
        this.menuService.activateMenu(true);    // Shows the nav-menu on page load
        this.getCameraList();                   // Pulls the users cameras on page load
    }

    // Prevents memory leakage when this view is destroyed
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    // The formatted constructor receives the menu information when changed in parent
    constructor(private menuService: MenuService, private http: Http) {  
        this.subscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
            console.log("Menu Clicked") // Put code here to run functions or access the menuItems
        });
    }

    // Gets the list of user cameras and populates the Camera MENU Cards
    getCameraList() {
      this.http.get(`http://${GlobalVariables.serverIP}/api/camera`,
      { withCredentials: true } )
      .map(res => this.extractData(res))
      .subscribe(
        data => {
          this.userCameraList = this.userCameraList.concat(data);
        },
        err => {
          console.log(err);          
        })
    }

    // Snippette to process data received from the HTTP.get/posts
    private extractData(res: Response) {
      let body;
      // check if empty, before call json
      if (res.text()) {
          body = res.json();
      }
      return body || {};
    }

    // When a user selects a camera for viewing it gets added to the viewArray.
    //  If it's already being viewed, the IMG src string gets updated instead.
    addCamerasToView(sentCamera): boolean {
        sentCamera.cameraURL =`http://${GlobalVariables.serverIP}/api/camera/${sentCamera.cameraIdHash}/snapshot?${new Date().getTime()}`;
        
        for (let i = 0; i < this.viewingCameras.length; i++) {
            if (sentCamera.name === this.viewingCameras[i].name) {
                this.viewingCameras[i] = sentCamera
                return true;       
            }
        }
        this.viewingCameras.push(sentCamera);
        return true;
    }

    // Controls the starting and stopping of the refreshes of the cam images
    refreshTimer() {
        this.refreshTimerOptions.push(this.refreshTimerOptions.shift());
        if( this.refreshTimerOptions[0].time === 5000 ){
            this.refreshTimerClock = IntervalObservable.create(this.refreshTimerOptions[0].time).subscribe(timeKeeper => {
                this.refreshCamViewImages();
            });
        } else if (this.refreshTimerOptions[0].time === 0) {
            this.refreshTimerClock.unsubscribe();
        } else {
            this.refreshTimerClock.unsubscribe();
            this.refreshTimerClock = IntervalObservable.create(this.refreshTimerOptions[0].time).subscribe(timeKeeper => {
                this.refreshCamViewImages();
            });
        }
    }

    // This refreshes the viewing camera URLs
    refreshCamViewImages() {
        for(let i = 0; i < this.viewingCameras.length; i++) {
            let tempUrlString = this.viewingCameras[i].cameraURL;
            tempUrlString = tempUrlString.slice(0, tempUrlString.indexOf("?"));
            this.viewingCameras[i].cameraURL = `${tempUrlString}?${new Date().getTime()}`;
        }
    }


}