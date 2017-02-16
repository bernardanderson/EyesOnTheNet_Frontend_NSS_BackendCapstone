import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }  from '@angular/router';
// --------
import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { RegisterComponent }  from './register.component';
import { CameraDisplayComponent }  from './cameraDisplay.component';
import { DVRComponent } from './DVR.component';
import { TopMenuComponent } from './topmenu.component';
import { CameraSearchPipe } from './camerasearch.pipe';
import { HttpRequestService } from './httprequest.service';           // Houses all the Get/Post Request Methods


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    CameraDisplayComponent,
    CameraSearchPipe,
    DVRComponent,
    TopMenuComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'camera', redirectTo: 'camera/multicamera' },
      { path: 'camera/:id', component: CameraDisplayComponent },
      { path: 'camdvr', component: DVRComponent },
      { path: '**', redirectTo: ''}
    ])
  ],
  providers: [HttpRequestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
