import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SelectPackageComponent } from './select/select-package.component';

@Component({
    selector: 'addServiceModal',
    templateUrl: './select-service.component.html'
})

export class AddServiceModalComponent extends AppComponentBase {
    @ViewChild('serviceModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('servicepackage', { static: false }) servicepackage: SelectPackageComponent;
    mode: number = 0;
    appId!: number | undefined;
    selectedIndex!: number | undefined;
    active = false;
    saving = false;
    section: any = {};
    options: {Code: number, Remark: string}[] = [];

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
        let url = ProxyURL.GetAppMasterCombo;
        this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
            if (result){
                this.options = result;
                this.section = this.options[0];
            }
        });
        this.active = true;
        // this.draftFlag = draftFlag;
        this.modal.show();     
    }

    close(): void {
        // this.active = false;
        // this.selected=[];
        this.modal.hide();
    }    

    onServiceChange(event: any): void {
        this.appId = event.Code;
        this.selectedIndex = 0;
        this.servicepackage.refresh(this.appId);
        this.servicepackage.toggle(this.selectedIndex);
    }

    onPackageClick(event: any): void {
        this._router.navigate(['/account/upgrade'], { queryParams: { upgradeEditionId: event.edition.id, editionPaymentType: event.payment } });
        this.modal.hide();
    }
}