import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
;
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';
import { FileUploadComponent } from '@app/shared/form/file-upload/file-upload.component';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    templateUrl: './billing-upload.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./billing-upload.component.less'],
    animations: [appModuleAnimation()]
})
export class BillingUploadComponent extends AppComponentBase implements OnInit {
    @ViewChild('fileupload', { static: false }) fileupload: FileUploadComponent;
    @ViewChild('invoiceForm', { static: false }) invoiceForm: NgForm;

    apiURL = ProxyURL.PostUploadInvoice;
    uploadURL = ProxyURL.InvoiceUpload;
    //locale =  abp.localization.currentLanguage.name;
    inputHelper: any = {
        OrderNo: '',
        CustomerID: '',
        OrderDate: undefined,
        BillNo: '',
        TransDate: undefined,
        TransAmt: '',
        TransAmtOrg: '',
        Currency: 'MYR'
    };
    orderList: any[] = [];
    branchList: any[] = [];
    uploadExt = 'image/*, .pdf';
    maxFileSize = 3145728;
    selectedFiles: any[] = [];

    hostTID = null;
    hostID = '';
    type = 1;

    saving = false;
    poMask = '4599999999';

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _route: Router,
    ) {
        super(injector);
        this.hostTID = 2; //temporary KA-DEMO
        this.hostID = '070000'; //temporary KA-DEMO
    }

    ngOnInit() {
        this.getBranchCombo();
    }

    onSelectedOrder(event: any): void {
        if (event.Remark) {
            this.inputHelper.OrderDate = new Date(event.Remark);
        } else {
            this.inputHelper.OrderDate = '';
        }
    }

    clear(): void {
        this.inputHelper = {
            OrderNo: '',
            CustomerID: '',
            OrderDate: undefined,
            BillNo: '',
            TransDate: undefined,
            TransAmt: '',
            TransAmtOrg: '',
            Currency: 'MYR'
        };
        this.fileupload.clearUpload();
        this.selectedFiles = [];
        this.invoiceForm.resetForm();
    }

    getPOCombo() {
        let url = ProxyURL.GetAssignedPOCombo + 'hostTID=' + this.hostTID + '&hostID=' + this.hostID + '&type=' + this.type + '&';
        if (url !== undefined) {
            this._proxy.request(url, RequestType.Get)
                .subscribe((result) => {
                    this.orderList = result;
                });
        }
    }

    getBranchCombo(): void {
        let branchURL = ProxyURL.GetBranchCombo;
        this.spinnerService.show();
        this._proxy.request(branchURL + 'mode=1&', RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.branchList = result.result;
            });
    }

    save(): void {
        if (this.fileupload.fileUpload.files.length > 0) {
            if (Number(this.inputHelper.TransAmtOrg) > 0 && Number(this.inputHelper.TransAmt) > 0) {
                this.saving = true;
                this.fileupload.startUpload();
            } else {
                this.message.warn(this.l('AmountMustGreaterThan'));
            }
        } else {
            this.notify.error(this.l('PleaseAttachInvoiceFile'));
        }
    }
    
    onSelected(event): void {
        this.selectedFiles = event;
    }

    onUploadComplete(event): void {
        if (event) {
            this.inputHelper.TID = this.hostTID;
            this.inputHelper.FullPathRef = event[0].path;

            this.spinnerService.show();
            this._proxy.request(this.apiURL, RequestType.Post, this.inputHelper)
                .pipe(finalize(() => { this.spinnerService.hide(); }))
                .subscribe(result => {
                    if (Boolean(result.success)) {
                        this.clear();
                        this.notify.success(this.l('InvoiceSubmitted'));
                    } else {
                        this.message.error(result.error, this.l('FailedToUploadInvoice'));
                    }
                });
        }
        this.saving = false;
    }

    back(){
        this._route.navigate(['/app/biz/billing-upload']);
    }
}
