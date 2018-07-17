import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatIconRegistry} from "@angular/material";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private translate: TranslateService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'pdf',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pdf.svg'));
    iconRegistry.addSvgIcon(
      'paypal',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/paypal.svg'));
    iconRegistry.addSvgIcon(
      'en',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/en.svg'));
    iconRegistry.addSvgIcon(
      'fr',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/fr.svg')
    );
    iconRegistry.addSvgIcon(
      'ru',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ru.svg')
    );
    iconRegistry.addSvgIcon(
      'income',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/income.svg')
    );
    let browserLang = translate.getBrowserLang();
    let selectedLang = localStorage.getItem('Localize');
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
    translate.use(browserLang);
    if(!selectedLang) localStorage.setItem('Localize',browserLang || 'en');
  }


}
