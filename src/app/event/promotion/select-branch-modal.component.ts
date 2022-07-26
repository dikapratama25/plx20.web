import { FileUpload } from 'primeng/fileupload';
//import { CreateOrEditBranchModalComponent } from './create-or-edit-branch-modal.component';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { Table } from 'primeng/table';
import { SaveType } from '@shared/AppEnums';
import { element } from 'protractor';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Injector, Input, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/public_api';
import { Paginator } from 'primeng/paginator';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';



@Component({
    selector: 'selectBranchModal',
    templateUrl: './select-branch-modal.component.html'
})

export class SelectBranchModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('dataTable', {read: true, static: false}) dataTable: Table;
    @ViewChild('paginator', {read: true, static: false}) paginator: Paginator;
    @ViewChild('selectBranchModal', {static: false}) modal: ModalDirective;
    @ViewChild('ExcelFileUpload', { static: true }) excelFileUpload: FileUpload;
    //@ViewChild('createOrEditBranchModal', {static: false}) createOrEditBranchModal: CreateOrEditBranchModalComponent;
    @ViewChild('branchListComponent', {static: false}) branchListComponent: BaseListComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();


    active = false;
    saving = false;
    isBusy = false;

    gridUrl = ProxyURL.GetCompanyLocation;
    selectData: any[] = [];
    permissionCreate = '';
    permissionEdit = 'Pages.Administration.Users.Edit';
    permissionDelete = 'Pages.Administration.Users.Delete';
    inputHelper: any = {};
    campaignNo: string;
    selectedGallery: any = {};

    constructor(
        injector: Injector,
        private __proxy: GenericServiceProxy,
        private _storage: AppStorage
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.inputHelper.WebSiteName = '';
        this.gridUrl += 'approvalstatus=1&bizregid=' + this._storage.bizRegID + '&';
    }

    show(campno?: string, data?: any): void {
        this.campaignNo = campno;
        this.selectedGallery = data;
        this.active = true;
        this.refresh();
        this.modal.show();
    }

    // edit(data?: any): void {
    //     this.createOrEditBranchModal.show(data);
    //   }
    refresh(): void {
        this.branchListComponent.refresh();
    }

    close(): void {
        this.refresh();
        this.active = false;
        this.modal.hide();
    }

    onSelectedChange(data: any): void {
        if (data.length > 0) {
            this.inputHelper.WebSiteName = data[0].BranchName;
            this.selectData = data;
        }
    }

    subscribe(): void {
        let data: any[] = [];
        if (this.selectData) {
            this.selectData.forEach(row => {
                let selectedWebsite: any = {};
                selectedWebsite.BizRegID = this._storage.bizRegID;
                selectedWebsite.BizLocID = row.BizLocID;
                selectedWebsite.CampNo = this.campaignNo;
                selectedWebsite.ItemCode = this.selectedGallery.DocCode;
                selectedWebsite.CreateBy = this.appSession.user.userName;
                selectedWebsite.SeqNo = 0;
                data.push(selectedWebsite);
            });
            this.message.confirm(
                this.l('DataSaveConfirmationMessage'),
                this.l('AreYouSure'),
                isConfirmed => {
                    if (isConfirmed) {
                        this.isBusy = true;

                        let emailData: any[] = data;
                        for (let i = 0; i < emailData.length; i++)
                        {
                            emailData[i].BranchName = this.selectData[i].BranchName;
                            emailData[i].ContactPerson = this.selectData[i].ContactPerson;
                            this.sendEmail(emailData[i]);
                        }

                        this.__proxy.request(ProxyURL.SubscribeCampaign, RequestType.Post, data)
                            .pipe(finalize(() => {
                                this.isBusy = false;
                                this.close();
                            }))
                            .subscribe(result => {
                                this.notify.success(this.l('SuccessfullySaved'));
                            });
                    }
                }
            );
        }
    }

    sendEmail(data) {
        let url = ProxyURL.SubscribeCampaignEmail;

        let emailHelper = {
            MsgID: 'Subscribed' + '-' + data.ItemCode,
            EmailAddress: '',
            CampaignName: this.selectedGallery.Description,
            AffiliateName: data.BranchName,
            AffiliateBizRegID: '',
            AffiliateBizLocID: '',
            WebsiteName: data.ContactPerson,
            Status: 'Subscribed',
            Content: 'A campaign banner need admin approval',
            EmailTemplateName : ''
        };

        console.log('Email Helper: ' + JSON.stringify(emailHelper));

        if (url != null) {
            this.__proxy.request(url, RequestType.Post, emailHelper)
                .subscribe(result => { });
        }
    }
}
