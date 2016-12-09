import { Component } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/map';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  title: string = 'app works and is even better!';
  serverIP: string = "192.168.0.229";
  
  constructor(private http: Http) {
  }

  getAuthorized(sentUserName: string, sentUserPassword: string) {
    var creds = "username=" + sentUserName + "&password=" + sentUserPassword;
    var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');

    this.http.post(`http://${this.serverIP}:5000/token`, creds, {
      headers: headers,
      }).map( res => this.extractData(res) )
      .subscribe(
        data => {
          data.name = sentUserName;
          this.cookieBuilder(data);
          console.log(data);
        },
        err => console.log('Err: ' + err),
        () =>  console.log('Authentication Complete')
      );
  }

  showCam() {
    $('.cam-shower').html(`<img src='http://${this.serverIP}:5000/api/http' />`);
  }

  // Neat code to check to see if a post's response is text to them convert to Json. If not, it leaves it alone. 
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
