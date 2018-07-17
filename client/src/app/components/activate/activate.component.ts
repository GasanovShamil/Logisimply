import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {MediaMatcher} from "@angular/cdk/layout";
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = true;
  isUserValid = false;
  paramToken: string;
  data: any;
  errorMessage = '';

  constructor(private route: ActivatedRoute, public translate: TranslateService, private userService: UserService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.paramToken = this.route.snapshot.params.token;
  }

  ngOnInit() {
    this.activateUser();
  }

  activateUser() {
    this.userService.activate(this.paramToken).subscribe(
      data => {
        this.data = data;
        this.isLoadingResults = false;
        this.isUserValid = true;
      },
      error => {
        this.isLoadingResults = false;
        this.errorMessage =  error.error.message;
      }
    );
  }
}
