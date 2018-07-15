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
import { ItemsComponent } from './components/items/items.component';
import { ItemDialogComponent } from './components/dialogs/item-dialog/item-dialog.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ActivateComponent } from './components/activate/activate.component';
import { BillsComponent } from './components/bills/bills.component';
import { QuoteDialogComponent } from './components/dialogs/quote-dialog/quote-dialog.component';
import { InvoiceDialogComponent } from './components/dialogs/invoice-dialog/invoice-dialog.component';
import { IconPipe } from './pipes/icon.pipe';
export function tokenGetter() {
  return localStorage.getItem('access_token');
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    WelcomeComponent,
    DashboardComponent,
    ContactsComponent,
    NavigationComponent,
    SignupComponent,
    AlertComponent,
    CustomerDialogComponent,
    ProviderDialogComponent,
    ItemsComponent,
    ItemDialogComponent,
    PaymentComponent,
    ActivateComponent,
    BillsComponent,
    QuoteDialogComponent,
    InvoiceDialogComponent,
    IconPipe

  ],
  entryComponents: [CustomerDialogComponent, ProviderDialogComponent, ItemDialogComponent, QuoteDialogComponent, InvoiceDialogComponent],
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
