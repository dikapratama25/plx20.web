import { SubscriptionPaymentDto } from './../../shared/service-proxies/service-proxies';
import { result } from 'lodash';
import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { AppStorageKey, AppStorage } from '@app/shared/form/storage/app-storage.component';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { PermissionCheckerService } from 'abp-ng2-module';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { RoleServiceProxy } from '@shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, tap, switchMap, concatMap, filter } from 'rxjs/operators';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import { DecimalPipe } from '@angular/common';
import { Decimal } from 'decimal.js';
import {
  EditionSelectDto,
  PaymentInfoDto,
  PaymentServiceProxy,
  CreatePaymentDto,
  PaymentGatewayModel,
  EditionPaymentType,
  PaymentPeriodType,
  SubscriptionPaymentGatewayType,
  SubscriptionPaymentType,
  SubscriptionStartType,
  TenantRegistrationServiceProxy
} from '@shared/service-proxies/service-proxies';
import { PaymentHelperService } from '@account/payment/payment-helper.service';
import { EditionHelperService } from '@account/payment/edition-helper.service';

@Component({
    templateUrl: './payment-page.component.html',
    styleUrls: ['./payment-page.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class PaymentPageComponent extends AppComponentBase implements OnInit, AfterViewInit {

  subscriptionPaymentType: typeof SubscriptionPaymentType = SubscriptionPaymentType;
  subscriptionStartType: typeof SubscriptionStartType = SubscriptionStartType;

  editionPaymentType: EditionPaymentType;
  edition: EditionSelectDto = new EditionSelectDto();
  gateWay = SubscriptionPaymentGatewayType;
  tenantId: number = abp.session.tenantId;
  paymentPeriodType = PaymentPeriodType;
  additionalPrice: number;
  upgradeEditionId: number;
  editionPaymentTypeCheck: typeof EditionPaymentType = EditionPaymentType;
  
  selectedPaymentPeriodType: PaymentPeriodType;
  supportsRecurringPayments = false;
  recurringPaymentEnabled = false;
  showPaymentForm = false;
  editionId = 0;
  paymentID: number | undefined;
  appName: string;
  buyType: string;

  dateToday = moment(new Date()).format('YYYYMMDDHHmmss');
  isLoading = false;
  paying = false;
  term = false;
  maxTotal = false;
  sstAmt = 0;
  payModel: any;
  checkSum: string;
  IsReceipt: any = 0;
  decimalRounding: any;
  tenderID = "CR001";
  isCreditPay = true;
  
  creditCurrency = 'MYR';
  creditLimit = 0;
  checkTC = false;
  topUp: boolean = false;
  inputHelper: any = {};
  payment: any = {};
  transAmt = 0;

  selectedID = '';
  selectedPlan = '';
  // selectedAmt: number = 0;
  selectedType = '';
  
  //#region FPX
  bankListShow = false;
  personalBank: any[] = [];
  corpBank: any[] = [];
  bankListModel: any;
  bankLoading: boolean;
  payButton = true;
  fpxModel: any = {};
  //#endregion

  constructor (
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _proxy: GenericServiceProxy,
    private _permissionChecker: PermissionCheckerService,
    private _roleProxy: RoleServiceProxy,
    private _router: Router,
    private _storage: AppStorage,
    private _localStorageService: LocalStorageService,
    private _paymentHelperService: PaymentHelperService,
    private _paymentAppService: PaymentServiceProxy,
    private _tenantRegistrationAppService: TenantRegistrationServiceProxy,
    private _editionHelperService: EditionHelperService,
    private _httpClient: HttpClient
  ) {
    super(injector);
  }
  
    ngOnInit(): void {
      this.refresh();
      // this.topUp = this._activatedRoute.snapshot.queryParams['topUpCredit'] == 'true' ? true : false;
    }
  
    ngAfterViewInit(): void {
        this.getCreditBalance();
    }
    
    getCreditBalance(): void {
        let url = ProxyURL.CheckCreditBalance;
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          this.spinnerService.hide();
        }))
        .subscribe((result) => {
            if (result.items[0] != undefined) {
                this.creditCurrency = result.items[0].CreditCurrency;
                this.creditLimit = result.items[0].CreditBalance;
            }
        });
    }

    refresh(): void {
      this.topUp = this._activatedRoute.snapshot.queryParams['topUpCredit'] == 'true' ? true : false;
      //#region FPX
      // this.checkFPXBankList();
      this.fpxModel.fpx_msgType = '';
      this.fpxModel.fpx_msgToken = '';
      this.fpxModel.fpx_sellerExId = '';
      this.fpxModel.fpx_sellerExOrderNo = '';
      this.fpxModel.fpx_sellerOrderNo = '';
      this.fpxModel.fpx_sellerTxnTime = '';
      this.fpxModel.fpx_sellerId = '';
      this.fpxModel.fpx_sellerBankCode = '';
      this.fpxModel.fpx_txnCurrency = '';
      this.fpxModel.fpx_txnAmount = '';
      this.fpxModel.fpx_buyerEmail = '';
      this.fpxModel.fpx_buyerId = '';
      this.fpxModel.fpx_buyerName = '';
      this.fpxModel.fpx_buyerBankId = '';
      this.fpxModel.fpx_buyerBankBranch = '';
      this.fpxModel.fpx_buyerAccNo = '';
      this.fpxModel.fpx_makerName = '';
      this.fpxModel.fpx_buyerIban = '';
      this.fpxModel.fpx_productDesc = '';
      this.fpxModel.fpx_version = '';
      //#endregion
  
      //#region Upgrade
      if (!this.topUp) {
        this.editionPaymentType = parseInt(this._activatedRoute.snapshot.queryParams['editionPaymentType']);
        this.upgradeEditionId = parseInt(this._activatedRoute.snapshot.queryParams['editionId']);
        this.buyType = this._paymentHelperService.getEditionPaymentType(this.editionPaymentType);
  
        if (this.appSession.tenant.edition.isFree) {
            this._tenantRegistrationAppService.getEdition(this.upgradeEditionId)
              .subscribe((upgradeEdition) => {
                this.appName = upgradeEdition.appName;
                if (this._editionHelperService.isEditionFree(upgradeEdition)) {
                  this._paymentAppService.switchBetweenFreeEditions(upgradeEdition.id)
                    .subscribe(() => {
                      this.hideMainSpinner();
                      this.redirectChange();
                      // this._router.navigate(['app/admin/subscription-management']);
                    });
                } else {
                  this.hideMainSpinner();
                  this._paymentAppService.hasAnyPayment(upgradeEdition.appId)
                  .subscribe(hasPayment => {
                    console.log(hasPayment);
                    if (!hasPayment) {
                        this.hideMainSpinner();
                        this.redirectToBuy();
                        return;
                    }

                    this.editionId = this.upgradeEditionId;
                    this._paymentAppService.getPaymentInfo(this.upgradeEditionId)
                    .subscribe((result: PaymentInfoDto) => {
                      this.edition = result.edition;
                      this.selectedPlan = this.edition.displayName;
                      // this.transAmt = Number(result.additionalPrice.toFixed(2));
                      this.transAmt = this.edition.dailyPrice != null ? this.edition.dailyPrice : this.edition.weeklyPrice != null ? this.edition.weeklyPrice : this.edition.monthlyPrice != null ? this.edition.monthlyPrice : this.edition.annualPrice != null ? this.edition.annualPrice : this.transAmt;
          
                      if (this.editionPaymentType == EditionPaymentType.Extend) {
                        this.selectedPaymentPeriodType = this._paymentHelperService.getInitialSelectedPaymentPeriodType(this.edition);
                      } else {
                        if (this.transAmt < AppConsts.MinimumUpgradePaymentAmount) {
                          this._paymentAppService.upgradeSubscriptionCostsLessThenMinAmount(this.upgradeEditionId).subscribe(() => {
                              this.spinnerService.hide();
                              this.redirectChange();
                              // this.showPaymentForm = true;
                              // this._router.navigate(['app/admin/subscription-management']);
                          });
                        } else {
                          this.spinnerService.hide();
                          this.selectedPaymentPeriodType = this._paymentHelperService.getInitialSelectedPaymentPeriodType(this.edition);
                        }
                      }
                    });
                  });
                  // this.redirectToBuy();
                }
              });
            return;
        }
        //edition is not free but there is no previous payment(tenant might be created with paid edition.)
        this._paymentAppService.hasAnyPayment(undefined)
        .subscribe(hasPayment => {
          console.log(hasPayment);
          if (!hasPayment) {
              this.hideMainSpinner();
              this.redirectToBuy();
              return;
          }

          this._paymentAppService.getPaymentInfo(this.upgradeEditionId)
          .subscribe((result: PaymentInfoDto) => {
            console.log(result);
            this.edition = result.edition;
            this.selectedPlan = this.edition.displayName;
            this.transAmt = Number(result.additionalPrice.toFixed(2));

            if (this.transAmt < AppConsts.MinimumUpgradePaymentAmount) {
                this._paymentAppService.upgradeSubscriptionCostsLessThenMinAmount(this.upgradeEditionId).subscribe(() => {
                    this.spinnerService.hide();
                    this.showPaymentForm = true;
                    this._router.navigate(['app/admin/subscription-management']);
                });
            } else {
                this.spinnerService.hide();
                this.showPaymentForm = true;
            }
          });

          // this._paymentAppService.getLastCompletedPayment().subscribe(result => {
          //     let gateway = new PaymentGatewayModel();
          //     gateway.gatewayType = (result.gateway as any);
          //     gateway.supportsRecurringPayments = true;

          //     this.paymentGateways = [gateway];
          //     this.paymentPeriodType = result.paymentPeriodType;

          //     if (this.appSession.tenant.subscriptionPaymentType === this.subscriptionPaymentType.Manual) {
          //         this._paymentAppService.getActiveGateways(undefined)
          //             .subscribe((result: PaymentGatewayModel[]) => {
          //                 this.paymentGateways = result;
          //             });
          //     }
          // });
        });
      }
      //#endregion
    }

    redirectTopUp(): void {
      this._router.navigate(['/app/payment/portal'],
      {
        queryParams: {
          topUpCredit: true
        }
      });
      this.topUp = true;
      this.isCreditPay = false;
      this.selectedPlan = '';
      this.dateToday = moment(new Date()).format('YYYYMMDDHHmmss');
    }

    redirectChange(): void {
      this._router.navigate(['/app/subscription/currentpackage']);
    }
  
    onTabSelect(type: any) {
      if (type === 'Credit') {
        this.isCreditPay = true;
      } else {
        this.isCreditPay = false;
      }
    }

    agreeTNC() {
      // if (this.checkTC) {
      //   this.checkTC = false;
      // } else {
      //   this.checkTC = true;
      // }
    }

    //#region Edition
    redirectToBuy(): void {
      let tenantId = this.appSession.tenant.id;
      abp.multiTenancy.setTenantIdCookie(tenantId);

      this.editionPaymentType = EditionPaymentType.BuyNow;
      this.editionId = this.upgradeEditionId;

      this._tenantRegistrationAppService.getEdition(this.editionId)
          .subscribe((result: EditionSelectDto) => {
            this.appName = result.appName;
            this.edition = result;
            this.selectedPlan = this.edition.displayName;
            this.selectedPaymentPeriodType = this._paymentHelperService.getInitialSelectedPaymentPeriodType(this.edition);
            this.transAmt = this.edition.dailyPrice != null ? this.edition.dailyPrice : this.edition.weeklyPrice != null ? this.edition.weeklyPrice : this.edition.monthlyPrice != null ? this.edition.monthlyPrice : this.edition.annualPrice != null ? this.edition.annualPrice : this.transAmt;
          });

    }

    onPaymentPeriodChangeChange(selectedPaymentPeriodType, price) {
      this.selectedPaymentPeriodType = selectedPaymentPeriodType;
      this.transAmt = price;
    }

    checkout(gatewayType: SubscriptionPaymentGatewayType) {
      let input = {} as CreatePaymentDto;
      input.editionId = this.editionId;
      input.editionPaymentType = ((this.editionPaymentType) as any);
      input.paymentPeriodType = ((this.selectedPaymentPeriodType) as any);
      input.recurringPaymentEnabled = this.recurringPaymentEnabled;
      input.subscriptionPaymentGatewayType = gatewayType;
      input.successUrl = AppConsts.remoteServiceBaseUrl + '/api/services/app/payment/' + this._paymentHelperService.getEditionPaymentType(this.editionPaymentType) + 'Succeed';
      input.errorUrl = AppConsts.remoteServiceBaseUrl + '/api/services/app/payment/PaymentFailed';

      console.log(input);
      this._paymentAppService.createPayment(input)
        .pipe(finalize(() => { this.setPaymentData(); }))
        .subscribe((paymentId: number) => {
          this.paymentID = paymentId;            
            // this._router.navigate(['account/' + this.getPaymentGatewayType(gatewayType).toLocaleLowerCase() + '-purchase'],
            //     {
            //         queryParams: {
            //             paymentId: paymentId,
            //             redirectUrl: 'account/register-tenant-result'
            //         }
            //     });
        });
    }

    //#endregion

    //#region FPX
    checkFPXBankList() {
        this._httpClient.get(this.appUrlService.appRootUrl + 'assets/qstl/banklist.json').subscribe(
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
        this.payButton = true;
        this.term = false;
        this.bankListModel = [];
    
        if (msgToken === '01' && this.inputHelper.total <= 30000) {
          this.maxTotal = false;
          this.bankListShow = true;
          this.bankListModel = this.personalBank;
          this.fpxModel.fpx_msgToken = '01';
          this.isLoading = false;
        } else if ( msgToken === '02' && this.inputHelper.total <= 30000) {
          this.maxTotal = false;
          this.bankListShow = true;
          this.bankListModel = this.corpBank;
          this.fpxModel.fpx_msgToken = '02';
          this.isLoading = false;
        } else if (msgToken === '02' && this.inputHelper.total >= 30000) {
          this.maxTotal = false;
          this.bankListShow = true;
          this.bankListModel = this.corpBank;
          this.fpxModel.fpx_msgToken = '02';
          this.isLoading = false;
        } else {
          this.term = false;
          this.bankListShow = false;
          this.maxTotal = true;
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
                this.payButton = true;
              } else {
                this.notify.success(this.l('BankListUpdateFailed'));
                this.payButton = true;
              }
            });
        }
      }
    
      bankListChange(bank?: any): void {
        this.setFPXDetails(this.payModel);
        this.fpxModel.fpx_buyerBankId = bank.bankcode;
        this.fpxModel.fpx_buyerBankBranch = '';
    
        let url = ProxyURL.GetFPXCheckSum;
        if (url !== undefined) {
          this._proxy.request(url, RequestType.Post, this.fpxModel)
            .subscribe((result) => {
              this.fpxModel.fpx_checkSum = result.checksum;
              this.checkSum = result.checksumData;
              this.payButton = false;
              this.term = true;
            });
        }
      }
    
      setFPXDetails(data: any) {
        this.fpxModel.fpx_msgType = 'AE';
        //this.fpxModel.fpx_msgToken = '01';
        this.fpxModel.fpx_sellerExId = AppConsts.FPX.sellerExId; // 'EX00003925';
        this.fpxModel.fpx_sellerExOrderNo = this.dateToday;
        this.fpxModel.fpx_sellerOrderNo = this.dateToday;
        this.fpxModel.fpx_sellerTxnTime = this.dateToday;
        this.fpxModel.fpx_sellerId = AppConsts.FPX.sellerId; // 'SE00004392';
        this.fpxModel.fpx_sellerBankCode = AppConsts.FPX.sellerBankCode; // '01';
        this.fpxModel.fpx_txnCurrency = AppConsts.FPX.txnCurrency; // 'MYR';
        this.fpxModel.fpx_txnAmount = new Decimal(this.inputHelper.total).toFixed(2);
        this.fpxModel.fpx_buyerEmail = this.appStorage.email; // 'charis@collexe.asia';
        this.fpxModel.fpx_buyerId = this.inputHelper.customerno;
        this.fpxModel.fpx_buyerName = this.inputHelper.customer; //'Charis'; //
        this.fpxModel.fpx_buyerAccNo = '';
        this.fpxModel.fpx_makerName = 'Lembaga Getah Malaysia';
        this.fpxModel.fpx_buyerIban = '';
        this.fpxModel.fpx_productDesc = 'LGM Payment ' + this.inputHelper.billno;
        this.fpxModel.fpx_version = AppConsts.FPX.version; // '6.0';
    }
    //#endregion

    proceedPayment() {
      this.paying = true;
      if (!this.topUp) {
        let gatewayType = this.isCreditPay == true ? this.gateWay.ATNCredit : this.gateWay.FPX;
        this.checkout(gatewayType);
        console.log('CheckOut');
      } else {
        this.setPaymentData();
        console.log('Direct');
      }
    }

    setPaymentData() {
      let transHdr: any = {};
      let transDtlList: any[] = [];
      let transTender: any = {};
      this.tenderID = this.isCreditPay == false ? '997' : this.topUp == true ? '997' : 'CR001';
          
      this.payment = {
        TransHdr: transHdr,
        TransDtl: transDtlList,
        SiNumber: '',
        TenderID: this.tenderID, //this.selectedPayment === 'fpxPay' ? transTender.TransId = 997 : this.selectedPayment === 'ccPay' ? transTender.TransId = 996 : transTender.TenderId = 993,
        BankCode: '', //this.fpxModel.fpx_buyerBankId,
        RequestMessage: '', //this.selectedPayment === 'fpxPay' ? this.checkSum : this.selectedPayment === 'ccPay' ? this.checkSum : '',
        //TransDtlHdr: this.transDtlHdr,
        //OfflineInfoList: this.offlineInfoList,
        Mode: 2
      };
  
      //#region HDR
      transHdr.BizRegID = this.appStorage.bizRegID;
      transHdr.BizLocID = this.appStorage.bizLocID;
      transHdr.TermID = 1;
      transHdr.TransNo = this.dateToday;
      transHdr.TransType = 1;
      transHdr.BillNo = this.paymentID == undefined ? '' : this.paymentID;
      transHdr.ShiftCode = '99'; // should be FPX status
      transHdr.TransDate = moment(new Date()).format('YYYY-MM-DD');
      transHdr.TransAmtRnd = this.transAmt;
      transHdr.TransChgAmt = 0;
      transHdr.TransSubTotal = this.transAmt;
      transHdr.TransAmt = this.transAmt;
      transHdr.CustomerID = this.appStorage.bizRegID;
      transHdr.CustPrivilege = ''; // this.fpxModel.fpx_buyerBankId;
      transHdr.CashierID = '';
      transHdr.bizRegID = this.appStorage.bizRegID;
      transHdr.CustPkgID = '';
      transHdr.ServerID = '';
      transHdr.TransDiscReasonCode = '';
      transHdr.TransDiscRemark ='';
      transHdr.AcctNo = this.dateToday;
      transHdr.TransReasonCode = '';
      transHdr.SpDiscReasonCode = '';
      transHdr.InSvcID = '';
      transHdr.TransStatus = '99'; // should be FPX status
      transHdr.TblNo = '';
      transHdr.Posted = 0;
      transHdr.PostDate = moment(new Date()).format('YYYY-MM-DD');
      transHdr.Status = 0; // should be FPX status
      transHdr.Flag = 1;
      transHdr.TransRemark = this.selectedPlan !== '' ? this.selectedPlan : 'Top Up Credit.';
      //#endregion
  
      //#region DTL
      let transDtl: any = {};
      transDtl.BizRegID = transHdr.BizRegID;
      transDtl.BizLocID = transHdr.BizLocID;
      transDtl.TermID = 1;
      transDtl.TransNo = transHdr.TransNo;
      transDtl.TransSeq = 1;
      transDtl.BillNo = transHdr.BillNo; //transHdr.BillNo;
      transDtl.StkType =  this.selectedPlan !== '' ? 'CDL' : "SCR";
      transDtl.ItemType = 1;
      transDtl.ItemCode = ''; //this.itemDtlList[i].code;
      transDtl.Qty = 1; //Number(this.itemDtlList[i].quantity);
      transDtl.Remark = transHdr.TransRemark; //this.itemDtlList[i].description;
      transDtl.UnitCost = this.transAmt; //Number(this.itemDtlList[i].unitprice);
      transDtl.TolAmt = this.transAmt; //Number(this.itemDtlList[i].amount);
      transDtl.Posted = 0;
      transDtl.Flag = 1;
      transDtl.Status = transHdr.Status;
      transDtl.IsHost = 1;
      transDtl.ExCode1 = ''; //Credit Vote for PRF
      transDtl.BaseRate = 0; //Should be Tax
      transDtl.CoRate1H = 0; //Should be Rounding
      transDtl.SerialNo = 0;
      transDtl.ExCode2 = '';  
      transDtlList.push(transDtl);
      //#endregion

      let urlPay = ProxyURL.AddTransaction;
      this._proxy.request(urlPay, RequestType.Post, this.payment)
      .pipe(finalize(() => { this.paying = false; this.getCreditBalance(); }))
      .subscribe((result) => {
          if (result.success = 'true') {
            this.notify.success(this.l('RedirectingWithThreeDots'));
            this._router.navigate(['/app/biz/home']);
          } else {
            this.notify.error(this.l('PaymentFailed'));
          }
        });
    }

}