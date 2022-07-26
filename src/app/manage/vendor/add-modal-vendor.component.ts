import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'addVendorModal',
    templateUrl: './add-modal-vendor.component.html',
    animations: [appModuleAnimation()]
})

export class ModalVendorManagementComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('addVendorModal', { static: true }) modal: ModalDirective;
    @ViewChild('baselistVendorModal', { static: false }) baselistVendorModal: BaseListComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    gridUrl: string;

    vendorList: any[] = [];
    dataType: any[] = [];
    inputHelper: any = {};
    type: string;

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        //console.log(this.appStorage);
        //this.populateData();
    }

    ngAfterViewInit(): void {

    }

    populateData(): void {
        //this.spinnerService.show();
        this.gridUrl = ProxyURL.GetVendorListAll + 'bizregid=' + this.appStorage.bizRegID + '&' + 'type=' + this.type + '&';
        this._proxy.request(this.gridUrl, RequestType.Get)
        // .pipe(finalize(() => {
        //     this.spinnerService.hide();
        // }))
        .subscribe(result => {
            this.baselistVendorModal.refresh();
        });
    }

    // populateType(): void {
    //     let url = ProxyURL.GetCodeMasterCombo + 'code=RTC&';
    //     this._proxy.request(url, RequestType.Get)
    //     .subscribe(result => {
    //         this.dataType = result;
    //     });
    // }

    show(data?: any): void {
        this.type = data;
        console.log(this.type);
        this.modal.show();
        this.populateData();
        //this.populateType();
    }

    close(): void {
        this.vendorList = [];
        this.modal.hide();
    }

    refresh(): void {
        this.gridUrl = ProxyURL.GetVendorListAll + 'bizregid=' + this.appStorage.bizRegID + '&';
        this.baselistVendorModal.gridUrl = this.gridUrl;
    }

    save(): void {
        this.spinnerService.show();
            let data: any[]= [];
            this.vendorList.forEach(row => {
                let vendorData: any = {};
                vendorData.TID = 2;
                vendorData.BizRegID = this.appStorage.bizRegID;
                vendorData.PaxRegID = row.ID;
                vendorData.TypeCode = this.type;
                vendorData.PaxUserID = 0;
                data.push(vendorData);
            })
            console.log(data);
            let url = ProxyURL.AddVendorParticipant;
            this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                console.log(result);
                if (result == "userID_not_exist") {
                    this.notify.error(this.l('UserIDNonExist'));
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close()
                    //location.reload();
                } else if (result == "data_exist") {
                    this.notify.error(this.l('dataExist'));
                    //this.notify.error(this.l('FailedToSave'));
                } else if (result == "false") {
                    this.notify.error(this.l('FailedToSave'));
                } else {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.modalSave.emit();
                    this.close()
                    //location.reload();
                }
                //this.spinnerService.hide();
            })
    }

    onSelectedChange(data: any): void {
        this.vendorList = data;
        //console.log(this.vendorList);
    }

}