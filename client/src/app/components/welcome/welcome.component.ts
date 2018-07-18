import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Customer} from "../../models/customer";
import {CustomerDialogComponent} from "../dialogs/customer-dialog/customer-dialog.component";
import {MediaMatcher} from "@angular/cdk/layout";
import {MatDialog, MatTableDataSource} from "@angular/material";
import {AlertService} from "../../services/alert.service";
import {SignupDialogComponent} from "../dialogs/signup-dialog/signup-dialog.component";
import {Router} from "@angular/router";
import {LoginDialogComponent} from "../dialogs/login-dialog/login-dialog.component";
import {AuthService} from "../../services/auth.service";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, AfterViewChecked {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  addScript: boolean = true
  isLogged: boolean = this.authService.isLogedIn();
  contactName: string = '';
  contactEmail: string = '';
  contactMessage: string = '';

  constructor(private auth: AuthService, private router: Router, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public dialog: MatDialog, private authService: AuthService, private alertService: AlertService, private dataService: DataService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }

  ngAfterViewChecked(): void {
    if (this.addScript)
      this.addJSScript().then(() => {
        this.addBoostrapScript().then(() => {});
        this.addEasingJqueryScript().then(() => {});
        this.addTemplateJSScript().then(() => {});
      });
  }

  addJSScript() {
    this.addScript = false;
    return new Promise((resolve, reject) => {
      let scriptTagElement = document.createElement('script');
      scriptTagElement.src = 'https://code.jquery.com/jquery-3.3.1.min.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    })
  }

  addBoostrapScript() {
    this.addScript = false;
    return new Promise((resolve, reject) => {
      let scriptTagElement = document.createElement('script');
      scriptTagElement.src = '/assets/js/bootstrap.bundle.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    })
  }

  addEasingJqueryScript() {
    this.addScript = false;
    return new Promise((resolve, reject) => {
      let scriptTagElement = document.createElement('script');
      scriptTagElement.src = '/assets/js/jquery.easing.min.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    })
  }

  addTemplateJSScript() {
    this.addScript = false;
    return new Promise((resolve, reject) => {
      let scriptTagElement = document.createElement('script');
      scriptTagElement.src = '/assets/js/agency.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    })
  }

  openSignupDialog(): void {
    let mobileDevice: boolean = this.mobileQuery.matches;
    let config = mobileDevice? {background: '#fafafa', maxWidth: '100%', minWidth: '100px'}:{width: '600px'};
    let dialogRef = this.dialog.open(SignupDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.alertService.success(result.message);
    });
  }

  openLoginDialog(): void {
    if (this.auth.isLogedIn()) {
      this.router.navigate(['/']);
    } else {
      let config = {background: '#fafafa', maxWidth: '300px'};
      let dialogRef = this.dialog.open(LoginDialogComponent, config);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  contact() {
    let infos = {
      name: this.contactName,
      email: this.contactEmail,
      message: this.contactMessage
    };

    this.dataService.contact(infos).subscribe(
      data => {
        this.alertService.success(data.message);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }
}
