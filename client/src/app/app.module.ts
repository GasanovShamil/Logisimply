import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule} from './app.material.module';


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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DashboardComponent,
    ContactsComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    AppRoutingModule
  ],
  providers: [
    UserService,
    AuthGuard,
    MediaMatcher
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
