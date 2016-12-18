import { Injectable } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/map';
//
import { GlobalVariables } from './global';

declare var $: any;

export interface IHttpRequestConf {
  apiPath: string,
  bodyData: any,
  specialHeaders: {}[],
}

@Injectable()

export class HttpRequestService {
  constructor(private http: Http) { 
  }

  // This method is a universal POST method to simplify the overall code 
  public postAccess(sentHttpRequestConf: IHttpRequestConf) {

    // Looks to see if special headers are present, if so, create the headers and add them to the headers list 
    if (sentHttpRequestConf.specialHeaders.length > 0) {
      var headers = new Headers();
      
      for (let i = 0; i < sentHttpRequestConf.specialHeaders.length; i++) {
        let currentObject = sentHttpRequestConf.specialHeaders[i]
        headers.append(Object.keys(currentObject)[0], currentObject[Object.keys(currentObject)[0]]);
      }
    }

    // The actual post request
    return this.http.post(`http://${GlobalVariables.serverIP}/${sentHttpRequestConf.apiPath}`, sentHttpRequestConf.bodyData, {
      headers: headers,
      }).map( res => this.extractData(res) );
}

  // Checks to see if a post's response is text to then convert to Json. If not, it leaves it alone.
  private extractData(res: Response) {
    let body;
    if (res.text()) {
        body = res.json();
    }
    return body || {};
  }
}
