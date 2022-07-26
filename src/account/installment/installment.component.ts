import { AbpSessionService } from 'abp-ng2-module';
import { Component, ElementRef, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { UrlHelper } from 'shared/helpers/UrlHelper';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { AppConsts } from '@shared/AppConsts';
import { VCard } from 'ngx-vcard';
import { VCardEncoding } from 'ngx-vcard';
import { VCardFormatter } from 'ngx-vcard';
import { ContentType, GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { finalize } from 'rxjs/operators';
import { parseDate } from 'ngx-bootstrap/chronos';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

@Component({
    templateUrl: './installment.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./installment.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class InstallmentComponent extends AppComponentBase implements OnInit {
    inputProfile: any = {};
    inputCompany: any = {};
    inputItem: any = {};
    mode = 1;
    // userId = '50180';
    // itemCode = 'IQOS2PLUS';
    userId = '';
    itemCode = '';
    checkAgree1 = false;
    checkAgree2 = false;
    checkAgree3 = false;
    transNo = '';
    today = new Date();
    isProceedable = false;

    constructor(
        injector: Injector,
        private _router: Router,
        private _proxy: GenericServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private http: HttpClient
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.userId = this._activatedRoute.snapshot.queryParams['id'];
        this.itemCode = this._activatedRoute.snapshot.queryParams['itemCode'];
        this.transNo = this._activatedRoute.snapshot.queryParams['transNo'];

        if (this.transNo) {
            this.populateInstallment();
        }
        else {
            // console.log("this.userid : " + this.userId + " || " + this.itemCode);
            // console.log("this.quer : " + JSON.stringify(this._activatedRoute.snapshot.queryParams));
            this.transNo = moment(this.today).format("YYYYMMDDHHmmss");
            this.populateData();
        }
    }

    populateProfile() {
        this.spinnerService.show();
        let koperasiProfileUrl = ProxyURL.GetKoperasiUserProfile + 'userID=' + encodeURIComponent(this.userId) + '&';
        this._proxy.request(koperasiProfileUrl, RequestType.Get)
            .pipe(finalize(() => { 
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                // console.log("koperasi1 : " + JSON.stringify(result));
                this.inputProfile = result[0];
                // console.log(JSON.stringify(this.inputProfile));
            });
    }

    populateCompany() {
        this.spinnerService.show();
        let koperasiCompanyUrl = ProxyURL.GetKoperasiCompany + 'userID=' + encodeURIComponent(this.userId) + '&';
        this._proxy.request(koperasiCompanyUrl, RequestType.Get)
            .pipe(finalize(() => { 
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.inputCompany = result[0];
            });
    }

    populateItem() {
        this.spinnerService.show();
        let koperasiItemUrl = ProxyURL.GetItemPriceDetail + 'ItemCode=' + encodeURIComponent(this.itemCode) + '&';
        this._proxy.request(koperasiItemUrl, RequestType.Get)
            .pipe(finalize(() => { 
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.inputItem = result[0];
                this.inputItem.Pembiayaan = 'barangan';
                this.inputItem.Duration = '1';
            });
    }

    populateData() {
        this.inputCompany.BizRegID = '202104291L5WZI';
        this.inputCompany.BizLocID = '0P4QZJ2021042900';
        if (this.userId !== null && this.userId !== '' && this.userId !== undefined) {
            this.populateProfile();
            this.populateCompany();
        }
        this.populateItem();
    }

    populateInstallment() {
        this.mode = 2;
        this.spinnerService.show();
        let getInstallmentURL = ProxyURL.GetInstallment + 'Id=' + encodeURIComponent(this.userId) + '&TransNo=' + encodeURIComponent(this.transNo) + '&';
        this._proxy.request(getInstallmentURL, RequestType.Get)
            .pipe(finalize(() => { 
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                console.log("result get installment : " + JSON.stringify(result));
                this.inputProfile = result.Profile;
                this.inputCompany = result.Company;
                this.inputItem = result.Item;
                // this.inputItem = result[0];
                // this.inputItem.Pembiayaan = 'barangan';
                // this.inputItem.Duration = '1';
            });
    }

    changeTaraf(val) {
        this.inputCompany.TarafJawatan = val;
    }

    proceed() {
        let postInstallmentUrl = ProxyURL.PostInstallment;

        let data = {
            'Profile' : this.inputProfile,
            'Company' : this.inputCompany,
            'Item' : this.inputItem
        };

        this.inputItem.TransNo = this.transNo;
        this.inputProfile.DOB = moment(this.inputProfile.DOB).add(1, 'd').toDate();

        console.log("profile : " + JSON.stringify(this.inputProfile));
        console.log("company : " + JSON.stringify(this.inputCompany));
        console.log("item : " + JSON.stringify(this.inputItem));

        this.spinnerService.show();
        this._proxy.request(postInstallmentUrl, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (Boolean(result.success)) {
                    this.notify.success(this.l('SavedSuccessfully'));
                    this.inputProfile.DOB = moment(this.inputProfile.DOB).add(-1, 'd').toDate();
                    this.mode = 2;
                } else {
                    this.message.error(result.error);
                }
            });
    }

    changeDob(evt) {
        this.inputProfile.DOB = parseDate(evt);
    }

    checkedAgree1() {
        this.checkAgree1 = !this.checkAgree1;
    }
    checkedAgree2() {
        this.checkAgree2 = !this.checkAgree2;
    }
    checkedAgree3() {
        this.checkAgree3 = !this.checkAgree3;
    }
}

