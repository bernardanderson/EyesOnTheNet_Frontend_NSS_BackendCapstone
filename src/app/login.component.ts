import { Component } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

declare var $: any;

@Component({
  selector: 'login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  router: Router;

  serverIP: string = "192.168.0.229";
  loginError = {
    currentCount: 0,
    maxCount: 3
  };
  loginErrorMsg: string = "";

  constructor(private http: Http, router: Router) { 
    this.router = router;
  }

// Checks for the presence of the JWT key and if so skips the login.
  ngOnInit() {
    if (document.cookie.indexOf("access_token") !== -1) {
      console.log("Token Present!");
      this.router.navigateByUrl('/cameras');
    } else {
      console.log("Token Not Found!");
    }
  }

  getAuthorized(sentUserName: string, sentUserPassword: string) {
    var creds = "username=" + sentUserName + "&password=" + sentUserPassword;

    // Add method to check user name 
    // Add method to Check password length/strength

    this.loginError.currentCount++; 

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    this.http.post(`http://${this.serverIP}:5000/token`, creds, {
      headers: headers,
      }).map( res => this.extractData(res) )
      .subscribe(
        data => {
          data.name = sentUserName;
          this.cookieBuilder(data);
          this.loginError.currentCount = 0;
          this.router.navigateByUrl('/cameras');
        },
        err => {
          if (this.loginError.currentCount < this.loginError.maxCount) {
            this.loginErrorMsg = `Login Unsuccessful: ${this.loginError.currentCount} of ${this.loginError.maxCount} attempts remain`;
          } else {
            this.router.navigateByUrl('/register');
          }
        },
        () =>  console.log('Authentication Succeeded')
      );
  }

  showCam() {
    $('.cam-shower').html(`<img src='http://${this.serverIP}:5000/api/http' />`);
  }

  // Neat code to check to see if a post's response is text to then convert to Json. If not, it leaves it alone. 
  private extractData(res: Response) {
    let body;
    // check if empty, before call json
    if (res.text()) {
        body = res.json();
    }
    return body || {};
  }

  // This builds a cookie of the JWT parameters, and sets the user name too.
  private cookieBuilder(sentData) {
    let cookieExpires = new Date((Date.now() + (sentData.expires_in - 60) * 1000)).toUTCString();
    document.cookie = `Name=${sentData.name}; expires=${cookieExpires}"`;
    document.cookie = `access_token=${sentData.access_token}; expires=${cookieExpires}"`;
  }





}
