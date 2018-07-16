import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private translate: TranslateService) {
    let browserLang = translate.getBrowserLang();
    let selectedLang = localStorage.getItem('Localize');
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
    translate.use(browserLang);
    if(!selectedLang) localStorage.setItem('Localize',browserLang || 'en');
  }


}
