import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from "./components/guards/auth-guard.guard";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {ContactComponent} from "./components/contact/contact.component";
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', canActivate: [AuthGuard], component: HomeComponent,
    children: [
      {path: '', canActivate: [AuthGuard], redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [AuthGuard], component: DashboardComponent},
      { path: 'contact', canActivate: [AuthGuard], component: ContactComponent}
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
