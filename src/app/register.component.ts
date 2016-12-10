import { Component } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

declare var $: any;

@Component({
    selector: 'register-view', 
    templateUrl: 'register.component.html',
    styleUrls: ['register.component.css'],
})

export class RegisterComponent {

  router: Router;

  serverIP: string = "192.168.0.229";
  registerErrorMsg: string = "";

  constructor(private http: Http, router: Router) { 
    this.router = router;
  }

  getRegistered(sentUserName: string, sentUserPassword: string, sentUserEmail: string) {
    let newJsonCreds = JSON.stringify({
        userName: sentUserName,
        password: sentUserPassword,
        email: sentUserEmail
    });

/*
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(`http://${this.serverIP}:5000/api/register`, newJsonCreds, {
      headers: headers,
      }).map( res => this.extractData(res) )
      .subscribe(
        data => {
          this.router.navigateByUrl('/');
        },
        err => {},
        () =>  console.log('Authentication Succeeded')
      );
*/
  }

  private extractData(res: Response) {
    let body;
    // check if empty, before call json
    if (res.text()) {
        body = res.json();
    }
    return body || {};
  }
}
