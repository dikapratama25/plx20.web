import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'serviceListModal',
    templateUrl: './service-listing.component.html'
})

export class ServiceListModalComponent extends AppComponentBase {
    @ViewChild('browseModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    mode: number = 0;
    active = false;
    saving = false;

    constructor(
        injector: Injector,
        private _router: Router,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    show(data?:any): void {        
        // if(draftFlag == false){
        //     this.showDelete = true;
        // }else{
        //     this.showDelete = false;
        // }
        // this.gridURL = ProxyURL.GetParticipantByVendorAssigned+"campID="+data.CampID+"&userID="+data.UserID+"&";
        this.active = true;
        // this.draftFlag = draftFlag;
        this.modal.show();     
    }

    close(): void {
        // this.active = false;
        // this.selected=[];
        this.modal.hide();
    }    
}