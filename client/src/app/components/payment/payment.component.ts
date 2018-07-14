import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {AlertService} from "../../services/alert.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = false;
  errorMessage = '';
  paramUser: string;
  paramInvoice: string;
  data = {};
  displayContent = ['reference', 'label', 'description', 'unitPriceET', 'quantity', 'discount', 'totalPriceET'];
  displayIncomes = ['method', 'amount', 'dateIncome'];
  content = [
    {reference: '00001', label: 'Produit 1', description: 'Description P1', unitPriceET: 1, quantity: 1, discount: 1, totalPriceET: 0},
    {reference: '00002', label: 'Service 1', description: 'Description S1', unitPriceET: 2, quantity: 2, discount: 2, totalPriceET: 2},
    {reference: '00003', label: 'Produit 2', description: 'Description P2', unitPriceET: 3, quantity: 3, discount: 3, totalPriceET: 6},
    {reference: '00004', label: 'Produit 3', description: 'Description P3', unitPriceET: 4, quantity: 4, discount: 4, totalPriceET: 12},
    {reference: '00005', label: 'Service 2', description: 'Description S2', unitPriceET: 5, quantity: 5, discount: 5, totalPriceET: 20}
  ];
  incomes = [
    {method: 'asset', amount: 15, dateIncome: '11/07/2018'},
    {method: 'paypal', amount: 10, dateIncome: '11/07/2018'},
    {method: 'paypal', amount: 10, dateIncome: '11/07/2018'}
  ];

  constructor(private route: ActivatedRoute, public translate: TranslateService, private dataService : DataService, private alertService: AlertService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.paramUser = this.route.snapshot.params.user;
    this.paramInvoice = this.route.snapshot.params.invoice;
  }

  ngOnInit() {
    this.getInvoicePayment();
  }

  getInvoicePayment() {
    this.isLoadingResults = true;
    this.dataService.getInvoicePayment(this.paramUser, this.paramInvoice).subscribe(
      data => {
        this.data = data;
        this.isLoadingResults = false;
        this.alertService.success("YEAH");
      },
      error => {
        this.isLoadingResults = false;
        this.alertService.error(error.error.message);
      }
    );
  }
}
