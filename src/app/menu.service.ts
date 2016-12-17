import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()

export class MenuService {
  
// Observable string sources
  private selectedMenuItem = new Subject<string>();
  private showMenu = new Subject<boolean>();

// Observable string streams
  selectedMenuItem$ = this.selectedMenuItem.asObservable();
  showMenu$ = this.showMenu.asObservable();

// Service message commands

  // For parent menu to tell chlidren what has been selected
  annouceMenuItem(menuItem: string){
    this.selectedMenuItem.next(menuItem);
  }

  // To get menu activation from children
  activateMenu(menuActive: boolean) {
    this.showMenu.next(menuActive);
  }
}