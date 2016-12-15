import { Component } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
//
import { GlobalVariables } from './global';

declare var $: any;

@Component({
    selector: 'register-view', 
    templateUrl: 'register.component.html',
    styleUrls: ['register.component.css'],
})

export class RegisterComponent {

  router: Router;

  registerError = {
    anError: false,
    registerMsg: ""
  };

  constructor(private http: Http, router: Router) { 
    this.router = router;
  }

  getRegistered(sentUserName: string, sentUserPassword: string, sentUserEmail: string) {
    let regCreds = JSON.stringify({
      Username: sentUserName,
      Password: sentUserPassword,
      Email: sentUserEmail
    });

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

    this.http.post(`http://${GlobalVariables.serverIP}/api/registration`, regCreds, {
      headers: headers,
      }).map( res => res.text() )
      .subscribe(
        data => {
          //this.registerError.registerMsg = data;
          this.router.navigateByUrl('/');
        },
        err => {
          console.log(err);
          this.registerError.registerMsg = err._body;
          this.registerError.anError = true;          
        }
      );
  }
}
