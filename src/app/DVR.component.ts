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
    elementNumber: number,
    cameraName: string,
    apiUrl: string,
    dateString: string
    };

interface LargePhotoElement {                
        cameraId: number,
        cameraName: string,
        photoIdTime: {
            key: number,
            value: number
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
    cameraPhotoList: LargePhotoElement[] = [];           // Element for the three item camera list 

    completeDvrFocusArray: SimpleDvrPhotoElement[] = []; // Holds the array of photos for the selected camera
    cameraDvrFocusArray: SimpleDvrPhotoElement[] = [];   // Element for the ten item photo list
    
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
                    this.setThreeElementCameraArray(); 
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

    // Initially builds the three camera array 
    setThreeElementCameraArray() {
        if (this.completeElementPhotoList.length < 3) {
            for (let i = 0; i < this.completeElementPhotoList.length; i++ ) {
                this.cameraPhotoList.push(this.completeElementPhotoList[i]);
            }
        } else if (this.completeElementPhotoList.length > 3) {
            for (let i = 0; i < 3; i++ ) {
                this.cameraPhotoList.push(this.completeElementPhotoList[0]);
                this.completeElementPhotoList.push(this.completeElementPhotoList.shift());
            }
        }
    }

    setEightElementCameraArray() {
        if (this.completeElementPhotoList.length < 8) {
            for (let i = 0; i < this.completeElementPhotoList.length; i++ ) {
                this.cameraPhotoList.push(this.completeElementPhotoList[i]);
            }
        } else if (this.completeElementPhotoList.length > 3) {
            for (let i = 0; i < 3; i++ ) {
                this.cameraPhotoList.push(this.completeElementPhotoList[0]);
                this.completeElementPhotoList.push(this.completeElementPhotoList.shift());
            }
        }
    }

    // Cycles through the recorded cameras to only keep three viewable at a time
    changeCameraArray(sentDirection) {
        if (this.completeElementPhotoList.length > 3) {
            if (sentDirection === "back"){
                this.cameraPhotoList.pop();
                let firstElementIndex = this.completeElementPhotoList.indexOf(this.cameraPhotoList[0]);

                this.cameraPhotoList.unshift(this.completeElementPhotoList[firstElementIndex - 1])
                this.completeElementPhotoList.unshift(this.completeElementPhotoList.pop());
            } else if (sentDirection === "forward") {
                let tempShift = this.cameraPhotoList.shift();
                this.cameraPhotoList.push(this.completeElementPhotoList[0]);
                this.completeElementPhotoList.push(this.completeElementPhotoList.shift());
            }
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

    // Checks for the photo events of Delete or Enlarge
    cardClickAction(event, sentCameraPhotoInfo) {
        let cardClickedOption: string = "";
        this.enlargedElementVal = 0;
        if (event.target.tagName === "I"){
            cardClickedOption = event.target.parentElement.innerText.substring(1);
        } else if (event.target.tagName === "A") {
            cardClickedOption = event.target.innerText.substring(1);
        }
     
        if (cardClickedOption === "Delete") {
            console.log("You clicked Delete");
        } else if ( cardClickedOption === "Enlarge") {
            this.enlargedElementVal = sentCameraPhotoInfo.elementNumber;
            $('.ui.four.column.grid').dimmer('show');
        }
    }

    // Hides the dimmer when a Photo is enlarged
    hideDimmer() {
        $('.ui.four.column.grid').dimmer('hide');
    }
}
