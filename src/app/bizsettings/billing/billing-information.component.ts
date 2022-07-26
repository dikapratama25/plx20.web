import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
    templateUrl: './billing-information.component.html',
    animations: [appModuleAnimation()]
})

export class BillingInformationComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('Country', { static: false }) Country: NgSelectComponent;
    @ViewChild('State', { static: false }) State: NgSelectComponent;
    @ViewChild('City', { static: false }) City: NgSelectComponent;

    inputHelper: any = {};
    stateList: any[] = [];
    cityList: any[] = [];
    countryList: any[] = [];
    checkUseProfile: boolean = true;

    creditCurrency = 'MYR';
    creditLimit = '0.00';

    constructor(
        injector: Injector,
        private _router: Router,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.populateData();
    }

    ngAfterViewInit(): void {
    }

    populateData(): void {
        this.spinnerService.show();
        this.populateCountryList();
        this.populateBillingInfo();
        this.getCreditBalance();
    }

    populateCountryList(): void {
        this.spinnerService.show();
        let url = ProxyURL.GetCountryCombo;
        this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.countryList = result;
            });
    }

    populateStateList(): void{
        this.spinnerService.show();
        let cityURL = ProxyURL.GetState + "countryCode=" + this.inputHelper.Country + '&';
        this._proxy.request(cityURL, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
                if (this.inputHelper.State !== undefined && this.inputHelper.State !== null) {
                    setTimeout(() => {
                        $('#State').val(this.inputHelper.State);
                    }, 0);
                }
            }))
            .subscribe(result => {
                this.stateList = result;
            });
    }

    populateCityList(): void{
        this.spinnerService.show();
        let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.inputHelper.Country + '&' + 'stateCode=' + this.inputHelper.State + '&';
        this._proxy.request(cityURL, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
                if (this.inputHelper.City !== undefined && this.inputHelper.City !== null) {
                    setTimeout(() => {
                        $('#City').val(this.inputHelper.City);
                    }, 0);
                }
            }))
            .subscribe(result => {
                this.cityList = result;
            });
    }

    populateBillingInfo() {
        this.spinnerService.show();
        let billInfoURL = ProxyURL.GetBizBillingInfo;
        this._proxy.request(billInfoURL, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.inputHelper = result;
                this.populateStateList();
                this.populateCityList();
            });
    }

    populateProfileInfo(): void {
        this.spinnerService.show();
        let url = ProxyURL.GetProfileBusiness + 'bizregid=' + this.appStorage.bizRegID + '&';
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(()=> {
            this.spinnerService.hide();
        }))
        .subscribe((result)=> {
            this.inputHelper.Name = result.ContactPerson;
            this.inputHelper.Mobile = result.ContactPersonMobile;
            this.inputHelper.EmailAddress = result.ContactPersonEmail;
            this.inputHelper.Address1 = result.AddressBl1;
            this.inputHelper.Address2 = result.AddressBl2;
            this.inputHelper.Address3 = result.AddressBl3;
            this.inputHelper.Country = result.Country;
            this.inputHelper.State = result.stateBl;
            this.inputHelper.City = result.cityBl;
            this.inputHelper.PostalCode = result.PostalCodeBl;
            this.populateStateList();
            this.populateCityList();
        });
    }

    changeUseProfile() {
        //this.checkUseProfile = !this.checkUseProfile;
        if (this.checkUseProfile) {
            this.populateProfileInfo();
        }
        else {
            this.populateBillingInfo();
        }
    }

    saveBillingInfo() {
        this.spinnerService.show();
        let billInfoURL = ProxyURL.UpdateBizBillingInfo;
        this._proxy.request(billInfoURL, RequestType.Post, this.inputHelper)
            .pipe(finalize(() => {
                this.populateBillingInfo();
            }))
            .subscribe(result => {
            if (result.success) {
                this.notify.success(this.l('SavedSuccessfully'));
            } else {
                this.message.error(result.error);
            }
            });
    }

    getCreditBalance(): void {
        let url = ProxyURL.CheckCreditBalance;
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          this.changeUseProfile();
          this.spinnerService.hide();
        }))
        .subscribe((result) => {
          this.creditCurrency = result.items[0].CreditCurrency;
          this.creditLimit = result.items[0].CreditBalance;
        });
      }

    redirectTopUp(): void {
        this._router.navigate(['/app/payment/portal'],
        {
            queryParams: {
                topUpCredit: true
            }
        });
    }

    redirectBillingHistory(): void {
        this._router.navigate(['/app/biz/billing-history']);
    }

}
