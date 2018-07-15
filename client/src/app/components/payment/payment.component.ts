import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AlertService} from '../../services/alert.service';

declare let paypal: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewChecked {
  displayContent = ['reference', 'label', 'unitPriceET', 'quantity', 'discount', 'totalPriceET'];
  displayIncomes = ['method', 'amount', 'dateIncome'];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults: boolean = true;
  isInvoiceReady: boolean = false;
  isPaypalAllowed: boolean = false;
  canAuthorizePayment: boolean = false;
  addScript: boolean = true;
  paramUser: string;
  paramInvoice: string;
  data = new Observable();
  payingAmount: number = 0;
  errorMessage = '';
  paypalConfig = {};

  constructor(private route: ActivatedRoute, public translate: TranslateService, private alertService : AlertService, private dataService : DataService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
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

  ngAfterViewChecked(): void {
    if (this.isPaypalAllowed && this.addScript)
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#paypal-checkout-button');
      })
  }

  getInvoicePayment() {
    this.dataService.getInvoicePayment(this.paramUser, this.paramInvoice).subscribe(
      data => {
        this.isLoadingResults = false;
        this.isInvoiceReady = true;
        this.isPaypalAllowed = data.user.credentials && data.user.credentials != '';
        this.data = data;
        this.payingAmount = data.sumToPay;
        this.canAuthorizePayment = true;
        if (this.isPaypalAllowed) {
          let items = [{
            name: 'hat',
            description: 'Brown hat.',
            quantity: '5',
            price: '3',
            tax: '0.01',
            sku: '1',
            currency: 'USD'
          }, {
            name: 'handbag',
            description: 'Black handbag.',
            quantity: '1',
            price: '15',
            tax: '0.02',
            sku: 'product34',
            currency: 'USD'
          }];

          this.paypalConfig = {
            env: 'sandbox',
            client: {
              sandbox: data.user.credentials
            },
            commit: true,
            payment: function (data, actions) {
              return actions.payment.create({
                payment: {
                  intent: 'sale',
                  payer: {
                    payment_method: 'paypal'
                  },
                  redirect_urls: {
                    return_url: 'https://www.google.fr/search?q=salut&oq=salut&aqs=chrome..69i57j69i61j35i39l2j0l2.719j0j7&sourceid=chrome&ie=UTF-8'
                  },
                  transactions: [{
                    amount: {
                      total: document.getElementById('paying-amount').value,
                      currency: 'EUR',
                      details: {
                        subtotal: document.getElementById('paying-amount').value,
                        tax: '0.00',
                        shipping: '0.00',
                        handling_fee: '0.00',
                        shipping_discount: '0.00',
                        insurance: '0.00'
                      }
                    },
                    description: 'The payment transaction description.',
                    custom: data.code,
                    payment_options: {
                      allowed_payment_method: 'INSTANT_FUNDING_SOURCE'
                    },
                    soft_descriptor: 'ECHI5786786',
                    item_list: {
                      items: items,
                      shipping_address: {
                        recipient_name: data.user.name,
                        line1: data.user.address,
                        city: data.user.town,
                        postal_code: data.user.zipCode,
                        phone: data.user.phone
                      }
                    }
                  }],
                  note_to_payer: data.comment
                }
              }).catch(error => {
                alert('ERROR AUTHORIZE');
              });
            },
            onAuthorize: function (data, actions) {
              return actions.payment.execute().then(payment => {
                alert('SUCCESS AUTHORIZE');
              }).catch(error => {
                alert('ERROR AUTHORIZE');
              });
            }
          };
        }
      },
      error => {
        this.isLoadingResults = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  addPaypalScript() {
    this.addScript = false;
    return new Promise((resolve, reject) => {
      let scriptTagElement = document.createElement('script');
      scriptTagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    })
  }

  checkPayingAmount() {
    this.canAuthorizePayment = !isNaN(this.payingAmount);
  }
}
