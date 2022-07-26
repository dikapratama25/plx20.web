import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { ModalBillingRequestComponent } from './modal-preview-billing-request.component';
import { PermissionCheckerService } from 'abp-ng2-module';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './billing-request.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./billing-request.component.less'],
    animations: [appModuleAnimation()]
})
export class BillingRequestComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('baseList', { static: false }) baseList: BaseListComponent;
    @ViewChild('previewBillingModal', { static: false }) previewBillingModal: ModalBillingRequestComponent;

    permissionAddVendor = 'Pages.Manage.Vendor.Create';
    permissionAddCustomer = 'Pages.Manage.Customer.Create';

    panel: any = {
        overall: {
            Total: 0,
            Pending: 0,
            Completed: 0
        },
        monthly: {
            Total: 0,
            Pending: 0,
            Completed: 0
        }
    };
    panelUrl = ProxyURL.GetSubmittedInvoicePanel;
    gridUrl = ProxyURL.GetSubmittedInvoiceList;
    hostTID = null;
    hostID = '';
    type = 1;
    selectedStatus: any;
    comboStatusModel: any = [];
    selectedBranch: any;
    comboBranch: any = [];
    selectedVendor: any;
    comboVendor: any = [];
    startDate = null; //moment(new Date()).format('YYYY-MM-DD');
    endDate = null;
    mode: number;
    afterViewInit = false;

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _activedRoute: ActivatedRoute
    ) {
        super(injector);        
        if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'billing-request').length > 0) {
            this.mode = 1;
        } else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'billing-submission').length > 0) {
            this.mode = 0;
        } 
    }

    ngOnInit() {
        this.panelUrl += 'type=' + this.type + '&mode=' + this.mode + '&';
        this.gridUrl += 'type=' + this.type + '&mode=' + this.mode + '&';

        this.comboStatusModel.unshift({ 'Code': '1', 'Status': 'Completed' });
        this.comboStatusModel.unshift({ 'Code': '0', 'Status': 'Submitted' });
        this.comboStatusModel.unshift({ 'Code': '', 'Status': 'All' });
        this.selectedStatus = this.comboStatusModel[0].Code;
    }

    ngAfterViewInit(): void {
        this.spinnerService.show();
        this._proxy.request(this.panelUrl, RequestType.Get)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result) {
                    this.panel = result;
                }
            });
        this.getBranchCombo();
        if (this.mode === 0) { this.getVendorCombo(); }
        this.refresh();
        this.afterViewInit = true;
    }

    getBranchCombo(): void {
        let branchURL = ProxyURL.GetBranchCombo + '&mode=' + this.mode + '&';
        this.spinnerService.show();
        this._proxy.request(branchURL, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.comboBranch = result.result;
            });
    }
    
    getVendorCombo(): void {
        let branchURL = ProxyURL.GetBranchRelationCombo;
        this.spinnerService.show();
        this._proxy.request(branchURL + 'relationType=' + this.type + '&', RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.comboVendor = result.result;
            });
    }

    refresh() {
        this.baseList.setURL(this.setUrl());
        this.baseList.refresh();
    }

    checkStartDate(event?:any){
        if (this.afterViewInit) {
            this.startDate = event;
            this.refreshFilter(1);
        }
    }

    checkEndDate(event?:any){
        if (this.afterViewInit) {
            this.endDate = event;
            this.refreshFilter(1);
        }
    }

    refreshFilter(event?: any): void {
        if (event !== null && event !== undefined) {
            this.refresh();
        }
    }

    setUrl(): string {
        
        let url = this.gridUrl;
        if (this.selectedStatus !== undefined && this.selectedStatus !== null) { url += 'status=' + encodeURIComponent(this.selectedStatus) + '&'; }
        if (this.selectedBranch !== undefined && this.selectedBranch !== null) { url += 'customerId=' + encodeURIComponent(this.selectedBranch) + '&'; }
        if (this.selectedVendor !== undefined && this.selectedVendor !== null) { url += 'vendorId=' + encodeURIComponent(this.selectedVendor) + '&'; }
        if (this.startDate !== undefined && this.startDate !== null) { url += 'From=' + encodeURIComponent(moment(new Date(this.startDate)).format('LL')) + '&'; }
        if (this.endDate !== undefined && this.endDate !== null) { url += 'To=' + encodeURIComponent(moment(new Date(this.endDate)).format('LL')) + '&'; }
        return url;
    }

    onPanelClick(mode: string) {
        this.selectedStatus = mode;
        this.refreshFilter(mode);
    }

    async onIconClick(event: any) {
        let field = event.field;
        let data = event.data;
        
        let a = this.getFileName(event.data.InvoiceNo, event.data.OrderNo, event.data.CompanyName);
        let b = this.getFileExtension(event.data.Preview);
        let c = event.data.Preview.replace(/\\/g, '/');
        this.spinnerService.show();
        try{
            let api_call = await fetch(c);

            this.spinnerService.hide();
            if(api_call.status===200){
                this.previewBillingModal.show(event.data);
            }else{
                this.notify.error(this.l('DocumentUnavailable'));
            }
        }catch(error){ 
            this.spinnerService.hide();
            this.notify.error(this.l('DocumentUnavailable'));
        }
    }

     async downloadDocument(event: any) {
        if (event.Preview == null || event.Preview === '') {
            this.notify.error(this.l('DocumentUnavailable'));
        } else {
            this.spinnerService.show();
            let a = this.getFileName(event.InvoiceNo, event.OrderNo, event.CompanyName);
            let b = this.getFileExtension(event.Preview);
            let c = event.Preview.replace(/\\/g, '/');
            try{
                let api_call = await fetch(c);

                this.spinnerService.hide();
                if(api_call.status===200){
                    let blobs = await api_call.blob();
                    let url = window.URL.createObjectURL(blobs);
                    let anchor = document.createElement("a");
                    anchor.download = a + b;
                    anchor.href = url;
                    anchor.click();
                }else{
                    this.notify.error(this.l('DocumentUnavailable'));
                }
            }catch(error){
                
                this.spinnerService.hide();
                this.notify.error(this.l('DocumentUnavailable'));
            }
            
            
        }
    }

    getFileName(InvoiceNo: string, OrderNo: string, CompanyName: string): string {
        return  (InvoiceNo + '_' + OrderNo + '_' + CompanyName).replace(' ', '_');
    }

    getFileExtension(fileName: string): string {
        return '.' + fileName.split('.').pop();
    }
}
