import { EditionPaymentType } from './../../../../shared/service-proxies/service-proxies';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';;
import { ActivatedRoute } from '@angular/router';
import { PaymentMethod } from '@shared/AppEnums';
import * as moment from 'moment';

@Component({
    templateUrl: './billing-history.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./billing-history.component.less'],
    animations: [appModuleAnimation()]
})
export class BillingHistoryComponent extends AppComponentBase  {
    @ViewChild('billingHistory', { static: false }) billingHistory: BaseListComponent;
    //transNo: string;
    //billNo: string;
    billingStartDate: null;
    billingEndDate: null;
    //chargeType: any;
    //comboChargeType: any = [];
    paymentStatus: any;
    comboPaymentStatus: any = [];
    gridUrl: string;
    isAfterViewInit = false;
    appId!: number | undefined;
    section: any = {};
    options: {Code: number, Remark: string}[] = [];
    payType!: number | undefined;
    paymentType: any = {};
    paymentTypeList: {Code: number, Remark: string}[] = [];

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _activedRoute: ActivatedRoute
    ) {
        super(injector);
        this.gridUrl = ProxyURL.GetBillingHistory;

    }

    ngOnInit() {
        /*
        this.comboChargeType.unshift({'Code': '', 'Type': 'All'},
                                {'Code': '0','Type': 'FPX'},
                                {'Code': '1 Payment', 'Type': 'Credit Payment'},
        this.chargeType = this.comboChargeType[0].Code;*/
        this.comboPaymentStatus.unshift({'Code': '0', 'Status': 'Void'},
                                   {'Code': '1', 'Status': 'Pending'},
                                   {'Code': '2', 'Status': 'Completed'});
        this.paymentTypeList.unshift({'Code': 0, 'Remark': 'New Register'},
                                   {'Code': 1, 'Remark': 'Buy Now'},
                                   {'Code': 2, 'Remark': 'Upgrade'},
                                   {'Code': 3, 'Remark': 'Extend'},
                                   {'Code': 4, 'Remark': 'Top Up'});
        this.getAppCombo();
    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.isAfterViewInit = true;
    }

    /*
    @Input()
    get inputTransNo() {
        return this.transNo;
    }

    set inputTransNo(value) {
        this.transNo = value;
    }

    @Input()
    get inputBillNo() {
        return this.billNo;
    }

    set inputBillNo(value) {
        this.billNo = value;
    }*/

    getTableFilter(): string {
        let url = this.gridUrl;
        //if (this.transNo !== undefined && this.transNo !== null) url += `transno=${encodeURIComponent(this.transNo)}&`;
        //if (this.billNo !== undefined && this.billNo !== null) url += `billNo=${encodeURIComponent(this.billNo)}&`
        if (this.billingStartDate !== undefined && this.billingStartDate !== null) url += `billingStartDate=${encodeURIComponent(moment(new Date(this.billingStartDate)).format('LL'))}&`
        if (this.billingEndDate !== undefined && this.billingEndDate !== null) url += `billingEndDate=${encodeURIComponent(moment(new Date(this.billingEndDate)).format('LL'))}&`
        //+ `chargeType=${encodeURIComponent(this.chargeType)}&`;
        if (this.paymentStatus !== undefined && this.paymentStatus !== null) url += `paymentStatus=${encodeURIComponent(this.paymentStatus)}&`;
        if (this.appId !== undefined && this.appId !== null) url += `appId=${encodeURIComponent(this.appId)}&`;
        if (this.payType !== undefined && this.payType !== null) url += `paymentType=${encodeURIComponent(this.payType)}&`;
        return url;
    }

    getAppCombo() {
        let url = ProxyURL.GetAppMasterCombo;
        this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
            if (result){
                this.options = result;
                this.section = this.options[0];
            }
        });
    }

    onServiceChange(event: any): void {
        if (event == undefined) {
            this.appId = undefined;
        } else {
            this.appId = event.Code;
        }
        this.refresh();
    }

    onPaymentTypeChange(event: any): void {
        if (event == undefined) {
            this.payType = undefined;
        } else {
            this.payType = event.Code;
        }
        this.refresh();
    }

    refresh() {
        this.billingHistory.setURL(this.getTableFilter());
        this.billingHistory.refresh();
    }

    checkBillingStartDate(event?: any) {
        this.billingStartDate = event;
        this.refresh();
    }

    checkBillingEndDate(event?: any) {
        this.billingEndDate = event;
        this.refresh();
    }

    /*
    comboChargeTypeOnChanged(event?: any): void {
        this.refresh();
    }*/

    comboPaymentStatusOnChanged(event?: any): void {
        this.refresh();
    }

}
