import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule} from './app.material.module';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClient} from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { UserService } from "./services/user.service";
import { LoginComponent } from './components/login/login.component';
import {AuthGuard} from './components/guards/auth-guard.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {MediaMatcher} from '@angular/cdk/layout';
import { ContactsComponent } from './components/contacts/contacts.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AuthService } from './services/auth.service';
import { SignupComponent } from './components/signup/signup.component';
import { AlertService } from './services/alert.service';
import { AlertComponent } from './components/alert/alert.component';
import { DataService } from './services/data.service';
import {JwtInterceptor} from "./helpers/jwt.interceptor";
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { CustomerDialogComponent } from './components/dialogs/customer-dialog/customer-dialog.component';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import { ProviderDialogComponent } from './components/dialogs/provider-dialog/provider-dialog.component';
export function tokenGetter() {
  return localStorage.getItem('access_token');
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DashboardComponent,
    ContactsComponent,
    NavigationComponent,
    SignupComponent,
    AlertComponent,
    CustomerDialogComponent,
    ProviderDialogComponent
  ],
  entryComponents: [CustomerDialogComponent, ProviderDialogComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    UserService,
    AuthGuard,
    MediaMatcher,
    AuthService,
    AlertService,
    DataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
platformBrowserDynamic().bootstrapModule(AppModule);
