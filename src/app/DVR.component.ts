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

    ngOnInit() {
        this.menuService.activateMenu(true);    // Shows the nav-menu on page load
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
 //               data => { this.cameraPhotoList = this.userCameraList.concat(data); },
                data => { 
                    console.log(data);
                    this.cameraPhotoList = data;
                    console.log(data);
                    },
                err => { console.log(err) })
    }

/*
    convertSecondsToReadableDate(sentSeconds) {
     let snapshotDate = new Date(1970, 0, 1); // UnixEpochTime
        snapshotDate.setSeconds(sentSeconds);
        return snapshotDate;
    }
*/    
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


}
