import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MediaMatcher} from "@angular/cdk/layout";
import {Router} from "@angular/router";
import {MatSelectChange, MatSidenav, MatSort} from "@angular/material";
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  mobileQuery: MediaQueryList;
  language: string = 'en';
  @ViewChild('snav') snav: MatSidenav;

  private _mobileQueryListener: () => void;

  constructor(public translate: TranslateService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  onLanguageChange(event: MatSelectChange){
    this.translate.use(this.language);
    localStorage.setItem('Localize', this.language);
  }
  ngOnInit() {
  }


}
