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

interface SimpleDvrPhotoElement {                // Holds the selected cameras DVR recordings 
    photoId: number,
    cameraName: string,
    apiUrl: string,
    dateString: string
    };

interface LargePhotoElement {                
        cameraId: number,
        cameraName: string,
        photoIdTime: {
            key: number,                        // key = photoId
            value: number                       // value = time in seconds
        }[]
        };

@Component({
    selector: 'dvr-view', 
    templateUrl: 'DVR.component.html',
    styleUrls: ['DVR.component.css']
})

export class DVRComponent implements OnInit, OnDestroy {  

// Properties

    router: Router;                
    menuSubscription: Subscription;    // Needed for menu communication

    completeElementPhotoList: LargePhotoElement[] = [];  // Holds all cameras returned from the BE

    cameraDvrFocusArray: SimpleDvrPhotoElement[] = [];   // Holds the array of photos for the selected camera
    
    enlargedElementVal: number = 0;                      // Element of Option for enlarging photo

    ngOnInit() {
        this.menuService.activateMenu(true);    
        this.loadCameraPhotos();    
    }

    // Prevents memory leakage when this view is destroyed
    ngOnDestroy() {
        this.menuSubscription.unsubscribe();
    }

    // The formatted constructor receives the menu information when changed in parent
    constructor(private menuService: MenuService, private httpRequestService: HttpRequestService, router: Router) {  
        this.router = router;
        this.menuSubscription = menuService.selectedMenuItem$.subscribe(
        menuItem => {
        });
    }

    // Gets all available recorded cameras and their photos
    loadCameraPhotos() {
        this.httpRequestService.getAccess('api/file/photolist')
            .subscribe(
                data => {
                    this.completeElementPhotoList = data;
                    },
                err => { console.log(err) })
    }
 
    // Converts the Unix time in seconds to and readable date
    convertSecondsToReadableDate(sentSeconds) {
        let snapshotDate = new Date(Date.UTC(1970, 0, 1)); 
        snapshotDate.setSeconds(sentSeconds);

        let options = {
            weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            timeZoneName: 'short'
        }
        let formattedDateString = new Intl.DateTimeFormat('en-US', options).format(snapshotDate);
        return formattedDateString;
    }

    // Cycles through the recorded cameras
    changeCameraArray(sentDirection) {
        if (sentDirection === "back"){
            this.completeElementPhotoList.unshift(this.completeElementPhotoList.pop());
        } else if (sentDirection === "forward") {
            this.completeElementPhotoList.push(this.completeElementPhotoList.shift());
        }
    }

    // Populates the array for viewing a single camera's recorded images
    viewCamSavedPhotos(sentSingleCamera) {
        this.enlargedElementVal = 0;        // Need to zero the dimmer image to account for arrays that are smaller than a previously viewed array 
        this.cameraDvrFocusArray = [];
        for (let i = 0; i < sentSingleCamera.photoIdTime.length; i++) {
            let dvrPic = {
                cameraName: sentSingleCamera.cameraName,
                photoId: sentSingleCamera.photoIdTime[i].key,
                elementNumber: i,
                apiUrl: `http://${GlobalVariables.serverIP}/api/file/${sentSingleCamera.photoIdTime[i].key}/dvrpics`,
                dateString: this.convertSecondsToReadableDate(sentSingleCamera.photoIdTime[i].value)
            }
        this.cameraDvrFocusArray.push(dvrPic);
        }
    }

    // Used for replacing broken img [src] with a standard image
    brokenImg(event) {
        event.target.src = `http://${GlobalVariables.serverIP}/api/file/-1/dvrpics`;
    }

    // Checks for the photo click events of Delete or Enlarge
    cardClickAction(event, sentCameraPhotoInfo, indexNumber) {
        let cardClickedOption: string = "";

        this.enlargedElementVal = 0;
        if (event.target.tagName === "I"){
            cardClickedOption = event.target.parentElement.innerText.substring(1);
        } else if (event.target.tagName === "A") {
            cardClickedOption = event.target.innerText.substring(1);
        }
     
        if (cardClickedOption === "Delete") {
            this.deleteCameraPicture(sentCameraPhotoInfo, indexNumber);
        } else if ( cardClickedOption === "Enlarge") {
            this.enlargedElementVal = indexNumber;
            $('.ui.four.column.grid').dimmer('show');
        }
    }

    // Deletes a camera from the Db
    deleteCameraPicture(sentCameraPhotoInfo, sentIndexNumber) {

        this.httpRequestService.deleteCamera(`api/file/${sentCameraPhotoInfo.photoId}`)
        .subscribe(
            data => {
                // Deletes the photo from the cameraArray
                this.cameraDvrFocusArray.splice(sentIndexNumber, 1);

                let cameraElement: LargePhotoElement = null;
                // Searches for the camera of the deleted photo in the complete photoarray
                for (let i = 0; i < this.completeElementPhotoList.length; i++) {
                    if (this.completeElementPhotoList[i].cameraName === sentCameraPhotoInfo.cameraName) {
                        cameraElement = this.completeElementPhotoList[i];

                        // Searches for the photo in the camera in the complete photoarray
                        for (let i = 0; i < cameraElement.photoIdTime.length; i++) {
                            if (cameraElement.photoIdTime[i].key === sentCameraPhotoInfo.photoId) {
                                cameraElement.photoIdTime.splice(i,1);

                                // If all photos are removed from the camera, that camera is removed from the viewable photos list 
                                if (cameraElement.photoIdTime.length === 0) {
                                    let index = this.completeElementPhotoList.indexOf(cameraElement);
                                    this.completeElementPhotoList.splice(index, 1);
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            },
            err => {
                console.log(err);
            })
    }

    // Hides the dimmer when a Photo is enlarged
    hideDimmer() {
        $('.ui.four.column.grid').dimmer('hide');
    }
}
