import { finalize } from 'rxjs/operators';
import { Component, Injector, ViewChild, EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ParticipantGridComponent } from './participant-grid.component';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';

@Component({
    selector: 'participantListModal',
    templateUrl: './participant-listing.component.html'
})
export class ParticipantListModalComponent extends AppComponentBase {
    @ViewChild('participantModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('supplist', { static: false }) supplist: BaseListComponent;
    @ViewChild('participantgrid', { static: false }) participantgrid: ParticipantGridComponent;

    active = false;
    saving = false;
    suppUrl: string;
    partUrl: string;
    campID = '';
    existcampID = '';
    eventMode = '';
    selected: any[] = [];
    data: any = {};
    datas: any[] = [];
    selectedPaxMode: any;
    comboPaxMode: any = [
        { Code: "1", Remark: "Service Vendor", },
        { Code: "2", Remark: "Supply Vendor" },
        { Code: "3", Remark: "Tender Winner" }
    ];

    constructor(
        injector: Injector,
        private _storage: AppStorage,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    show(eventMode: string, currentId?: string, data?: any): void {

        this.active = true;
        this.modal.show()
        this.existcampID = currentId;
        this.eventMode = eventMode;
        this.suppUrl = ProxyURL.GetParticipantList + 'CampID=' + this.existcampID + '&Mode=' + this.eventMode + '&';
        this.selected = [];

        // console.log(data);
    }

    onShown(): void {
        this.suppUrl = ProxyURL.GetParticipantList + 'CampID=' + this.existcampID + '&Mode=' + this.eventMode + '&';
        this.selected = [];
    }

    select(data: any): void {
        this.selected = data;
    }

    add() {
        this.datas = [];
        this.selected.forEach(element => {
            this.data = {};
            this.data.CampID = this.existcampID;
            this.data.PONo = element.PONo;
            this.data.BizRegID = element.ID;
            this.data.BizLocID = element.BizLocID;
            this.data.OrganizationName = element.BranchName;
            this.data.Address1 = element.Address1;
            this.data.ContactPerson = element.ContactPerson;
            this.data.ContactDesignation = element.ContactDesignation;
            this.data.ContactEmail = element.Email;
            this.data.ContactTelNo = element.ContactTelNo;
            this.data.ContactMobile = element.ContactMobile;
            this.data.PaxMode = this.selectedPaxMode;
            this.data.IsReq = 1;
            this.data.Incumbent = 'Yes';
            this.data.IsApproved = 1;
            this.data.IsResponse = 1;
            this.data.InUse = 1;
            this.data.StatusDesc = element.Designation;
            this.data.Status = 1;
            this.datas.push(this.data);
        });
        // this.participantgrid.set(this.datas);
    }

    remove() {
        let url = ProxyURL.GetParticipantList + 'CampID=' + this.existcampID + '&Mode=' + this.eventMode + '&';
        this.participantgrid.refresh(url);
    }

    change() {
        this.participantgrid.change();
    }

    onPaxModeChange(event: any) {
    }

    save(): void {
        if (this.selected !== null && this.selected.length > 0) {
            if (this.selectedPaxMode !== null && this.selectedPaxMode !== undefined) {
                this.saving = true;
                let url = ProxyURL.InsertParticipant;
                // let data = this.participantgrid.checked;
                this.add();
                let data = this.datas;
                if (data !== null && data !== undefined && Array.isArray(data) && data.length) {
                    this.spinnerService.show();
                    this._proxy.request(url, RequestType.Post, data)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                      }))
                        .subscribe(result => {
                            if (result.isSuccess) {
                                this.notify.info(this.l('SavedSuccessfully'));
                                this.close();
                                this.modalSave.emit(data);
                            } else {
                                this.notify.error(this.l('Failed'));
                                this.saving = false;
                            }
                        });
                } else {
                    this.notify.warn(this.l('PleaseSelectData'));
                    this.saving = false;
                }
            } else {
                this.notify.warn(this.l('PleaseSelectVendorType'));
            }
        } else {
            this.notify.warn(this.l('PleaseSelectData'));
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
