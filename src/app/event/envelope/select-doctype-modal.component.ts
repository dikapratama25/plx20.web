import { FileUpload } from 'primeng/fileupload';
//import { CreateOrEditBranchModalComponent } from './create-or-edit-branch-modal.component';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
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
    selector: 'selectDoctypeModal',
    templateUrl: './select-doctype-modal.component.html',
    animations: [appModuleAnimation()]
})

export class SelectDoctypeModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('selectDoctypeModal', { static: false }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    isBusy = false;
    isOpen = false;
    gridUrl = ProxyURL.GetCompanyLocation;
    selectData: any[] = [];
    fileRaw: any;
    file: any;
    sectionCombo: any;
    inputHelper: any = {};
    campaignNo: string;
    selectedGallery: any = {};
    campID = '';
    bizregid : string;
    bizlocid : string;

    
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

    show(data?: any, campid?: any): void {
        this.fileRaw = data;
        this.campID = campid;
        this.file = data[0];
        this.isOpen = true;
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
        let url = ProxyURL.GetEnvelopeRequiredDocs + 'campID=' + this.campID+'&bizregid='+this.bizregid+'&bizlocid='+this.bizlocid+'&';
        this.spinnerService.show();
        let data: any = [];
        if (url != null) {
            this.__proxy.request(url, RequestType.Get)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe(result => {

                    if (result.length > 0) {
                        this.sectionCombo = result.filter(x => x.DocNo === null);
                        this.inputHelper.selectSeq = this.sectionCombo[0].id;

                    }
                });
        }
    }
}
