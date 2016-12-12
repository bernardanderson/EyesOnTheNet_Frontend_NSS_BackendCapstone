import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()

export class MenuService {
  
// Observable string sources
  private selectedMenuItem = new Subject<string>();
  private currentRouteItem = new Subject<string>();
  

// Observable string streams
  //selectedUri$ = this.selectedUri.asObservable();
  //currentUri$ = this.currentUri.asObservable();
  selectedMenuItem$ = this.selectedMenuItem.asObservable();
  currentRouteItem$ = this.currentRouteItem.asObservable();

// Service message commands
  
  // For sending children -> parent, URI change
  //selectUri(uri: string) {
  //  this.selectedUri.next(uri);
  //}

  // Might not need this
  //enabledUri(uri: string) {
  //  this.currentUri.next(uri);
  //}

  // For parent menu to tell chlidren what has been selected
  annouceMenuItem(menuItem: string){
    this.selectedMenuItem.next(menuItem);
  }
}