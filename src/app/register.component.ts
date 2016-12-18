import { Component } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
//
import { HttpRequestService, IHttpRequestConf } from './httprequest.service';
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

  constructor(private http: Http, router: Router, private httpRequestService: HttpRequestService) { 
    this.router = router;
  }

  postRegisteration(sentUserName: string, sentUserPassword: string, sentUserEmail: string) {

    let httpRequestConf: IHttpRequestConf = {
      apiPath: 'api/registration',
      bodyData: JSON.stringify({ Username:sentUserName, Password:sentUserPassword, Email:sentUserEmail}),
      returnType: 'text', // Needs return type text for proper completion
      specialHeaders: [
        { 'Content-Type': 'application/json' },
        { 'Access-Control-Allow-Origin': '*' }
      ]
    }

    this.httpRequestService.postAccess(httpRequestConf).subscribe(
        data => { this.router.navigateByUrl('/') },
        err => {
          this.registerError.registerMsg = err._body;
          this.registerError.anError = true;    
        }
      );
  }
}