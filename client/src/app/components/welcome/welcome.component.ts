import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Customer} from "../../models/customer";
import {CustomerDialogComponent} from "../dialogs/customer-dialog/customer-dialog.component";
import {MediaMatcher} from "@angular/cdk/layout";
import {MatDialog} from "@angular/material";
import {AlertService} from "../../services/alert.service";
import {SignupDialogComponent} from "../dialogs/signup-dialog/signup-dialog.component";
import {Router} from "@angular/router";
import {LoginDialogComponent} from "../dialogs/login-dialog/login-dialog.component";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(private auth: AuthService, private router: Router,changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public dialog: MatDialog, private alertService: AlertService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }

  openSignupDialog(): void {
    let mobileDevice: boolean = this.mobileQuery.matches;
    let config = mobileDevice? {background: '#fafafa', maxWidth: '100%', minWidth: '100px'}:{width: '600px'};
    let dialogRef = this.dialog.open(SignupDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alertService.success(result.message);
      }
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
}
