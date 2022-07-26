import { Component, OnInit, AfterViewInit, Injector, ElementRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { animation } from '@angular/animations';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'eventEditModal',
    templateUrl: './event-edit.component.html',
    animations: [appModuleAnimation()]
})

export class EventEditModalComponent extends AppComponentBase implements OnInit, AfterViewInit {
    
    @ViewChild('editModal', {static: true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    
    active = false;
    saving = false;

    item: any = {};
    input: any = {};
    //viewscript: any;
    
    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
      ) {
        super(injector);
      }

    ngOnInit(): void {
        //throw new Error("Method not implemented.");
    }

    ngAfterViewInit(): void {
        //throw new Error("Method not implemented.");
    }

        show(data: any): void {
        let itemurl = ProxyURL.GetCampaignItemList;
        if (data.CampNo) { itemurl += 'EventNo=' + encodeURIComponent('' + data.CampNo) + '&'; }
        if (data.BizRegID) { itemurl += 'BizRegID=' + encodeURIComponent('' + data.BizRegID) + '&'; }
        if (data.BizLocID) { itemurl += 'BizLocID=' + encodeURIComponent('' + data.BizLocID) + '&'; }
        if (data.ItemCode) { itemurl += 'ItemCode=' + encodeURIComponent('' + data.ItemCode) + '&'; }
        if (data.SeqNo) { itemurl += 'SeqNo=' + data.SeqNo + '&'; }
        this._proxy.request(itemurl, RequestType.Get)
        .subscribe(result => {
            this.item = result.items[0];
            //console.log('result : ' + this.item)
            //this.viewscript = this.item.ItemDesc_B.replace(/\|/g, "\n");
        });

        this.active = true;
        this.modal.show();
    }

    save(): void {
        //let data: any = [];

        this.input.BizRegID = this.item.BizRegID;
        this.input.BizLocID = this.item.BizLocID;
        this.input.CampNo = this.item.CampNo;
        this.input.SeqNo = this.item.SeqNo;
        this.input.ItemCode = this.item.ItemCode;
        this.input.UnitPriceReq_C = this.item.UnitPriceReq_C;
        this.input.TotalPriceBase = this.item.TotalPriceBase;
        this.input.UnitPriceRef = this.item.UnitPriceRef;
        this.input.UnitPriceReqVar = this.item.UnitPriceReqVar;

        //data.push(this.input);
        //console.log('Hasil Edit : ' + JSON.stringify(data))
        //let dataEdit = JSON.stringify(data);
        //console.log('Data Edit : ' + dataEdit);
        let url = ProxyURL.UpdateCampaignITEM + 'mode=1' + '&';
        //let notif = '';
        console.log('input : ' + JSON.stringify(this.input));
        this._proxy.request(url, RequestType.Post, this.input)
        .subscribe((result) => {
            if(result.success = 'true') {
                this.notify.success(this.l('EditEventItemSuccess'));
                this.modalSave.emit();
                this.close();
            } else {
                this.notify.error(this.l('EditEventItemFailed'));
            }
        });
    }

    close(): void {
        this.active = false;
        //this.resetForm.reset();
        this.modal.hide();
    }

}