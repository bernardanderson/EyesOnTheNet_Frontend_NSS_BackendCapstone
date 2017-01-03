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
        apiUrl: string,
        dateString: string
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

    cameraPhotoList: {                 // Tracks the saved photos sent from the BE
        cameraId: number,
        cameraName: string,
        photoIdTime: {
            key: number,
            value: number
        }[]
        }[] = [];

    cameraDvrFocusArray: SimpleDvrPhotoElement[] = [];
    enlargedElementVal: number = 0; // Element of Option for enlarging photo

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

    loadCameraPhotos() {
        this.httpRequestService.getAccess('api/file/photolist')
            .subscribe(
                data => { 
                    this.cameraPhotoList = data;
                    },
                err => { console.log(err) })
    }
 
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

    // Populates the array for viewing a single camera's recorded images
    viewCamSavedPhotos(sentSingleCamera) {
        this.cameraDvrFocusArray = [];
        for (let i = 0; i < sentSingleCamera.photoIdTime.length; i++) {
            let dvrPic = {
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

    hideDimmer() {
        $('.ui.four.column.grid').dimmer('hide');
    }

}
