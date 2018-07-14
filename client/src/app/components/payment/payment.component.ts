import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = true;
  isInvoiceReady = false;
  errorMessage = '';
  paramUser: string;
  paramInvoice: string;
  data = new Observable();
  error = '';
  displayContent = ['reference', 'label', 'unitPriceET', 'quantity', 'discount', 'totalPriceET'];
  displayIncomes = ['method', 'amount', 'dateIncome'];

  constructor(private route: ActivatedRoute, public translate: TranslateService, private dataService : DataService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.paramUser = this.route.snapshot.params.user;
    this.paramInvoice = this.route.snapshot.params.invoice;
  }

  ngOnInit() {
    this.translate.use('fr');
    localStorage.setItem('Localize', 'fr');
    this.getInvoicePayment();
  }

  getInvoicePayment() {
    this.dataService.getInvoicePayment(this.paramUser, this.paramInvoice).subscribe(
      data => {
        this.isLoadingResults = false;
        this.isInvoiceReady = true;
        this.data = data;
      },
      error => {
        this.isLoadingResults = false;
        this.error =  error.error.message;
      }
    );
  }
}
