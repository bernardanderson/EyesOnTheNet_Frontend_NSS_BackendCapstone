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
    router: Router;

    menuSubscription: Subscription;            // Needed for menu communication
    refreshTimerClock: Subscription;       // For refresh timer subscription
    captureCamFeedClock: Subscription;     // For Cam Picture Capture subscription

    refreshinterval: number = 5000;        // For cam images refresh
    userCameraList: {
      cameraIdHash: number,
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
    
    currentSingleCamera: {          // The data member for the currently viewing single camera
        cameraIdHash: number,
        cameraURL: string,
        name: string,
        location: string,
        zoomLevel: number,
        googleMapURL: string
    } [] = [];

    recordingCameras: {
     } [] = [];              // Array of which cameras are currently being recorded
    
    serverRecordingCameras: {}[]=[]; // The array of cameras actually being recorded on the server


    ngOnInit() {
        this.menuService.activateMenu(true);    // Shows the nav-menu on page load
        this.getCameraList();                   // Pulls the users cameras on page load
    }

    // Prevents memory leakage when this view is destroyed
    ngOnDestroy() {
        this.menuSubscription.unsubscribe(); // Stops the menu Subscription 
    }

    // The formatted constructor receives the menu information when changed in parent
    constructor(private menuService: MenuService, private httpRequestService: HttpRequestService, router: Router) {  
        this.router = router;
        this.menuSubscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
            if (menuItem === "Add Camera"){
                this.resetAddEditCameraObject();
                this.initAddEditModal();
            }
            if (menuItem === "Record Feeds") {
                this.getCurrentlyRecordingCamerasFromServer();
                console.log("You loaded record")
            }
        });
    }

    // Gets the list of user cameras and populates the Camera MENU Cards
    getCameraList() {
      this.httpRequestService.getAccess('api/camera')
      .subscribe(
        data => { this.userCameraList = this.userCameraList.concat(data); },
        err => { })
    }

    // Gets a single camera for editing and opens the edit modal
    editSingleCamera(sentCamera) {
      this.httpRequestService.getAccess(`api/camera/${sentCamera.cameraIdHash}/singlecamera`)
        .subscribe(
        data => {
            this.resetAddEditCameraObject();
            this.addEditCamera = data;
            this.addEditCamera.webAddress = this.addEditCamera.webAddress.slice(7);  // Removes the 'http://' from the edited Camera WebURL
            this.initAddEditModal();
        },
        err => { })
    }

    // When a user selects a camera for viewing it gets added to the viewArray.
    //  If it's already being viewed, the IMG src string gets updated instead.
    addCamerasToView(sentCamera): boolean {
        if (this.router.url === "/camera/singlecamera") {
            this.singleCameraView(sentCamera);
            return true;
        } else if (this.router.url === "/camera/multicamera") {
            sentCamera.cameraURL =`http://${GlobalVariables.serverIP}/api/camera/${sentCamera.cameraIdHash}/snapshot?${new Date().getTime()}`;
            for (let i = 0; i < this.viewingCameras.length; i++) {
                if (sentCamera.cameraIdHash === this.viewingCameras[i].cameraIdHash) {
                    this.viewingCameras[i] = sentCamera
                    return true;       
                }
            }
            this.viewingCameras.push(sentCamera);
            return true;
        } else if (this.router.url === "/camera/record") {
            this.singleCameraToRecordingCamerasArray(sentCamera);
        }
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
        if (this.router.url === "/camera/singlecamera") {
            if (this.currentSingleCamera[0] !== undefined) {
                let tempUrlString = this.currentSingleCamera[0].cameraURL;
                tempUrlString = tempUrlString.slice(0, tempUrlString.indexOf("?"));
                this.currentSingleCamera[0].cameraURL = `${tempUrlString}?${new Date().getTime()}`;
            }
        } else if (this.router.url === "/camera/multicamera") {
            for(let i = 0; i < this.viewingCameras.length; i++) {
                let tempUrlString = this.viewingCameras[i].cameraURL;
                tempUrlString = tempUrlString.slice(0, tempUrlString.indexOf("?"));
                this.viewingCameras[i].cameraURL = `${tempUrlString}?${new Date().getTime()}`;
            }
        }
    }

    // The menu logic for each camera view
    camPicMenu(sentEvent, sentCamera) {
        let camMenuAction: string = "";
        if (sentEvent.target.className.includes("icon")) {
            camMenuAction = sentEvent.target.parentElement.innerText;
        } else {
            camMenuAction = sentEvent.target.innerText;
        }
        switch (camMenuAction) {
            case "Expand": 
                this.singleCameraView(sentCamera);
                break;
            case "Edit": 
                this.editSingleCamera(sentCamera);
                break;
            case "Close": 
                if (this.router.url === "/camera/singlecamera") {
                    this.currentSingleCamera.pop();
                } else if (this.router.url === "/camera/multicamera") {
                    this.viewingCameras.splice(this.viewingCameras.indexOf(sentCamera), 1);
                }
                break;
            case "Refresh":
                if (this.router.url === "/camera/singlecamera") {
                    this.refreshCamViewImages();
                } else if (this.router.url === "/camera/multicamera") {
                    this.addCamerasToView(sentCamera);
                }
                break;
            default:
                break;
        }
    }

    // Code for the Single Camera View
    singleCameraView(sentCamera) {
        let tempSingleCamera = JSON.parse(JSON.stringify(sentCamera));
        tempSingleCamera.cameraURL =`http://${GlobalVariables.serverIP}/api/camera/${tempSingleCamera.cameraIdHash}/snapshot?${new Date().getTime()}`;
        
        tempSingleCamera.zoomLevel = 7;

        tempSingleCamera.googleMapURL= `http://${GlobalVariables.serverIP}/api/camera/${tempSingleCamera.cameraIdHash}/${tempSingleCamera.zoomLevel}/googlemap?${new Date().getTime()}`;

        this.currentSingleCamera.splice(0, 1);
        this.currentSingleCamera.push(tempSingleCamera);
        this.router.navigateByUrl("/camera/singlecamera");
    }

    // Zooms the GoogleMap In and Out
    mapZoom(sentZoomDirection) {

      let tempSingleCamera = this.currentSingleCamera[0];

      if (sentZoomDirection === "out" && tempSingleCamera.zoomLevel > 0) {
        tempSingleCamera.zoomLevel--;
      } else if (sentZoomDirection === "in" && tempSingleCamera.zoomLevel < 17) {
        tempSingleCamera.zoomLevel++;
      }
        tempSingleCamera.googleMapURL = `http://${GlobalVariables.serverIP}/api/camera/${tempSingleCamera.cameraIdHash}/${tempSingleCamera.zoomLevel}/googlemap`;
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
              if (data.cameraIdHash == this.userCameraList[i].cameraIdHash) {
                this.userCameraList[i] = data;
                this.resetAddEditCameraObject();
                $('.ui.modal.addcamera').modal('hide');
                return true;
              }
            }
            this.resetAddEditCameraObject();
            $('.ui.modal.addcamera').modal('hide');
            this.userCameraList.push(data);   // If successfully added, Db returns the simplified "new" Camera.
            return true;
          },
          err => {
              this.showAddEditError("Error Adding Camera");
              return false;
          });
    }

    // For when you about the Submission of a camera Add/Edit
    abortCameraSubmit() {
        $('.ui.modal.addcamera').modal('hide');
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

    // Shows an Error when the Camera Add/Edit is incorrect
    showAddEditError(sentErrorMessage: string) {
        this.addEditCameraError.hasError = true;
        this.addEditCameraError.message = sentErrorMessage;
    }

    // Initializes the Add/Edit Modal
    initAddEditModal() {
        this.addEditCameraError.hasError = false; // Clears any error messages
        $('.ui.modal.addcamera').modal({
            closable  : false
        }).modal('show');
    }

    // Deletes a camera from the Db
    deleteCamera() {
        this.httpRequestService.deleteCamera(`api/camera/${this.addEditCamera.cameraId}`)
        .subscribe(
            data => {
                // With successful delete, removes camera from local availabilty list
                for (let i = 0; i < this.userCameraList.length; i++) {
                    if (this.userCameraList[i].cameraIdHash == data.cameraId) {
                        this.userCameraList.splice(i, 1);
                    }
                }
                // With successful delete, removes camera from viewing panel
                for (let i = 0; i < this.viewingCameras.length; i++) {
                    if (this.viewingCameras[i].cameraIdHash == data.cameraId) {
                        this.viewingCameras.splice(i, 1);
                    }
                }
                $('.ui.modal.addcamera').modal('hide');
            },
            err => {
                this.addEditCameraError = {
                    hasError: true,
                    message: "Camera Delete Failed"
                };
            })
    }


///////////

    getCurrentlyRecordingCamerasFromServer() {

        this.httpRequestService.getAccess(`api/camera/displaytasks`)
        .subscribe(
                data => this.recordingCameras = data,
                err => { }
    )}

    recordThisCamera(sentCamera) {

        let recordCamModel = {
            recordDelay: sentCamera.delay,
            recordingCameraId: sentCamera.cameraIdHash
        }

        let httpRequestConf: IHttpRequestConf = {
            apiPath: 'api/camera/recordcamera',
            bodyData: JSON.stringify(recordCamModel),
            returnType: 'Json',
            specialHeaders: [{ 'Content-Type': 'application/json' }],
            withCredentials: true
        }

        this.httpRequestService.postAccess(httpRequestConf)
            .subscribe(
            data => {
                console.log("Recording: ", data);
            },
                err => {
                console.log("Error: ", err);
                    
                 }
            );
  }

    // Adds or removes a single camera to/from the RecordingCameras Array
    singleCameraToRecordingCamerasArray(sentCameraToRecord) {
        sentCameraToRecord.delay = 0;

        if (this.recordingCameras.indexOf(sentCameraToRecord) === -1) {
            this.recordingCameras.push(sentCameraToRecord);
        } else {
            this.recordingCameras.splice(this.recordingCameras.indexOf(sentCameraToRecord), 1);
        }
}

    // Has the front end stop recording snapshots of the selected camera feeds
    stopRecordingCamera() {
        if (this.captureCamFeedClock !== undefined) {
            this.captureCamFeedClock.unsubscribe();
        }
    }

    //// May not need this
    // Starts the recording of Cameras
    singleSnapshotRecord(sentCamera) {
            this.httpRequestService.getAccess(`api/file/${sentCamera.cameraIdHash}`)
            .subscribe(
                data => { console.log(data) },
                err => { }
            )
    }
/////////

    // Used for replacing broken img [src] with a standard image
    brokenImg(event) {
        event.target.src = `http://${GlobalVariables.serverIP}/api/file/-1/dvrpics`;
    }

    //Checks if the input string in the record cameras field is a number or not
    isNaN(sentInput) {
        return Number.isNaN(Number(sentInput));
    }

}
