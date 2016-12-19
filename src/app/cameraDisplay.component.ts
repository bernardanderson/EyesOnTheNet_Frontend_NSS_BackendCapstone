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

interface AddEditCamera {
    cameraId: any,
    name: string,
    type: number,
    webAddress: string,
    loginName: string,
    loginPass: string,
    private: number,
    location: string,
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

    addEditCameraError = {
        hasError: false,
        message: ""
    };

    addEditCamera: AddEditCamera = {
        cameraId: null,
        name: "",
        type: 0,
        webAddress: "",
        loginName: "",
        loginPass: "",
        private: 1,
        location: "",
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
    constructor(private menuService: MenuService, private httpRequestService: HttpRequestService) {  
        this.subscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
            if (menuItem === "Add Camera"){
                this.initAddEditModal();
            }
        });
    }

    // Gets the list of user cameras and populates the Camera MENU Cards
    getCameraList() {
      this.httpRequestService.getAccess('api/camera')
      .subscribe(
        data => { this.userCameraList = this.userCameraList.concat(data); },
        err => { console.log(err); })
    }

    // Gets a single camera for editing and opens the edit modal
    editSingleCamera(sentCamera) {
      this.httpRequestService.getAccess(`api/camera/${sentCamera.cameraIdHash}/singlecamera`)
        .subscribe(
        data => {
            this.addEditCamera = data;
            this.addEditCamera.webAddress = this.addEditCamera.webAddress.slice(7);  // Removes the 'http://' from the edited Camera WebURL
            this.initAddEditModal();
        },
        err => { console.log(err); })
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
                // Add Expanded View Here
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

    // This is needed to submit a new camera or make a change to a current camera to the database
    submitCamera() {
      if (this.addEditCamera.name === "") {
          this.showAddEditError("Camera Requires a Unique Name");
          return false;
      }

      let userCamera = this.addEditCamera;
      userCamera.webAddress = "http://" + userCamera.webAddress;

      // If the camera doesn't have a CameraId, then it is a new camera and the Db will assign it a 
      //  new CameraId entry.
      if (userCamera.cameraId === null) {
          delete userCamera.cameraId;
      }

    let httpRequestConf: IHttpRequestConf = {
      apiPath: 'api/camera/addcamera',
      bodyData: JSON.stringify(userCamera),
      returnType: 'Json',
      specialHeaders: [{ 'Content-Type': 'application/json' }],
      withCredentials: true
    }

    this.httpRequestService.postAccess(httpRequestConf)
    .subscribe(
          data => {
            for (let i = 0; i < this.userCameraList.length; i++) {
              // If camera already exists, update the current camera element in array, otherwise add the new camera to array 
              if (data.cameraIdHash === this.userCameraList[i].cameraIdHash) {
                this.userCameraList[i] = data;
                this.resetAddEditCameraObject();
                return true;
              }
            } 
            this.userCameraList.push(data);   // If successfully added, Db returns the simplified "new" Camera.
            this.resetAddEditCameraObject();  // Clears the add/edit input box
            return true;
          },
          err => {
              this.showAddEditError("Error Adding Camera");
              return false;
          }
      );
    }

    // Resets the Add CameraObject after new camera is submitted
    // This can probably be done way better...
    resetAddEditCameraObject() {
      this.addEditCamera.cameraId = null,
      this.addEditCamera.name = "",
      this.addEditCamera.type = 0,
      this.addEditCamera.webAddress = "",
      this.addEditCamera.loginName = "",
      this.addEditCamera.loginPass = "",
      this.addEditCamera.private = 1,
      this.addEditCamera.location = ""
    }; 

    showAddEditError(sentErrorMessage: string) {
        this.addEditCameraError.hasError = true;
        this.addEditCameraError.message = sentErrorMessage;
    }

    // Initializes the Add/Edit Modal
    initAddEditModal() {
        this.addEditCameraError.hasError = false; // Clears any error messages
        $('.ui.modal.addcamera').modal({
            closable  : false,
            onDeny    : () => {
                this.resetAddEditCameraObject();
            },
            onApprove : () => this.submitCamera()
        }).modal('show');
    }
}
