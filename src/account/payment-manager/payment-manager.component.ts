import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { Component, OnInit, ViewEncapsulation, Injectable, Injector } from '@angular/core';
import { PaymentMethod } from '@shared/AppEnums';
import { AppConsts } from '@shared/AppConsts';
import { Decimal } from 'decimal.js';

import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './payment-manager.component.html',
  styleUrls: ['./payment-manager.component.less'],
  encapsulation: ViewEncapsulation.None,
  animations: [accountModuleAnimation()]
})

export class PaymentManagerComponent extends AppComponentBase implements OnInit {

  isPageLoading: boolean;
  isLoading = false;
  paymentID: string;
  selectedPaymentMethod: PaymentMethod;
  paymentMethod = PaymentMethod;

  termCheck = false;
  payButton = false;
  paying = false;

  transHelper: any = {};
  inputHelper: any = {};

  totalAmount: string;

  bankListShow = false;
  personalBank: any[] = [];
  corpBank: any[] = [];
  bankListModel: any;
  bankLoading: boolean;
  checkSum: string;

  fpxModel: any = {};
  creditCardModel: any = {};

  paymentType: string;

  dateToday = moment(new Date()).format('YYYYMMDDHHmmss');

  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _proxy: GenericServiceProxy,
    private _router: Router,
    private _storage: AppStorage,
    private _httpService: HttpClient
  ) {
    super(injector);
  }

  ngOnInit() {
    this.checkFPXBankList();
    this.preJsFunction();

    this._activatedRoute.queryParams
      .subscribe(params => {
        params.trx === undefined ? this.paymentID = undefined : this.paymentID = params.trx;
      });

    this.getPaymentInfo();
  }

  getPaymentInfo() {
    this.isPageLoading = true;
    let url = ProxyURL.GetPayment;
    url += 'PaymentTransID=' + encodeURIComponent(this.paymentID);

    if (url !== null && this.paymentID !== undefined) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => this.isPageLoading = false))
        .subscribe((result) => {
          console.log('Res: ' + JSON.stringify(result));
          this.transHelper = result.items;
        });
    }
  }

  onPaymentMethodChange(selectedPaymentMethod) {
    this.selectedPaymentMethod = selectedPaymentMethod;
  }

  checkFPXBankList() {
    this._httpService.get(this.appUrlService.appRootUrl + 'assets/banklist.json').subscribe(
      (result) => {
        let res = JSON.parse(JSON.stringify(result));
        //console.log('FPX Bank List: ' + res);
        let lastCheck = moment(res.LastCheck);
        let hours = moment().diff(lastCheck, 'hours');
        if ((res.PersonalBank.length === 0 || res.CorporateBank.length === 0) || (res.LastCheck === null || hours >= 24)) {
          this.getBankList();
        } else {
          this.personalBank = res.PersonalBank;
          this.corpBank = res.CorporateBank;
        }
      });
  }

  selectBank(msgToken: string): void {
    this.isLoading = true;
    //this.payButton = true;
    //this.term = false;
    this.bankListModel = [];

    if (msgToken === '01' && this.transHelper.TransTotalAmt <= 30000) {
      //this.maxTotal = false;
      this.bankListShow = true;
      this.bankListModel = this.personalBank;
      this.fpxModel.fpx_msgToken = '01';
      this.isLoading = false;
    } else if ( msgToken === '02' && this.transHelper.TransTotalAmt <= 30000) {
      //this.maxTotal = false;
      this.bankListShow = true;
      this.bankListModel = this.corpBank;
      this.fpxModel.fpx_msgToken = '02';
      this.isLoading = false;
    } else if (msgToken === '02' && this.transHelper.TransTotalAmt >= 30000) {
      //this.maxTotal = false;
      this.bankListShow = true;
      this.bankListModel = this.corpBank;
      this.fpxModel.fpx_msgToken = '02';
      this.isLoading = false;
    } else {
      //this.term = false;
      this.bankListShow = false;
      //this.maxTotal = true;
      this.isLoading = false;
    }
  }

  getBankList() {
    this.isLoading = true;
    this.bankLoading = true;

    let url = ProxyURL.SaveBankListToJson;

    if (url !== undefined) {
      this._proxy.request(url, RequestType.Post, '')
        .pipe(finalize(() => {
          this.isLoading = false;
          this.bankLoading = false;
        }))
        .subscribe(result => {
          if (result.success === true) {
            this.notify.success(this.l('BankListUpdated'));
            this.checkFPXBankList();
            //this.payButton = true;
          } else {
            this.notify.success(this.l('BankListUpdateFailed'));
            //this.payButton = true;
          }
        });
    }
  }

  bankListChange(bank?: any): void {
    this.setFPXDetails();
    this.fpxModel.fpx_buyerBankId = bank.bankcode;
    this.fpxModel.fpx_buyerBankBranch = '';

    let url = ProxyURL.GetFPXCheckSum;
    if (url !== undefined) {
      this._proxy.request(url, RequestType.Post, this.fpxModel)
        .subscribe((result) => {
          this.fpxModel.fpx_checkSum = result.checksum;
          this.checkSum = result.checksumData;
          this.payButton = true;
          //this.term = true;
        });
    }
  }

  setFPXDetails(data?: any) {
    this.fpxModel.fpx_msgType = 'AE';
    //this.fpxModel.fpx_msgToken = '01';
    this.fpxModel.fpx_sellerExId = AppConsts.FPX.sellerExId; // 'EX00003925';
    this.fpxModel.fpx_sellerExOrderNo = this.dateToday;
    this.fpxModel.fpx_sellerOrderNo = this.dateToday;
    this.fpxModel.fpx_sellerTxnTime = this.dateToday;
    this.fpxModel.fpx_sellerId = AppConsts.FPX.sellerId; // 'SE00004392';
    this.fpxModel.fpx_sellerBankCode = AppConsts.FPX.sellerBankCode; // '01';
    this.fpxModel.fpx_txnCurrency = AppConsts.FPX.txnCurrency; // 'MYR';
    this.fpxModel.fpx_txnAmount = new Decimal(this.transHelper.TransTotalAmt).toFixed(2);
    this.fpxModel.fpx_buyerEmail = this._storage.email; // 'charis@collexe.asia';
    this.fpxModel.fpx_buyerId = this.inputHelper.customerno;
    this.fpxModel.fpx_buyerName = this.inputHelper.customer; //'Charis'; //
    this.fpxModel.fpx_buyerAccNo = '';
    this.fpxModel.fpx_makerName = 'CX Payment Manager';
    this.fpxModel.fpx_buyerIban = '';
    this.fpxModel.fpx_productDesc = 'CX Pay ' + this.transHelper.PaymentTransID;
    this.fpxModel.fpx_version = AppConsts.FPX.version; // '6.0';
  }

  setCreditCardDetails(data?: any) {
    this.creditCardModel.mmerchant_acc_no = AppConsts.CreditCard.MayBank.MBBCCMerchantAccount_eL;
    this.creditCardModel.amount = new Decimal(this.transHelper.TransTotalAmt).toFixed(2);
    this.creditCardModel.transaction_type = '3';
    this.creditCardModel.merchant_tranid = this.dateToday;
    this.creditCardModel.transaction_id = this.dateToday;
    this.creditCardModel.response_type = 'HTTP';
    this.creditCardModel.return_url = AppConsts.CreditCard.MayBank.MBBReturnURL;
    this.creditCardModel.txn_desc = 'LGM Payment ' + this.transHelper.PaymentTransID;
    this.creditCardModel.customer_id = this.inputHelper.customerno;
    this.creditCardModel.fr_highrisk_email = this._storage.email; //'charis@collexe.asia';
    this.creditCardModel.fr_highrisk_country = '';
    this.creditCardModel.fr_billing_address = '';
    this.creditCardModel.fr_shipping_address = '';
    this.creditCardModel.fr_shipping_cost = '';
    this.creditCardModel.fr_purchase_hour = '';
    this.creditCardModel.fr_customer_ip = '';
    this.creditCardModel.txn_signature = '';
  }

  saveTransaction(): void {
    let paymentTender: any = {};
    let paymentLog: any = {};
    let paymentTenderList: any[] = [];
    let paymentLogList: any[] = [];

    paymentTender.BizRegID = this.transHelper.BizRegID;
    paymentTender.BizLocID = this.transHelper.BizLocID;
    paymentTender.PaymentTransID = this.transHelper.PaymentTransID;
    paymentTender.TenderID = this.dateToday;
    paymentTender.TenderCode = this.selectedPaymentMethod === this.paymentMethod.PayFPX ? '997' : this.selectedPaymentMethod === this.paymentMethod.PayCC ? '998' : '999';
    paymentTender.SeqNo = 1;
    paymentTender.TenderType = '';
    paymentTender.MerchantCode = this.transHelper.MerchantCode;
    paymentTender.TenderRef = this.transHelper.PaymentRef;
    paymentTender.RefNo = '';
    paymentTender.TenderDate = moment(new Date()).format('YYYY-MM-DD');
    paymentTender.TenderCurrency = this.transHelper.TransCurrency;
    paymentTender.BaseCurrencty = this.transHelper.BaseCurrency;
    paymentTender.ExchgRate = '';
    paymentTender.TenderAmt = this.transHelper.TransTotalAmt;
    paymentTender.FeeType = '';
    paymentTender.FeeAmt = '';
    paymentTender.TransStatus = 0;
    paymentTender.Status = 0;

    paymentTenderList.push(paymentTender);

    paymentLog.BizRegID = paymentTender.BizRegID;
    paymentLog.BizLocID = paymentTender.BizLocID;
    paymentLog.LogID = '';
    paymentLog.PaymentTransID = paymentTender.PaymentTransID;
    paymentLog.TenderID = paymentTender.TenderID;
    paymentLog.SeqNo = 1;
    paymentLog.LogDate = paymentTender.TenderDate;
    paymentLog.RefNo = '';
    paymentLog.LogRef = '';
    paymentLog.Currency = '';
    paymentLog.LogAmt = '';
    paymentLog.AuthorizationCode = '';
    paymentLog.MerchantCode = paymentTender.MerchantCode;
    paymentLog.BankCode = this.fpxModel.fpx_buyerBankId;
    paymentLog.BankName = '';
    paymentLog.CheckSum = '';
    paymentLog.CheckSumString = '';
    paymentLog.Status = '';

    paymentLogList.push(paymentLog);

    let payment = {
      PaymentTender: paymentTenderList,
      PaymentLog: paymentLogList
    };

    console.log('Payment: ' + JSON.stringify(payment));

    let url = ProxyURL.AddTender;
    this._proxy.request(url, RequestType.Post, payment)
      .subscribe(() => {
        this.redirect();
      });
  }

  proceed(): void {
    this.paying = false;
    this.saveTransaction();
    console.log('PayModel: ' + JSON.stringify(this.fpxModel));
    //this.paymentSummaryModal.show(this.payment, this.fpxModel, this.selectedPayment, this.inputHelper.totalamountdue);
  }

  redirect(): void {
    if (this.selectedPaymentMethod === this.paymentMethod.PayFPX) {
      let form = (document.getElementById('fpxForm') as HTMLFormElement);

      form.setAttribute('target', '_self');
      form.action = AppConsts.FPX.FPXJSP;
      form.submit();
      form.removeAttribute('target');
    } else if (this.selectedPaymentMethod === this.paymentMethod.PayCC) {
      let form = (document.getElementById('maybankForm') as HTMLFormElement);

      form.setAttribute('target', '_self');
      form.action = AppConsts.CreditCard.MayBank.MBBEBPGCARDSURL;
      form.submit();
      form.removeAttribute('target');
    } else {
      let url = ''; // this.appRootUrl() + '/account/payment-response?orderNo=' + this.transModel.TransHdr.TransNo + '&offPay=true';
      window.open(url, '_blank');
    }
  }

  termCheckChanged(): void {
    console.log('PayButton: ' + this.payButton);
    console.log('TermCheck: ' + this.termCheck);
  }

  preJsFunction() {
    //minimizer header body
    let minimCtr = document.querySelectorAll('.minimCtr');
    for (let i = 0; i < minimCtr.length; i++) {
      let tempItem = minimCtr[i];
      tempItem.addEventListener('click', function () {
        if (tempItem.classList.contains('active')) {
          tempItem.classList.remove('active');
        } else {
          tempItem.classList.add('active');
        }
      });
    };

    //payment method selection
    let paymentMethod = document.querySelectorAll('#payementMethodCtrl > label input');
    for (let i = 0; i < paymentMethod.length; i++) {
      /*
      paymentMethod[i].addEventListener('change',function(event){
        let activeBox = document.querySelectorAll('.activeBox');
        if(activeBox.length > 0){
          activeBox[0].classList.remove('activeBox');
        }
        if(event.target.checked){
          let targertName = event.target.getAttribute('targetOpen');
          console.log(targertName);
          targertName = document.querySelector('#'+targertName);
          targertName.classList.add('activeBox');
        }
      });
      */
    }

    //check for term condition acceptance
    let termConditionCheckbox = document.querySelector('#proceedPay');
    termConditionCheckbox.addEventListener('change', function (event) {
      /*
    let proceedBtn = document.querySelector('#proceedBtnPaymentWrp button');
      if(event.target.checked){
        proceedBtn.removeAttribute('disabled');
      }
      else{ proceedBtn.setAttribute('disabled','true');}
    })
    ;
    */
    });
  }

}
