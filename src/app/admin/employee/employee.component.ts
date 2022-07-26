import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { EntityDtoOfInt64, ProfileListDto, UserProfileServiceProxy, PermissionServiceProxy, FlatPermissionDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { LazyLoadEvent } from 'primeng/public_api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { CreateOrEditEmployeeModalComponent } from './create-or-edit-employee-modal.component';
import { ImpersonationService } from '@app/admin/users/impersonation.service';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { PermissionTreeModalComponent } from '../shared/permission-tree-modal.component';
import { ManageEntityDynamicParameterValuesModalComponent } from '@app/admin/dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/manage-entity-dynamic-parameter-values-modal.component';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { toDateStringFormat, stringToDate, toISOFormat } from '@shared/helpers/DateTimeHelper';
import * as XLSX from 'xlsx';
import { exportAsExcelFile } from '@shared/helpers/ExcelExporterHelper';
import { UploadBaseDto } from '@shared/models/model-upload';
import { ProfileDTO } from '@shared/models/model-profile';
import { convertCompilerOptionsFromJson } from 'typescript';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { saveAs } from '@progress/kendo-file-saver';
import * as JSZip from 'jszip';
import * as moment from 'moment';

type AOA = any[][];


interface Excelsheets {
    sheetname: any;
}

@Component({
    templateUrl: './employee.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./employee.component.less'],
    animations: [appModuleAnimation()]
})
export class EmployeeComponent extends AppComponentBase implements AfterViewInit {
    @ViewChild('baseList', { static: false }) baseList: BaseListComponent;
    @ViewChild('createOrEditEmployeeModal', { static: true }) createOrEditEmployeeModal: CreateOrEditEmployeeModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
    @ViewChild('permissionFilterTreeModal', { static: true }) permissionFilterTreeModal: PermissionTreeModalComponent;
    @ViewChild('dynamicParametersModal', { static: true }) dynamicParametersModal: ManageEntityDynamicParameterValuesModalComponent;
    @Output() onSelectedChange: EventEmitter<any> = new EventEmitter<any>();

    file: any = [];
    excelDataProfile: any;
    excelError = 0;
    duplicatedData: any[] = [];
    type: any;
    name: any;
    sheet: string;
    excelfile: any = undefined;
    excelsheets: Excelsheets[] = [];
    errorList: any = [];
    errorRow: any = [];
    processedDataProfile: any[] = [];
    uploadedDataProfile: any = [];
    uploadedFiles: any[] = [];
    hostDataProfile: any = [];
    routeAssign = '';
    status: boolean;
    current: string;
    filename: string;
    i = 0;
    er = 0;
    gridUrl = ProxyURL.GetUserProfile;
    permissionEdit = 'Pages.Administration.Employees.Edit';
    permissionDelete = 'Pages.Administration.Employees.Delete';
    canDownload = false;

    uploadUrl: string;
    selectedData: any[] = [];
    checked: any[] = [];
    comboBranch: any = [];
    selectedBranch: any;
    bulkQR: any[] = [];

    //Filters
    advancedFiltersAreShown = false;
    filterText = '';
    role = '';
    onlyLockedUsers = false;

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


    constructor(
        injector: Injector,
        public _impersonationService: ImpersonationService,
        private _UserProfileServiceProxy: UserProfileServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _activatedRoute: ActivatedRoute,
        private _httpClient: HttpClient,
        private _proxy: GenericServiceProxy,
        private _localStorageService: LocalStorageService
    ) {
        super(injector);
        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/Users/ImportFromExcel';
    }

    ngAfterViewInit(): void {
        this.reloadPage();
        this.getBranchCombo();
    }

    setUrl(): string {        
        let url = this.gridUrl;
        // if (this.selectedStatus !== undefined && this.selectedStatus !== null) { url += 'status=' + encodeURIComponent(this.selectedStatus) + '&'; }
        if (this.selectedBranch !== undefined && this.selectedBranch !== null) { url += 'bizLocID=' + encodeURIComponent(this.selectedBranch) + '&'; }
        // if (this.selectedVendor !== undefined && this.selectedVendor !== null) { url += 'vendorId=' + encodeURIComponent(this.selectedVendor) + '&'; }
        // if (this.startDate !== undefined && this.startDate !== null) { url += 'From=' + encodeURIComponent(moment(new Date(this.startDate)).format('LL')) + '&'; }
        // if (this.endDate !== undefined && this.endDate !== null) { url += 'To=' + encodeURIComponent(moment(new Date(this.endDate)).format('LL')) + '&'; }
        console.log(url);
        return url;
    }

