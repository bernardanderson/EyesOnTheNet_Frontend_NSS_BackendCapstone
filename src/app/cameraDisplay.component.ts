import { Component, Input, OnInit, OnDestroy } from '@angular/core'; // Add Input, OnDestroy for menu communication
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';           // Needed for menu communication
import { Subscription }   from 'rxjs/Subscription';     // Needed for menu communication
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable'; // For Timer
import { FormsModule } from '@angular/forms'; // Needed for ngModel
import 'rxjs/add/operator/map';
//
import { GlobalVariables } from './global';

declare var $: any;

interface AddEditCamera {
    CameraId: any,
    Name: string,
    Type: number,
    WebAddress: string,
    LoginName: string,
    LoginPass: string,
    Private: number,
    Location: string,
    ModalTitle: string
}

@Component({
    selector: 'cameraDisplay-view', 
    templateUrl: 'cameraDisplay.component.html',
    styleUrls: ['cameraDisplay.component.css']
})

export class CameraDisplayComponent implements OnInit, OnDestroy {  

    // Inputted from menu communictation in App.Component
    // ** (You don't need @Input any more) **
    @Input() selectedMenu:string;                           
    
// Properties    
    subscription: Subscription;            // Needed for menu communication
    refreshinterval: number = 5000;        // For cam images refresh
    userCameraList: {
      cameraIdHash: any,
      name: string,
      location: string
    }[] = [];                              // Array of Possible User Cameras

    expandedSingleCameraInfo: {}[] = [{    // For the expanded single camera view
      name: "",                            // This sapcer image is need to size the modal prior to real data
      cameraURL: "http://www.clipartbest.com/cliparts/yio/eXG/yioeXG4RT.jpeg"
    }];   // For the expanded single camera view 

    addEditCamera: AddEditCamera = {
        CameraId: null,
        Name: "",
        Type: 0,
        WebAddress: "",
        LoginName: "",
        LoginPass: "",
        Private: 1,
        Location: "",
        ModalTitle: ""
    };          // For adding or editing a camera parameters

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
        cameraIdHash: number,
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
            if (menuItem === "Add Camera"){
                $('.ui.modal.addcamera').modal('show');
            }
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

    // Gets a single camera for editing and opens the edit modal
    editSingleCamera(sentCamera) {
      this.http.get(`http://${GlobalVariables.serverIP}/api/camera/${sentCamera.cameraIdHash}/singlecamera`,
      { withCredentials: true } )
      .map(res => this.extractData(res))
      .subscribe(
        data => {
          console.log(data)
          this.addEditCamera = data;
          console.log(this.addEditCamera)
          $('.ui.modal.addcamera').modal('show');
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
            if (sentCamera.cameraIdHash === this.viewingCameras[i].cameraIdHash) {
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

    camPicMenu(sentEvent, sentCamera) {

        let camMenuAction: string = "";
        if (sentEvent.target.className.includes("icon")) {
            camMenuAction = sentEvent.target.parentElement.innerText;
        } else {
            camMenuAction = sentEvent.target.innerText;
        }
        switch (camMenuAction) {
            case "Expand": 
                this.expandCameraView(sentCamera);
                break;
            case "Edit": 
                this.editSingleCamera(sentCamera);
                break;
            case "Close": 
                this.viewingCameras.splice(this.viewingCameras.indexOf(sentCamera), 1);
                break;
            case "Refresh": 
                this.addCamerasToView(sentCamera);
                break;
            default:
                break;
        }
    }

    submitCamera() {
      if (this.addEditCamera.Name === "") {
          this.showAddEditError();
          return false;
      }

      let userCamera = this.addEditCamera;
      delete userCamera.ModalTitle;
      userCamera.WebAddress = "http://" + userCamera.WebAddress;

      if (userCamera.CameraId === null) {
          delete userCamera.CameraId;
      }

      var headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.http.post(`http://${GlobalVariables.serverIP}/api/camera/addcamera`, 
        JSON.stringify(userCamera), {
        headers: headers, withCredentials: true
      }).map( res => this.extractData(res) )
      .subscribe(
          data => {
            for (let i = 0; i < this.userCameraList.length; i++) {
              if (data.cameraIdHash === this.userCameraList[i].cameraIdHash) {
                this.userCameraList[i] = data;
                this.resetAddEditCameraObject();
                return true;
              }
            } 
            this.userCameraList.push(data);
            this.resetAddEditCameraObject();
          },
          err => {
            this.showAddEditError();
          }
      );
    }

    // Resets the Add CameraObject after new camera is submitted
    // This can probably be done way better...
    resetAddEditCameraObject() {
      this.addEditCamera.CameraId = null,
      this.addEditCamera.Name = "",
      this.addEditCamera.Type = 0,
      this.addEditCamera.WebAddress = "",
      this.addEditCamera.LoginName = "",
      this.addEditCamera.LoginPass = "",
      this.addEditCamera.Private = 1,
      this.addEditCamera.Location = "",
      this.addEditCamera.ModalTitle = ""
    }; 

    expandCameraView(sentSingleCamera) {
      this.expandedSingleCameraInfo.pop();
      this.expandedSingleCameraInfo.push(sentSingleCamera);
      $('.ui.expanded.camera.modal').modal('show');
  }

    showAddEditError() {
        $('.ui.small.modal.error').modal('show');
    }
}
