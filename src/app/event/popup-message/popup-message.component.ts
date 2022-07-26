import { finalize } from 'rxjs/operators';
import { Component, Injector, ViewChild, EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';

@Component({
  selector: 'popupMessageModal',
  templateUrl: './popup-message.component.html'
})
export class PopupMessageModalComponent extends AppComponentBase  {
    @ViewChild('popupMessageModal', {static: true}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    poptitle = '';
    popmessage = '';
    selected: any[] = [];
    data: any = {};
    datas: any[] = [];

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
        ) {
        super(injector);
    }

    show(title: string, message?: string): void {
        this.active = true;
        this.modal.show();
        this.poptitle = title;
        this.popmessage = message;
        console.log(title);
        console.log(message);
        // this.suppUrl = ProxyURL.GetCompanybyType + 'companytype=3&';
        // this.selected = [];
    }

    onShown(): void {
        // this.suppUrl = ProxyURL.GetCompanybyType + 'companytype=3&';
        this.selected = [];
    }

    accept(): void {
        console.log('accepted');
        this.close();
        this.modalSave.emit(1);
    }

    decline(): void {
        console.log('declined');
        this.close();
        this.modalSave.emit(2);
    }

    save(): void {
        // if (this.selected !== null && this.selected.length > 0) {
        //     this.saving = true;
        //     let url = ProxyURL.InsertParticipant;
        //     // let data = this.participantgrid.checked;
        //     this.add();
        //     let data = this.datas;
        //     if (data !== null && data !== undefined && Array.isArray(data) && data.length) {
        //         this._proxy.request(url, RequestType.Post, data)
        //         .subscribe(result => {
        //             if (result.isSuccess) {
        //                 this.notify.info(this.l('SavedSuccessfully'));
        //                 this.close();
        //                 this.modalSave.emit(data);
        //             } else {
        //                 this.notify.error(this.l('Failed'));
        //                 this.saving = false;
        //             }
        //         });
        //     } else {
        //         this.notify.warn(this.l('PleaseSelectData'));
        //         this.saving = false;
        //     }
        // } else {
        //     this.notify.warn(this.l('PleaseSelectData'));
        // }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
