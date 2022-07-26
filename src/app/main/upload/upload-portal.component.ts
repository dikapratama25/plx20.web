import { result } from 'lodash';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';
import { FileUploadComponent } from '@app/shared/form/file-upload/file-upload.component';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
// import { ModalBillingRequestComponent } from './modal-preview-upload-portal.component';
import { PermissionCheckerService } from 'abp-ng2-module';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    templateUrl: './upload-portal.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./upload-portal.component.less'],
    animations: [appModuleAnimation()]
})
export class UploadPortalComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('fileupload', { static: false }) fileupload: FileUploadComponent;
    @ViewChild('baseList', { static: false }) baseList: BaseListComponent;
    // @ViewChild('previewBillingModal', { static: false }) previewBillingModal: ModalBillingRequestComponent;

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
    panelUrl = ProxyURL.GetSubmittedFilePanel;
    gridUrl = ProxyURL.GetSubmittedFileList;
    uploadURL = '';
    hostTID = null;
    hostID = '';
    selectedStatus: any;
    comboStatusModel: any = [];
    selectedBranch: any;
    comboBranch: any = [];
    selectedVendor: any;
    comboVendor: any = [];
    startDate = null; //moment(new Date()).format('YYYY-MM-DD');
    endDate = null;
    mode: number;
    type = '';
    despath = '';
    afterViewInit = false;
    fileName = '';
    fileSize = 1000000;
    fileType = 'image/*, .csv, .xls, .xlsx, .doc, .docx, .pdf, .zip';
    inputHelper: any = {
        DocNo: '', 
        DocType: '', 
        PathRef: ''
    };
    selectedFiles: any[] = [];
    saving = false;
    uplSuccess = false;

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _httpClient: HttpClient,
        private _activedRoute: ActivatedRoute
    ) {
        super(injector);        
    }

    ngOnInit() {
        this.mode = 0;
        this.type = 'TEST';
        this.panelUrl += 'type=' + this.type + '&mode=' + this.mode + '&';
        this.gridUrl += 'type=' + this.type + '&mode=' + this.mode + '&';
        let UrlUploadSettings = ProxyURL.GetAllListSyspreft + 'appid=1&grpid=UPLSET&';
        this._proxy.request(UrlUploadSettings, RequestType.Get)
            .subscribe(result => {
                if (result) {
                    // this.fileName = result.filter(x => x.sysKey === 'FILENAME')[0].sysValueEx;
                    this.fileSize = result.filter(x => x.sysKey === 'FILESIZE')[0].sysValueEx;
                    this.fileType = result.filter(x => x.sysKey === 'FILETYPE')[0].sysValueEx.replace(/\;/g, ', ');
                    this.despath = result.filter(x => x.sysKey === 'DESPATH')[0].sysValueEx;
                }
            });
        this.uploadURL = ProxyURL.FileUploads;
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
        // this.getBranchCombo();
        if (this.mode === 0) { this.getVendorCombo(); }
        // this.refresh();
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
        console.log(event);
        let a = this.getFileName(event.data.InvoiceNo, event.data.OrderNo, event.data.CompanyName);
        let b = this.getFileExtension(event.data.Preview);
        let c = event.data.Preview.replace(/\\/g, '/');
        this.spinnerService.show();
        
        let api_call = await fetch(c);

        this.spinnerService.hide();
        if(api_call.status===200){
            // this.previewBillingModal.show(event.data);
        }else{
            this.notify.error(this.l('DocumentUnavailable'));
        }
    }

    async downloadDocument(event: any) {
        console.log(event);
        if (event.Preview == null || event.Preview === '') {
            this.notify.error(this.l('DocumentUnavailable'));
        } else {
            this.spinnerService.show();
            let a = this.getFileName(event.InvoiceNo, event.OrderNo, event.CompanyName);
            let b = this.getFileExtension(event.Preview);
            let c = event.Preview.replace(/\\/g, '/');
        
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
            
        }
    }

    getFileName(InvoiceNo: string, OrderNo: string, CompanyName: string): string {
        return  (InvoiceNo + '_' + OrderNo + '_' + CompanyName).replace(' ', '_');
    }

    getFileExtension(fileName: string): string {
        return '.' + fileName.split('.').pop();
    }

    clear(): void {
        this.inputHelper = {
            DocNo: '', 
            DocType: '', 
            PathRef: ''
        };
        this.fileupload.clearUpload();
        this.selectedFiles = [];
        this.fileName = '';
        window.location.reload();
    }

    onSelected(event): void {
        this.selectedFiles = event;
        this.fileName = event[0].name;
    }

    save(): void {
        if (this.fileupload.fileUpload.files.length > 0) {
            this.saving = true;
            this.fileupload.startUpload();
        } else {
            this.notify.error(this.l('PleaseAttachFile'));
        }
    }
    
    onUploadComplete(event): void {
        if (event) {
            this.inputHelper.DocNo = this.selectedFiles[0].name;
            this.inputHelper.DocType = 'TEST';
            this.inputHelper.TID = this.hostTID;
            // this.inputHelper.PathRef = event[0].path;

            let fileName = event[0].path.split('\\')[3];
            let sourcePath = event[0].path.split('\\')[0] + '\\' + event[0].path.split('\\')[1] + '\\' + event[0].path.split('\\')[2] + '\\';
            let destinationPath = sourcePath + this.despath + '\\';
            let moveUrl = ProxyURL.MoveFile + 'filename=' + fileName + '&source=' + sourcePath.replace(/[:]/g, '%3A').replace(/[\\]/g, '%5C') + '&destination=' + destinationPath.replace(/[:]/g, '%3A').replace(/[\\]/g, '%5C') + '&'
            this._proxy.request(moveUrl, RequestType.Get)
                .subscribe(result => {
                    if (result.cointains('Success')) {
                        this.clear();
                        this.notify.success(this.l('FileMoved'));
                    } else {
                        this.message.error(result.error, this.l('FailedToMoveFile'));
                    }
                });
            this.spinnerService.show();
            this.inputHelper.PathRef = destinationPath + fileName;
            this._proxy.request(ProxyURL.PostUploadFile, RequestType.Post, this.inputHelper)
                .pipe(finalize(() => { 
                    this.baseList.refresh(); 
                    this._proxy.request(this.panelUrl, RequestType.Get)
                    .pipe(finalize(() => { this.spinnerService.hide(); }))
                    .subscribe(result => {
                        if (result) {
                            this.panel = result;
                        }
                    });
                }))
                .subscribe(result => {
                    if (Boolean(result.success)) {
                        this.clear();
                        this.notify.success(this.l('FileSubmitted'));
                    } else {
                        this.message.error(result.error, this.l('FailedToUploadFile'));
                    }
                });
        }
        this.saving = false;
    }

}
