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
    
    ngOnInit() {
        this.menuService.activateMenu(true);
        this.getCameraList();
        
        IntervalObservable.create(5000).subscribe(timeKeeper => {

            console.log("Hello");             
        
        });
    }

    // Prevents memory leakage when this view is destroyed
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    // Needed for menu communication
    subscription:Subscription;

    userCameraList: {}[] = [];
    viewingCameras: {
        cameraHashId: number,
        cameraURL: string,
        name: string,
        location: string
    } [] = [];

    // The formatted constructor receives the menu information when changed in parent
    constructor(private menuService: MenuService, private http: Http) {  
        this.subscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
        // Put code here to run functions or access the menuItems
        });
    }

    // Gets the list of user cameras and populates the Camera Cards
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

    private extractData(res: Response) {
      let body;
      // check if empty, before call json
      if (res.text()) {
          body = res.json();
      }
      return body || {};
    }

    addCamerasToView(sentCamera): boolean {

        sentCamera.cameraURL =`http://${GlobalVariables.serverIP}/api/camera/${sentCamera.cameraIdHash}/snapshot?` + new Date().getTime();
        
        for (let i = 0; i < this.viewingCameras.length; i++) {
            if (sentCamera.name === this.viewingCameras[i].name) {
                this.viewingCameras[i] = sentCamera
                return true;       
            }
        }
        this.viewingCameras.push(sentCamera);
        return true;
    }
}