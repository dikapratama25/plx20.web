import { filter, finalize } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from "@shared/common/app-component-base";
import { Component, Injector, Input, OnInit, ViewChild,ViewEncapsulation } from '@angular/core';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { inject } from '@angular/core/testing';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';

@Component({
    templateUrl: './topup.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./topup.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class TopUpComponent extends AppComponentBase implements OnInit {
    topUpParams: {
        userID: string,
        tenantID: string,
        campNo: string,
        itemCode: string
    };

    baseURL = 'https://toopmarketing.com';
    baseURL2 = 'https://localhost:44301';
    reloadProducts = '/ir_services/reload_products.php?code=all';

    btnRewardLabel: string = "Confirm";
    promoDueDate: string;

    isReedemed: boolean = false;
    isOnSubmit: boolean = false;
    isInputPhoneNumberInactive: boolean = false;
    isSelectServiceProviderInactive: boolean = false;
    isBtnRewardInactive: boolean = true;

    inputHelper: any = {};
    inputProfile: any = {};
    inputProfileVoucher: any = {};
    selectedServiceProvider: any = {};
    serviceProviders: any [] = [];

    constructor (
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _route: ActivatedRoute
    ) {
        super(injector)
    }

    ngOnInit() {
        this.topUpParams = { 
            userID: this._route.snapshot.params["userID"],
            tenantID: this._route.snapshot.params["tenantID"],
            campNo: this._route.snapshot.params["campNo"],
            itemCode: this._route.snapshot.params["itemCode"]
        };
        console.log(this.topUpParams)
        this.promoDueDate = this.dateToDDMMYYYY(new Date("8/31/2021"));
        this.populateUserProfile();
    }

    dateToDDMMYYYY(date: Date) {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    populateUserProfile(): void {
        this.spinnerService.show();
        let url = ProxyURL.GetUserProfilebyID;
        url += "userID=" +  this.topUpParams.userID;
        url += "&tid="+ this.topUpParams.tenantID;
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => { 
            this.populateUserVoucher();
        }))
        .subscribe(result => {
            this.inputProfile = result.items[0];
            console.log(result);
        });
    }

    inputMobilePhoneNumberOnChange(): void {
        if (this.isPhoneNumberInCorrectFormat(this.inputProfile.MobileNo)) {
            this.inputProfile.MobileNo = this.inputProfile.MobileNo;
        } else {
            this.inputProfile.MobileNo = "";
        }
        console.log(this.inputProfile.MobileNo);

        if(this.inputProfile.MobileNo != "" && this.inputHelper.ServiceProvider != '-') {
            this.isBtnRewardInactive = false;
        } else {
            this.isBtnRewardInactive = true;
        }
    }

    /*
    getMobilePhoneNumber(): void {
        let url = ProxyURL.GetUserProfileById;
        url + "userID=" +  this.userProfileParams.userID;
        url += "&tenantID="+ this.userProfileParams.tenantID;
        this._proxy.setBaseUrl(this.baseURLAPI);
        this._proxy.request(url,
                            RequestType.Get)
        .subscribe(result => {
            console.log(result);
            this.inputHelper.phoneNum = this.filterPhoneNumber(result.items[0].MobileNo);
        });
    }*/

    isPhoneNumberInCorrectFormat(phoneNumber: string): boolean {
        let pattern = /^(60)\d/;

        if(pattern.test(phoneNumber)) {
            return true;
        }   else {
            return false;
        }

        /*
        if (pattern.test(phoneNumber)) {
            let filteredPhoneNum = phoneNumber.replace(pattern, "+60");
            return filteredPhoneNum;
        } else {
            if (!phoneNumber.startsWith("0")) {
                return phoneNumber = "+60" + phoneNumber ;
            } else {
                return `+6${phoneNumber}`;
            }
        }*/
    }

    comboServiceProviderOnChange(): void {
        this.selectedServiceProvider = this.serviceProviders.filter(x => x.ID === this.inputHelper.ServiceProvider);
        console.log(this.selectedServiceProvider);

        if(this.inputProfile.MobileNo != "" && this.inputHelper.ServiceProvider != '-') {
            this.isBtnRewardInactive = false;
        } else {
            this.isBtnRewardInactive = true;
        }

    }

    populateUserVoucher(): void {
        this.spinnerService.show();
        let url = ProxyURL.GetReloadVoucherByID;
        //url += "userID=" + this.topUpParams.userID;
        //url += "&mobileNo=" + this.inputProfile.MobileNo;
        url += "&campNo=" +  this.topUpParams.campNo;
        url += "&itemCode=" +  this.topUpParams.itemCode;
        url += "&TID="+ this.topUpParams.tenantID;
        url += "&userMobileNo=" + this.inputProfile.MobileNo;
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => { 
            this.populateServiceProviders();
        }))
        .subscribe(result => {
            console.log("data items : " + result.items.length);
            if (result.items.length > 0) {
                this.inputProfileVoucher = result.items;
                this.inputProfile.MobileNo = result.items[0].VoucherNo;
                this.topUpOnSubmit(1);
                this.isReedemed = true;
                this.isPhoneNumbAlreadyRedeemed();
            }
            // this.inptuProfileVoucher = result.items[0];
            console.log("input voucher profile : " + JSON.stringify(result));
            console.log("input voucher profile 2: " + JSON.stringify(this.inputProfileVoucher));
        });
    }

    filterPhoneNumber(phoneNumber: string): string {
        let pattern = /^[(][+]\d\d[)]/;
        if (pattern.test(phoneNumber)) {
            let filteredPhoneNum = phoneNumber.replace(pattern, "0");
            return filteredPhoneNum;
        } else {
            if (!phoneNumber.startsWith("0")) {
                return phoneNumber = "0" + phoneNumber ;
            } else {
                return phoneNumber;
            }
        }
    }

    populateServiceProviders(): void {
        this.spinnerService.show();
        let url = ProxyURL.GetAllToopReloadProducts;
        this._proxy.request(url,RequestType.Get)
            .pipe(finalize(() => { 
                this.spinnerService.hide();
                this.inputHelper.ServiceProvider = "-";
            }))
            .subscribe(result => {
                this.serviceProviders = result.data.filter(x => x.PCategory == "Telco Reload");
                console.log("providers : " + JSON.stringify(this.serviceProviders));
            });
    }

    topUpOnSubmit(mode: number = 0): void {
        let saveReloadURL = ProxyURL.SaveReloadRequest;

        if (mode == 1) {
            saveReloadURL += "&mode=1";
        }

        let data = {
            "UserID": this.topUpParams.userID,
            "CampNo": this.topUpParams.campNo,
            "ItemCode": this.topUpParams.itemCode,
            "MobileNo": this.inputProfile.MobileNo,
            "ProductID": this.inputHelper.ServiceProvider,
            "ReloadAmount": 10,
            "EmailAddress": "fluxyflux9@gmail.com"
        };
        console.log("data save : " + JSON.stringify(data));

        this.spinnerService.show();
        this._proxy.request(saveReloadURL, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (Boolean(result.success)) {
                    if (mode == 0) {
                        this.notify.success(this.l('RM 10.00 prepaid reload request has been submitted. Please wait for the reloading process.'));
                    }
                    this.isReedemed = true;
                    this.isPhoneNumbAlreadyRedeemed();
                } else {
                    this.message.error(result.error);
                }
            });
    }

    isPhoneNumbAlreadyRedeemed() {
        if(this.isReedemed) {
            this.isInputPhoneNumberInactive = true;
            this.isSelectServiceProviderInactive = true;
            this.isBtnRewardInactive = true;
            this.btnRewardLabel = "Reedemed";
            this.isReedemed = true;
        }
    }

    //input from somewhere
    checkDueDateServiceProvider(providerDueDate: Date) {
        if(providerDueDate.getDate() <= Date.now()) {
            console.log(`ServiceProvider ${this.serviceProviders} still active.`)
        } else {
            console.log(`ServiceProvider ${this.serviceProviders} inactive.`)
        }
    }

}
