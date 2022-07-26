import { Component, EventEmitter, Injector, Output, ViewChild, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveType } from '@shared/AppEnums';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize, tap, switchMap, concatMap } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GalleryComponent } from '@app/shared/form/gallery/gallery.component';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ProgressSpinnerModule } from 'primeng/primeng';

@Component({
    selector: 'createOrEditEventGalleryModal',
    templateUrl: './create-or-edit-event-gallery.component.html'
})
export class CreateOrEditEventGalleryModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createModal', {static: true}) modal: ModalDirective;
    @ViewChild('gallery', { static: false }) gallery: GalleryComponent;
    @ViewChild('baseList', { static: false }) baseList: BaseListComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    
    saveState: number;
    saveType: number;

    dataEditUrl = ProxyURL.UpdateDocument_A;

    modalTitle = '';
    DocPath = '';
    Loading = true;

    inputHelper: any = {};
    dimensionUrl = ProxyURL.GetListCodemaster + "MaxResultCount=1000&SkipCount=0&code=BND&";
    dimensionlist: any = [];
    companylist: any = [];

    galleryList: any[] = [];
    galleryUrl = ProxyURL.GetCompanyDocument;
    galleryFilter: any[] = [];

    constructor(
        injector: Injector,
        private _route: Router,
        private __proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.Loading = true;
        this.inputHelper.Description = '';
        this.inputHelper.Code = '';
    }

    onShown(): void {
        document.getElementById('gallery').focus();
    }

    show(data?: any): void {
        this.modal.show();
        this.__proxy.request(this.dimensionUrl, RequestType.Get)
                .pipe(finalize(() => {
                }))
                .subscribe(result => {
                    this.dimensionlist = result.items;
                });
        this.galleryList.push(data.PathRef);
        this.modalTitle = 'EditGallery';
        this.saveState = SaveType.Update;
        this.active = true;
        this.inputHelper.Description = data.Description;
        this.inputHelper.Code = data.DocMode;
        this.inputHelper.BizRegID = data.BizRegID;
        this.inputHelper.DocCode = data.DocCode;
        this.inputHelper.DocType = data.DocType;
        this.inputHelper.width = data.CodeVal1;
        this.inputHelper.height = data.CodeVal2;
        this.inputHelper.size = data.CodeVal3;
        this.inputHelper.type = data.CodeRef;
        this.inputHelper.DocCode = data.DocCode;
        this.inputHelper.DocNo = data.DocNo;
        this.DocPath = data.DocPath;
        // if((this.DocPath = data.DocPath) == null) {
        //     this.imageLoader == true;
        // } else {
        //     this.imageLoader == false;
        //     this.DocPath = data.DocPath;    
        // }
    }

    save(): void {
        let data: any = [];
        this.inputHelper.DocMode = this.inputHelper.Code;
        data.push(this.inputHelper);
        //console.log('dataSave: ' + JSON.stringify(data));
        let url = '';
        let notif = '';

        if (this.saveState === SaveType.Update) {
            url = this.dataEditUrl;
            notif = 'UpdateSuccessfully';
        } 

      if (url !== undefined) {
          this.__proxy.request(url, RequestType.Post, data)
          .subscribe(() => {
              this.notify.success(this.l(notif));
              this.modalSave.emit();
              this.close();
          });
      }
    }

    refresh(): void {
        this.baseList.gridUrl = this.galleryUrl;
        
    }

    filterdimension(): void {
        this.inputHelper.type = this.dimensionlist.filter(x => x.Code === this.inputHelper.Code).map(y => y.Type);
        this.inputHelper.size = this.dimensionlist.filter(x => x.Code === this.inputHelper.Code).map(y => y.Maxsize);
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    back(): void {
      this._route.navigate(['/app/event/gallery']);
  }
}
