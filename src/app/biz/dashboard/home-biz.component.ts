import { result } from 'lodash';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { AppStorageKey, AppStorage } from '@app/shared/form/storage/app-storage.component';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { PermissionCheckerService } from 'abp-ng2-module';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { RoleServiceProxy } from '@shared/service-proxies/service-proxies';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, tap, switchMap, concatMap, filter } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Observable, combineLatest as _observableCombineLatest } from 'rxjs'
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import * as _ from 'lodash';
@Component({
  templateUrl: './home-biz.component.html',
  styleUrls: ['./home-biz.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class HomeBizComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('mainTabs', { static: false }) mainTabs: TabsetComponent;
  @ViewChild('subscriptiongrid', { static: false }) subscriptiongrid: BaseListComponent;

  isFreePub = false;
  isFreeBiz = false;
  isAdmin = false;
  isUser = false;
  isMaintenance = false;

  gridUrl = ProxyURL.GetUserSubcriptions;
  startDate = undefined;
  endDate = undefined;

  userName = '';
  companyName = '';
  companyAddress1 = '';
  companyAddress2 = '';
  companyAddress3 = '';
  companyCity = '';
  companyState = '';
  companyCountry = '';
  countryCode = '';
  stateCode = '';
  cityCode = '';

  creditCurrency = 'MYR';
  creditLimit = '0.00';

  constructor (
      injector: Injector,
      private _proxy: GenericServiceProxy,
      private _permissionChecker: PermissionCheckerService,
      private _roleProxy: RoleServiceProxy,
      private _router: Router,
      private _storage: AppStorage,
      private _localStorageService: LocalStorageService,
      private _httpClient: HttpClient
  ) {
      super(injector);
  }

  ngOnInit(): void {
    this.isUser = this.isGranted('Pages.Biz');
    this.isFreeBiz = this.isGranted('Pages.Biz.Profile') && this.isUser;
    this.isFreePub = this.isUser && !this.isFreeBiz;

    this.userName = this.appSession.user.name;
    this.companyName = this.appStorage.companyName;
  }

  ngAfterViewInit(): void {
    this.getCreditBalance();
    this.refresh();
    this.populateData();
  }

  populateData(): void {
    let url = ProxyURL.GetProfileBusiness + 'bizregid=' + this.appStorage.bizRegID + '&';
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(()=>{
        setTimeout(() => {
            this.populateCountryID();
        })
    }))
    .subscribe((result)=> {
      if (result != null || result != undefined) {
        this.companyAddress1 = result.Address1;
        this.companyAddress2 = result.Address2;
        this.companyAddress3 = result.Address3;
        this.cityCode = result.City;
        this.stateCode = result.State;
        this.countryCode = result.Country;
      }
    });
  }

  populateCountryID(): void {
    let url = ProxyURL.GetCountryCombo;
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(()=>{
        setTimeout(() => {
            this.getStateList();
        })
    }))
    .subscribe(result => {
      if (result != null || result != undefined) {
        this.companyCountry = result.filter(x => x.Code == this.countryCode)[0].Remark;
      }
    });
  }

  getStateList(): void{
    let cityURL = ProxyURL.GetState + "countryCode=" + this.countryCode + '&';
    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        _observableCombineLatest([
            this.getCompanyCityList(),
            this.getCompanyCityList(true)
        ]);
      }))
      .subscribe(result => {
        if (result != null || result != undefined) {
          this.companyState = result.filter(x => x.Code == this.stateCode)[0].Remark;
        }
      });
  }

  getCompanyCityList(isBranch: boolean = false): void{
    let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.countryCode + '&' + 'stateCode=' + this.stateCode + '&';
    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        setTimeout(() => {
            this.spinnerService.hide();
        }, 0);
      }))
      .subscribe(result => {
        if (result != null || result != undefined) {
          this.companyCity = result.filter(x => x.Code == this.cityCode)[0].Remark;
        }
      });
  }

  //#region Subcriptions
  refresh(): void {
    let url = ProxyURL.GetUserSubcriptions;
    this.subscriptiongrid.setURL(url);
    this.subscriptiongrid.refresh();
  }

  viewCurrentDetail(data?: any) {
    // console.log(data);
    this._router.navigate(['/app/subscription/currentpackage'], { queryParams: { appID: data.AppId, appName: data.AppName, ServiceID: data.Id, subscriptionName: data.SubscriptionName, subscriptionEndDateUtc: data.SubscriptionEndDateUtc } });
  }
  
  startService(event?:any) {
    let url =  _.filter(AppConsts.svcAppBaseUrl, x=> x.appId == event.data.AppId)[0].url + '/app/biz/home';
    window.location.replace(url);
  }

  //#endregion

  getCreditBalance(): void {
    let url = ProxyURL.CheckCreditBalance;
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(() => {
      this.spinnerService.hide();
    }))
    .subscribe((result) => {
      if (result.items.length > 0) {
        this.creditCurrency = result.items[0].CreditCurrency;
        this.creditLimit = result.items[0].CreditBalance;
      };
    });
  }

  redirectTopUp(): void {
    this._router.navigate(['/app/payment/portal'],
      {
        queryParams: {
          topUpCredit: true
          // tenantId: this.appSession.tenant.id,
          // editionPaymentType: EditionPaymentType.BuyNow,
          // editionId: this.upgradeEditionId,
          // subscriptionStartType: this.subscriptionStartType.Paid
        }
      });
  }


  CompleteWorkspaceOnClick() {
    this._router.navigateByUrl('app/manage/review');
 }

}
