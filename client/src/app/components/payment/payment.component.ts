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
  maxAmount: number = 0;
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
      result => {
        this.isLoadingResults = false;
        this.isInvoiceReady = true;
        this.isPaypalAllowed = result.user.credentials;
        this.data = result;
        this.payingAmount = result.sumToPay;
        this.maxAmount = result.sumToPay;
        this.canAuthorizePayment = true;
        if (this.isPaypalAllowed) {
          let items = [];
          for (let i = 0; i < result.content.length; i++)
            items.push({name: result.content[i].label, description: result.content[i].description, quantity: result.content[i].quantity, price: result.content[i].unitPriceET, tax: '0.00', sku: result.content[i].reference, currency: 'EUR'});

          this.paypalConfig = {
            env: 'sandbox',
            style: {
              label: 'pay',
              size:  'medium',
              shape: 'rect',
              color: 'blue'
            },
            client: {
              sandbox: result.user.credentials
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
                    custom: result.code,
                    payment_options: {
                      allowed_payment_method: 'INSTANT_FUNDING_SOURCE'
                    },
                    item_list: {
                      items: items,
                      shipping_address: {
                        recipient_name: result.customer.name,
                        line1: result.customer.address,
                        city: result.customer.town,
                        postal_code: result.customer.zipCode,
                        phone: result.customer.phone
                      }
                    }
                  }],
                  note_to_payer: result.comment
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
    if (this.canAuthorizePayment)
      this.canAuthorizePayment = this.payingAmount <= this.maxAmount;
  }
}
