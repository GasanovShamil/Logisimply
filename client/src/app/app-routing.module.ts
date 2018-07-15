import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {AppComponent} from './app.component';
import {AuthGuard} from "./components/guards/auth-guard.guard";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {ContactsComponent} from "./components/contacts/contacts.component";
import {NavigationComponent} from "./components/navigation/navigation.component";
import {ItemsComponent} from "./components/items/items.component";
import {WelcomeComponent} from "./components/welcome/welcome.component";
import {ActivateComponent} from "./components/activate/activate.component";
import {PaymentComponent} from "./components/payment/payment.component";
import {BillsComponent} from "./components/bills/bills.component";
import {LegalNoticeComponent} from "./components/legal-notice/legal-notice.component";
import {GrpdComponent} from "./components/grpd/grpd.component";
const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'payment/:user/:invoice', component: PaymentComponent },
  { path: 'notice', component: LegalNoticeComponent },
  { path: 'grpd', component: GrpdComponent },
  {
    path: '', canActivate: [AuthGuard], component: NavigationComponent,
    children: [
      { path: '', canActivate: [AuthGuard], redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', canActivate: [AuthGuard], component: HomeComponent},
      { path: 'dashboard', canActivate: [AuthGuard], component: DashboardComponent},
      { path: 'contacts', canActivate: [AuthGuard], component: ContactsComponent},
      { path: 'items', canActivate: [AuthGuard], component: ItemsComponent},
      { path: 'bills', canActivate: [AuthGuard], component: BillsComponent}
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
//
// { path: 'login', component: LoginComponent },
// { path: 'logout', canActivate: [AuthGuard], component: LogoutComponent },
// {
//   path: '', canActivate: [AuthGuard], component: HomeComponent,
//   children: [
//   { path: '', canActivate: [AuthGuard], component: SalesComponent },
//   { path: 'sales', canActivate: [AuthGuard], component: SalesComponent },
//   { path: 'projects', canActivate: [AuthGuard], component: ProjectsComponent },
// ]
// }
