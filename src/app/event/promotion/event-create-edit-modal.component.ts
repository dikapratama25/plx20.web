import { Component, OnInit, AfterViewInit, Injector, ElementRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { animation } from '@angular/animations';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { selectMode, GalleryComponent } from '@app/shared/form/gallery/gallery.component';
import { finalize } from 'rxjs/operators';
import { SaveType } from '@shared/AppEnums';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'eventCreateEditModal',
    templateUrl: './event-create-edit-modal.component.html',
    animations: [appModuleAnimation()]
})

export class EventCreateEditModalComponent extends AppComponentBase implements OnInit, AfterViewInit {
    
    @ViewChild('eventCreateEditModal', {static: true}) modal: ModalDirective;
    @ViewChild('gallery', { static: false }) gallery: GalleryComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    
    active = false;
    saving = false;
    isBusy = false;

    item: any = {};
    saveType: number;
    dataGalery: any = {};
    input: any = {};
    galleryUrl: string;
    SaveType = SaveType;
    option: any = 1;
    //selectMode: any;
    selectMode = selectMode.multiple;
    //viewscript: any;
    datahdr: any = {};
    tempHdr: any;
    datas: any = {};
    dataFeedback: any = [];
    dataPush: any = [];
    lengthData: any;
    
    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _route: Router,
        private _activatedRoute: ActivatedRoute
      ) {
        super(injector);
        if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'create').length > 0) {
            this.saveType = SaveType.Insert;
        } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'edit').length > 0 || this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'subscribe').length > 0) {
            this.saveType = SaveType.Update;
        }
      }

    ngOnInit(): void {
        // + 'doccode=ZWIO78JK90OPKLIO7890' + '&';
        //console.log(this.galleryUrl);
        
        //this.galleryUrl = ProxyURL.GetCompanyDocument;
    }

    ngAfterViewInit(): void {
        // let url = ProxyURL.GetCompanyDocument;
        // this.gallery.refresh(url);
        //throw new Error("Method not implemented.");
    }

    show(data: any): void {
        
        //console.log('Data save :' + this.saveType);
        this.tempHdr = data;
        if(this.option == 1) {
            let url = ''
            if(this.saveType === SaveType.Insert){
                url = ProxyURL.GetCompanyDocument;
            }
            else{
                url = ProxyURL.GetCompanyDocument;
                url += 'docCode=' + data.doccode + '&' + 'show=' + 1 + '&';
            }
            this.gallery.refresh(url);
            this.option = 2
        } 
        //console.log('temp hdr : ' + JSON.stringify(this.tempHdr));
        this.active = true;
        this.modal.show();

    }

    editDataDoc(): void {
        let dataPush: any = [];
        dataPush.push(this.datas);
        //console.log('Data check : ' + JSON.stringify(dataPush));
        let url = ProxyURL.CheckUpdateDoc;
        this._proxy.request(url, RequestType.Post, dataPush)
            .subscribe(result => {
                this.dataFeedback = result;
                this.lengthData =  this.dataFeedback.length;
                //console.log("data feedback : " + JSON.stringify(lengthData));
                //this.softDelete();
                this.editDataHdrDoc();
            });
    }

    softDelete(): void {
        let urlDelete = ProxyURL.DeleteCampaignDoc;
        this._proxy.request(urlDelete, RequestType.Post, this.dataFeedback)
            .subscribe(result => {
                this.editDataHdrDoc();
            }); 
    }

    editDataHdrDoc(): void {
        this.isBusy = true;
        let url = '';

        if (this.saveType === SaveType.Insert) {
            url = ProxyURL.AddCampaignHDR;
        } else {
            url = ProxyURL.UpdateCampaignHDR;
            url += 'countSegNo=' + this.lengthData + '&';
        }

        this._proxy.request(url, RequestType.Post, this.dataPush)
            .pipe(finalize(() => {
                this.isBusy = false;
                this._route.navigate(['/app/event']);
            }))
            .subscribe(result => {
                this.notify.success(this.l('SuccessfullySaved'));
            });
    }

    //new method save event + banner in modal
    save(): void {
        //console.log('save type : ' + this.saveType)
        //console.log('Data save : ' + this.tempHdr);
        //console.log('bizregid : ' + this.tempHdr.bizregid);
        
        this.dataGalery.forEach(row => {
            this.datas = {};
            let dataEvent: any = { "hdr": this.tempHdr, "doc": this.datas };
            // this.datahdr.bizregid = this.tempHdr.bizregid;
            //console.log('Data BizRegID : ' + this.datahdr.bizregid);
            // this.datahdr.bizlocid = this.tempHdr.bizlocid;
            // this.datahdr.transno = this.tempHdr.transno
            // this.datahdr.campno = this.tempHdr.campno;
            // this.datahdr.camptype = this.tempHdr.camptype;
            // this.datahdr.transdate = this.tempHdr.transdate;
            // this.datahdr.description = this.tempHdr.description;
            // this.datahdr.effectivedate = this.tempHdr.effectivedate;
            // this.datahdr.expirydate = this.tempHdr.expirydate;
            // this.datahdr.totalqty = this.tempHdr.totalqty;
            // this.datahdr.status = this.tempHdr.status;
            // this.datahdr.createby = this.tempHdr.createby;
            this.datas.bizregid = this.tempHdr.bizregid;
            this.datas.bizlocid = this.tempHdr.bizlocid;
            this.datas.campno = this.tempHdr.campno;
            this.datas.status = this.tempHdr.status;
            this.datas.DocNo = 0;
            this.datas.DocCode = row.DocCode;
            this.datas.SeqNo = 0;
            this.datas.LineCode  = 0;  
            
            //console.log('data : ' + JSON.stringify(this.datas));
            this.dataPush.push(dataEvent);
        });
        //console.log("data save : " + JSON.stringify(this.dataPush));
        
        this.message.confirm(
            this.l('DataSaveConfirmationMessage'),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this.editDataDoc();
                    //this.editDataHdrDoc();
                }
            }
        );
    }

    close(): void {
        this.active = false;
        //this.resetForm.reset();
        this.modal.hide();
        //this.gallery.gridContainer = <any>$('');
    }

    selectWebsite(event: any): void {  
        let data = event;
        this.dataGalery = event;
        //console.log('data : ' + JSON.stringify(this.dataGalery));
    }

}