    reloadPage(): void {
        this.baseList.setURL(this.setUrl());
        this.baseList.refresh();
    }

    getBranchCombo(): void {
        let url = ProxyURL.GetBranchCombo + "mode=0&bizregid=" + this.appStorage.bizRegID + "&";
        this._proxy.request(url, RequestType.Get)
        .subscribe(result => {
            result.result.forEach(item => {
                if (item.BranchCode !== '') {
                    item.Remark = item.Remark + ' (' + item.BranchCode + ')';
                }
            });
            this.comboBranch = result.result;
        });
    }

    createEmployee(): void {
        this.createOrEditEmployeeModal.show(null);
    }

    editEmployee(event: any): void {
        this.createOrEditEmployeeModal.show(event.UPFID);
    }

    deleteEmployee(event: any): void {
        this.message.confirm(
            this.l('EmployeeDeleteWarningMessage', event.FullName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    let url = ProxyURL.DeleteUserProfile + 'upfID=' + event.UPFID + '&bizLocID=' + event.BizLocID + '&mode=0';
                    console.log(url);
                    this._proxy.request(url, RequestType.Post, '')
                    .pipe(finalize(() => { this.spinnerService.hide(); }))
                    .subscribe(result => {
                        if (result.isSuccess) {
                            this.reloadPage();
                            this.notify.info(this.l('SavedSuccessfully'));
                        } else {
                            this.notify.error(this.l('Failed'));
                        }
                    });
                } else {
                    this.notify.error(this.l('NoFileToDeleted'));
                }
            }
        );
    }

    showDynamicParameters(user: ProfileListDto): void {
        // this.dynamicParametersModal.show('Plexform.Authorization.Users.User', user.id.toString());
    }

    select(data: any): void {
        this.selectedData = data;
        if(data.length > 0) {
            this.canDownload = true;
        } else {
            this.canDownload = false;
        }
    }

    async downloadSelected() {
        this.spinnerService.show();
        const jszip = new JSZip();
        this.bulkQR = [];
        let itemsProcessed = 0;
        for (let i=0;i<this.selectedData.length;i++) {
            itemsProcessed++;
            let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let rCode = '';
            let zipName = moment(new Date()).format('YYYYMMDD');
            for (let x=0;x<6;x++) {
                rCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            let result = await this.downloadBulkQR(this.selectedData[i]);
            this.bulkQR.push(result);
            if(itemsProcessed === this.selectedData.length) {
                for(let j = 0; j < this.bulkQR.length; j++) {
                    jszip.file(this.bulkQR[j].name+'.png', this.bulkQR[j].data)
                    if(j === (this.bulkQR.length -1)) {
                        this.spinnerService.hide();
                        jszip.generateAsync({ type: 'blob' }).then(function(content) {
                            // see FileSaver.js
                            saveAs(content, zipName + '_' + rCode + '.zip');
                        });
                    }
                }
            }    
        }
    }

    //#region QR
    convertBase64ToBlobData(base64Data: string, contentType: string='image/png', sliceSize=512) {
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
    
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
    
          const byteArray = new Uint8Array(byteNumbers);
    
          byteArrays.push(byteArray);
        }
    
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    downloadQR(event:any) {
        let qrVCardUrl = AppConsts.appBaseUrl + '/account/vcard?vcid=' + event.ReferralID + '&nm=' + event.FullName.replace(/[ ]/g, '_');
        let url = ProxyURL.GenerateQRBase64 + 'qrcode=' + qrVCardUrl.replace(/[\/]/g, '%2F').replace(/[?]/g, '%3F').replace(/[=]/g, '%3D').replace(/[ ]/g, '%40').replace(/[&]/g, '%26');
        this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
            let filename = event.ReferralID;
            let blobData = this.convertBase64ToBlobData(result);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) { //IE
              window.navigator.msSaveOrOpenBlob(blobData, filename);
            } else { // chrome
                let url = window.URL.createObjectURL(blobData);
                let a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }
        });
    }

    downloadBulkQR(event:any) {
        let qrVCardUrl = AppConsts.appBaseUrl + '/account/vcard?vcid=' + event.ReferralID + '&nm=' + event.FullName.replace(/[ ]/g, '_');
        let url = ProxyURL.GenerateQRBase64 + 'qrcode=' + qrVCardUrl.replace(/[\/]/g, '%2F').replace(/[?]/g, '%3F').replace(/[=]/g, '%3D').replace(/[ ]/g, '%40').replace(/[&]/g, '%26');
        return this._proxy.request(url, RequestType.Get).toPromise()
        .then(result => {
            let filename = event.ReferralID;
            let blobData = this.convertBase64ToBlobData(result);
            let data: any = { name: filename, data: blobData };
            return data;
        });
    }
    //#endregion

    //#region Excel 
    exportToExcel(): void {
        let url_ = ProxyURL.GetUserProfileToExcel + "bizRegID=" + this.appStorage.bizRegID + "&";
        if (this.filterText !== undefined)
            url_ += "Filter=" + encodeURIComponent("" + this.filterText) + "&"; 
        url_ += "MaxResultCount=" + encodeURIComponent("" + 0) + "&"; 
        url_ += "SkipCount=" + encodeURIComponent("" + 0) + "&"; 
        url_ = url_.replace(/[?&]$/, "");
        this._proxy.request(url_, RequestType.Get)
          .pipe(
            finalize(() => this.notify.info(this.l('DownloadingFile')))
          )
          .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
          });
    }

    //#region UploadExcel
    onExcelChange(event) {
        // this.isBusy = true;
        /* wire up file reader */
        this.excelfile = event.files[0];
        if (event.files && event.files.length <= 0) {
            // this.isBusy = false;
            this.notify.warn(this.l('NoFileSelected'));
        } else if (event.files.length > 1) {
            // this.isBusy = false;
            this.notify.warn(this.l('MultipleFileNotAllowed'));
        } else {
            this.onExcelLoad(event);
        }
    }

    onExcelLoad(file: any) {
        this.file = file;
        this.type = file.files[0].name.toLocaleLowerCase().includes('.xlsx') ? '.xlsx' : file.files[0].name.toLocaleLowerCase().includes('.csv') ? '.csv' : file.files[0].name.toLocaleLowerCase().includes('.xls') ? '.xls' : '';
        this.name = this.routeAssign === 'true' ? file.name.replace(('.xlsx' || '.csv'), '') : file.files[0].name + this.type;
        this.current = toDateStringFormat(file.lastmodifieddate, 'DD/MM/YYYY');
        this.filename = this.name;
        const reader: FileReader = new FileReader();
        reader.readAsBinaryString(file.files[0]);
        reader.onload = (e: any) => {
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });
            const wsData: string = wb.SheetNames[0]; //excel sheet
            // const wsItem: string = wb.SheetNames[1]; //excel sheet
            this.sheet = wsData;
            const empData: XLSX.WorkSheet = wb.Sheets[wsData]; //excel sheet
            // const item: XLSX.WorkSheet = wb.Sheets[wsItem]; //excel sheet
            /* save data */
            this.excelDataProfile = <AOA>(XLSX.utils.sheet_to_json(empData, { header: 1 })); //excel sheet
            this.clearEmptyRows();
            this.processProfile();
        };
    }

    clearEmptyRows() {
        if (this.excelDataProfile) {
            this.excelDataProfile = this.excelDataProfile.filter(x => x.filter(z => !isNaN(z) || z).length > 0);
        }
    }

    processProfile() {
        // this.info = false;
        this.spinnerService.show();
        this.excelDataProfile.shift();
        let errMsg = '';
        this.i = 0;
        this.er = 0;
        this.processedDataProfile = [];
        this.errorRow = [];
        this.errorList = [];
        this.uploadedDataProfile = [];
        this.processedDataProfile = this.excelDataProfile.map(item => ProfileDTO.fromExcel(item));
        this.gridUrl = ProxyURL.GetUserProfile;
        this.hostDataProfile = [];
        this._proxy.request(this.gridUrl, RequestType.Get)
        .subscribe(result => {
            this.hostDataProfile = result.items;
            this.processedDataProfile.forEach(row => {
                let errExist = '';
                if (this.hostDataProfile.some(x => x.firstName === row.firstName && x.lastName === row.lastName && x.emailAddress === row.emailAddress))
                {
                    row.hasError = true;
                    errExist = 'Data already Exist.';
                }
                if (row.hasError === true) {
                    this.status = true;
                    let data: any = {};
                    let err: any = {};
                    data.FirstName = row.firstName;
                    data.LastName = row.lastName;
                    data.EmailAddress = row.emailAddress;
                    data.Designation = row.designation;
                    data.MobileNo = row.mobileNo;
                    data.DirectNo = row.directNo;
                    data.ReferralID = row.referralID;
                    data.ReferralCode = row.referralCode;
                    this.er++;
                    let ErrorMsgg = '';
                    err.ErrorRow = '';
                    row.originalValue.forEach(errorRow => {
                        err.ErrorRow = 'row ' + errorRow.idx + ' is invalid data type error';
                        err.ErrorRow = (row.originalValue.length === 1 ? err.ErrorRow : ErrorMsgg.concat(err.ErrorRow));
                        ErrorMsgg = err.ErrorRow + ',';
                        errMsg = ErrorMsgg;
                    });
                    if (row.mandatoryColumns.length >= 0) {
                        row.mandatoryColumns.forEach(isMandatory => {
                            err.ErrorRow = (err.ErrorRow === '' ? 'row ' + isMandatory + ' is mandatory' : err.ErrorRow + ',' + 'row ' + isMandatory + ' is mandatory');
                            errMsg = err.ErrorRow;
                        })
                    }
                    if (errExist !== '') {
                        ErrorMsgg = errExist;
                        err.ErrorRow = errExist;
                        errMsg = errExist;
                    }
                    this.errorRow.push(err.ErrorRow)
                    this.errorList.push(data);
                } else {
                    this.status = false;
                    let data: any = {};
                    data.UPFID = this.appStorage.bizRegID;
                    data.BizRegID = this.appStorage.bizRegID;
                    data.FirstName = row.firstName;
                    data.LastName = row.lastName;
                    data.EmailAddress = row.emailAddress;
                    data.Designation = row.designation;
                    data.MobileNo = row.mobileNo;
                    data.DirectNo = row.directNo;
                    data.ReferralID = row.referralID;
                    data.ReferralCode = row.referralCode;
                    this.i++;
                    this.uploadedDataProfile.push(data);
                }
            });
            let originDataCount = this.processedDataProfile.length;
    
            this.excelError = this.processedDataProfile.filter(option => option.hasError).length;
    
            if (this.excelError) {
                this.processedDataProfile.sort((a, b) => {
                    if (a.hasError) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                errMsg = (errMsg ? errMsg + ' ' + this.l('And') + ' ' : errMsg + '') + this.l('UploadDataHasError');
            } else {
                this.processedDataProfile = this.processedDataProfile.filter((row, idx, arr) =>
                    arr.map(x => x.primaryKey ? x.primaryKey : x).indexOf(row.primaryKey ? row.primaryKey : row) === idx
                );
    
                let processedDataCount = this.processedDataProfile.length;
    
                if (originDataCount !== processedDataCount) {
                    errMsg = (errMsg ? errMsg + ' ' + this.l('And') + ' ' : errMsg + '') + this.l('UploadDuplicateFile', '' + (+originDataCount - processedDataCount));
                }
            }
    
            if (errMsg) {
                this.notify.error(errMsg, this.l('Warning'));
            }
            if (this.excelError === 0) {
                this.errorRow = [];
                // this.info = true;
                this.uploadDataProfile(this.file);
            } else {
                this.spinnerService.hide();
            }
        });
    }

    uploadDataProfile(data): void {
        let urlEmployeeProfile = ProxyURL.UploadUserProfile;
        if (urlEmployeeProfile !== undefined) {
            this._proxy.request(urlEmployeeProfile, RequestType.Post, this.uploadedDataProfile)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((result) => {
                if (result.isSuccess) {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.uploadedFiles.push(data.files[0]);
                    this.reloadPage();
                } else {
                    this.notify.error(this.l('Failed'));
                }
            });
        }
    }

    onUploadExcelError(): void {
        this.notify.error(this.l('ImportUsersUploadFailed'));
    }

    //#endregion
    //#endregion
}
