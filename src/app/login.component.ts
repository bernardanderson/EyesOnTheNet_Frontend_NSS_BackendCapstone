import { Component } from '@angular/core';
import { Router } from '@angular/router';
//
import { HttpRequestService, IHttpRequestConf } from './httprequest.service';
import { GlobalVariables } from './global';

declare var $: any;

@Component({
  selector: 'login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent {

  router: Router;
  
  loginError = {
    currentCount:  0,
    maxCount: 3,
    loginErrorMsg: ""
  };

  constructor(router: Router, private httpRequestService: HttpRequestService) { 
    this.router = router;
  }

  // Checks for the presence of the JWT key and if so skips the login.
  ngOnInit() {
    if (document.cookie.indexOf("access_token") !== -1) {
      this.router.navigateByUrl("/camera");
    }
  }

  postAuthorization(sentUserName: string, sentUserPassword: string) {

    let httpRequestConf: IHttpRequestConf = {
      apiPath: 'token',
      bodyData: `username=${sentUserName}&password=${sentUserPassword}`,
      returnType: 'text',
      specialHeaders: [{ 'Content-Type': 'application/x-www-form-urlencoded' }],
      withCredentials: true  // this needs to be true or the browser won't get the returned cookie
    }

    this.httpRequestService.postAccess(httpRequestConf).subscribe(
      data => {
        this.router.navigateByUrl("/camera/multicamera");
      },
      err => {
        this.loginError.currentCount++; 
        if (this.loginError.currentCount < this.loginError.maxCount) {
          this.loginError.loginErrorMsg 
            = `Login failed: ${this.loginError.currentCount} of ${this.loginError.maxCount} attempts remain`;
        } else {
          this.router.navigateByUrl('/register');
        }
    });
  }

  // This builds a cookie of the JWT parameters, and sets the user name too.
  private cookieBuilder(sentJWT) {
    let cookieExpires = new Date((Date.now() + (sentJWT.expires_in - 60) * 1000)).toUTCString();
    document.cookie = `access_token=${sentJWT.access_token}; expires=${cookieExpires}"`;
  }
}
