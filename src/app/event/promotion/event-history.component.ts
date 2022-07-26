import { Component, OnInit, AfterViewInit, ViewEncapsulation, ElementRef, ViewChild, Injector, EventEmitter, Attribute, ɵConsole } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { SaveType } from '@shared/AppEnums';
import * as moment from 'moment';
import { stringToDate, toISOFormat } from '@shared/helpers/DateTimeHelper';

import { Observable, combineLatest as _observableCombineLatest } from 'rxjs';
import { DatePipe } from '@angular/common';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { finalize } from 'rxjs/operators';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { DomSanitizer } from '@angular/platform-browser';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { selectMode, GalleryComponent } from '@app/shared/form/gallery/gallery.component';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';


@Component({
    templateUrl: './event-history.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [DatePipe]
})

export class EventHistoryComponent extends AppComponentBase implements OnInit, AfterViewInit {
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('itemList', { static: false }) itemList: BaseListComponent;

    public sanitizer: DomSanitizer;
    galleryUrl: string;
    SaveType = SaveType;
    saveType: number;
    saving = false;
    subscribed = 0;
    approved = 0;
    errorDateRange = true;
    dateRangeMsg = '';
    dateFrom: Date;
    dateTo: Date;
    startDate: Date;
    eventMinDate: Date;
    paymentMinDate: Date;
    campType: any;
    isBusy = false;
    selectMode = selectMode.multiple;
    expired: boolean;
    dataGalery: any = {};
    inputHelper: any = {};
    data: any = {};
    dataType: any;
    campno: any;
    DeleteBanner: boolean;
    SubscibeBanner = false;
    GalleryChoosed: any;
    chooseGallery: any = [];
    lenghtBannerDetail: any;

    // #region EventHDRDto model
    eventNo: string;
    eventTitle: string;
    eventStart: Date;
    eventEnd: Date;
    eventType: number;
    eventStatus: number;
    eventPaymentDate: Date;
    eventTarget: string;
    datatest: any;
    mode: string;

    dataEventType: any[] = [];
    dataEventStatus: any[] = [];
    data_history: any;
    //#endregion

    //#region EventDTL
    dataAffiliatePartner: any[] = [];
    filterAffiliatePartner: string;
    //#endregion

    // #region EventITEM
    itemGridUrl: string;
    itemPermissionView = 'Pages.Event.Channel.Edit, Pages.Event.Channel.Subscribe';
    itemPermissionEdit = 'Pages.Event.Channel.Edit';
    itemPermissionDelete = 'Pages.Event.Channel.Edit.Delete';
    ApprovalStatus = -1;
    eventRecruiterID: any;
    //#endregion

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _route: Router,
        private datePipe: DatePipe,
        private __proxy: GenericServiceProxy,
        private _storage: AppStorage
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._activatedRoute.params.subscribe(params =>
            this.data_history = params.id
        )
        //console.log('data : ' + JSON.stringify(this.data_history));
        //console.log('data : ' + this.data_history)

        this.refresh();

        this.itemGridRefresh();
        
        this.BannerDetailUpOn();

    }

    BannerDetailUpOn() : void{
        this.galleryUrl = ProxyURL.GetCompanyDocument + 'campno=' + this.data_history + '&' + 'mode=1&';
        this.__proxy.request(this.galleryUrl, RequestType.Get)
        .subscribe(result => {
            //console.log('result : ' + JSON.stringify(result));
            this.lenghtBannerDetail = result.totalCount;
            let dataDoccode = result.items;
            dataDoccode.forEach(row => {
                //let data : any = {};
                let doccode : any;
                doccode = row.DocCode;
                this.chooseGallery.push(doccode);

            });
            this.GalleryChoosed = this.chooseGallery.join('|');
            //console.log('result : ' + JSON.stringify(this.lenghtBannerDetail));
        });
    }

    UpOnGoing(): void{
        //console.log("date banner : " + this.eventStart)
        let date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDay();
        this.startDate = new Date(y, m, d + 3);
        
        if(this.startDate < this.eventStart){
            this.DeleteBanner = true;
        }
        else {
            this.DeleteBanner = false;
        }
        this.SubscibeBanner = true;
    }

    back(): void {
        this._route.navigate(['/app/event']);
    }

    refresh() {
            let hdrurl = ProxyURL.GetCampaignList + 'EventNo=' + this.data_history + '&';
            this.__proxy.request(hdrurl, RequestType.Get)
            .subscribe(result => {
                if (result.items[0]) {
                    // if Exist Event no will proceed to binding data to form
                    let hdr = result.items[0];
                    //console.log('hasil : ' + JSON.stringify(hdr));
                    this.eventNo = hdr['EventID'];
                    this.eventTitle = hdr['Title'];
                    this.eventStart = new Date(hdr['EffectiveDate']);
                    this.eventEnd = new Date(hdr['ExpiryDate']);
                    this.eventType = hdr['CampType'];
                    this.eventStatus = hdr['Status'];
                    this.eventPaymentDate = new Date(hdr['TransDate']);
                    this.eventTarget = hdr['TotalQty'];
                    //console.log("date banner1 : " + this.eventStart);
                    if (hdr['ReqNo'] == null || hdr['ReqNo'] == undefined) {
                        this.eventRecruiterID;
                    } else {
                        this.eventRecruiterID = hdr['ReqNo'];
                    }
                }
            })
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.populateSelect();
        }, 100);
    }

    private populateSelect(): void {
        let url = ProxyURL.GetCodeMasterCombo + 'code=CPT|CAS';
        this.__proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
            this.isBusy = false;
        }))
        .subscribe(result => {
            let codeTypeList = result.map(x => x.CodeType).filter((row, idx, arr) =>
                arr.indexOf(row) === idx
            );
            codeTypeList.forEach(ct => {
                let items = result.filter(x => x.CodeType === ct);
                switch (ct) {
                    case 'CPT':
                        this.dataEventType = items.sort((a, b) => {
                            if (a.CodeDesc < b.CodeDesc) {
                                return -1;
                            } else if (a.CodeDesc > b.CodeDesc) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        break;
                    case 'CAS':
                        this.dataEventStatus = items.sort((a, b) => {
                            if (a.CodeDesc < b.CodeDesc) {
                                return -1;
                            } else if (a.CodeDesc > b.CodeDesc) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        break;
                }
            });
            this.dataEventType = this.dataEventType.filter(function(el){ return el['CodeDesc'] != 'Event'; });
            this.eventType = 2;
        });
    }

    countItem(){
        this.approved = 0;
        this.subscribed = 0;
        let counts = [];
        this.__proxy.request(this.itemGridUrl + 'Flag=1', RequestType.Get)                    
            .subscribe(result => {            
                for (let i of result.items) {                
                    i.Status === 2? this.approved++ : true ;
                }
                for (let i of result.items) {
                    counts.push(i.BizRegID);
                }
                let distinct = (value, index, self) => {
                    return self.indexOf(value) === index;
                }
                let distinctCounts = counts.filter(distinct);
                this.subscribed = distinctCounts.length;
            });
    }

    itemGridRefresh(): void {
        this.itemGridUrl = ProxyURL.GetCampaignItemList + 'EventNo=' + this.data_history + '&';
        setTimeout(() => {
            this.itemList.refresh();
        }, 100);
        this.countItem();
    }
}
