import { finalize, filter } from 'rxjs/operators';
import { Component, Injector, ViewChild, EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CommitteeGridComponent } from './committee-grid.component';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { CommiteRoleType } from '@shared/AppEnums';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CommitteeComponent } from 'app/event/committee/committee.component';

@Component({
    selector: 'committeeInfoDetailModal',
    templateUrl: './committee-info-detail.component.html'
})
export class CommitteeInfoDetailModalComponent extends AppComponentBase {
    @ViewChild('committeeModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('requesterBaseList', { static: false }) requesterBaseList: BaseListComponent;
    @ViewChild('commercialBaseList', { static: false }) commercialBaseList: BaseListComponent;
    @ViewChild('technicalBaseList', { static: false }) technicalBaseList: BaseListComponent;
    @ViewChild('mainTabs', { static: false }) mainTabs: TabsetComponent;

    active = false;
    saving = false;
    gridURL:string;
    campID = '';
    existcampID = '';
    selected: any[] = [];
    data: any = {};
    datas: any[] = [];
    draftFlag=false;
    eventMode?= '';
    bizRegID?= '';
    showDelete=false;

    constructor(
        injector: Injector,
        private _storage: AppStorage,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    show(data?:any,draftFlag?:any): void {
        
        if(draftFlag == false){
            this.showDelete = true;
        }else{
            this.showDelete = false;
        }
        this.gridURL = ProxyURL.GetParticipantByVendorAssigned+"campID="+data.CampID+"&userID="+data.UserID+"&";
        this.active = true;
        this.draftFlag = draftFlag;
        this.modal.show();
     
    }

 delete(data?:any){
    
    if(this.selected.length>0){
       let data = this.selected;
       
        let url = ProxyURL.DeleteCommitteeAssigned;
        this.spinnerService.show();
        this._proxy.request(url, RequestType.Post, data)
        .pipe(finalize(() => { this.spinnerService.hide(); }))
        .subscribe(result => {
          if (result.isSuccess) {
            // this.committeegrid.remove();
            this.modalSave.emit();
            this.close();
            this.notify.info(this.l('SavedSuccessfully'));
          } else {
            this.notify.error(this.l('Failed'));
          }
        });
    }
 }



    close(): void {
        this.active = false;
        this.selected=[];
        this.modal.hide();
    }

    select(data: any): void {
        
        this.selected = data;
        if(this.draftFlag == false && data.length>0){
            this.showDelete = true;
        }else{
            this.showDelete = false;
        }
    }
}
