import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Component, OnInit, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';

@Component({
    selector: 'selectSupportdocModal',
    templateUrl: './select-supportdoc.component.html',
    animations: [appModuleAnimation()]
})

export class SelectSupportdocModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('selectDoctypeModal', { static: false }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    isBusy = false;
    isOpen = false;
    gridUrl = '';//ProxyURL.GetCompanyLocation;
    selectData: any[] = [];
    fileRaw: any;
    file: any;
    sectionCombo: any;
    inputHelper: any = {};
    campaignNo: string;
    selectedGallery: any = {};
    campID = '';
    bizregid: string;
    bizlocid: string;

    
    constructor(
        injector: Injector,
        private __proxy: GenericServiceProxy,
        private _storage: AppStorage
    ) {
        super(injector);
        this.bizregid = _storage.bizRegID;
        this.bizlocid = _storage.bizLocID;
    }

    ngOnInit(): void {

    }

    show(data?: any, bizRegID?: string, bizLocID?: string): void {
        this.fileRaw = data;
        this.file = data[0];
        this.isOpen = true;
        if (this.bizregid === undefined && bizRegID !== undefined) {
            this.bizregid = bizRegID
        }
        if (this.bizlocid === undefined && bizLocID !== undefined) {
            this.bizlocid = bizLocID
        }
        this.populateDocrequired();
        this.modal.show();
    }


    close(): void {
        this.isOpen = false;
        this.modal.hide();
    }

    upload() {
        let dataRaw: any = {};

        let data = this.sectionCombo.filter(x => x.id === this.inputHelper.selectSeq)[0];
        dataRaw.fileRaw = this.fileRaw;
        dataRaw.data = data;
        dataRaw.counter = this.inputHelper;

        this.modalSave.emit(dataRaw);

        this.close();
    }

    populateDocrequired() {
        // let url = ProxyURL.GetBizDocuments + '&bizreg='+this.appStorage.bizRegID+'&bizloc='+this.appStorage.bizLocID+'&isList=0';
        let url = ProxyURL.GetDocumentsBusiness + '&bizreg='+this.bizregid+'&bizloc='+this.bizlocid+'&isList=0';
        this.spinnerService.show();
        let data: any = [];
        if (url != null) {
            this.__proxy.request(url, RequestType.Get)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe(result => {
                    
                    if (result.length > 0) {
                      this.sectionCombo = result;
                      this.inputHelper.selectSeq = this.sectionCombo[0].id;
                    }
                });
        }
    }
}
