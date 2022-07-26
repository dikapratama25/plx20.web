import { AppConsts } from '@shared/AppConsts';
import { Component, OnInit, AfterViewInit, ViewEncapsulation, ElementRef, ViewChild, Injector, EventEmitter, Attribute, ɵConsole, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { SaveType, TenderCont, PaxRegPaxLog } from '@shared/AppEnums';
import * as moment from 'moment';
import { stringToDate, toISOFormat } from '@shared/helpers/DateTimeHelper';

import { Observable, combineLatest as _observableCombineLatest } from 'rxjs';
import { DatePipe, Location } from '@angular/common';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { finalize } from 'rxjs/operators';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';

import { TableModule } from 'primeng/table';
import { EventItemModalComponent } from './event-item-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { EventEditModalComponent } from './event-edit.component';
import { selectMode, GalleryComponent } from '@app/shared/form/gallery/gallery.component';
import { SelectBranchModalComponent } from './select-branch-modal.component';
import { EventCreateEditModalComponent } from './event-create-edit-modal.component';
import { CountdownComponent } from 'ngx-countdown';
import { BoundElementPropertyAst } from '@angular/compiler';
import { ParticipantGridComponent } from '@app/event/participant/participant-grid.component';
import { CommitteeGridComponent } from '@app/event/committee/committee-grid.component';

@Component({
    templateUrl: './event-create-edit.component.html',
    styleUrls: ['./event-create-edit.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [DatePipe]
})

export class EventCreateEditComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;
    @ViewChild('itemList', { static: false }) itemList: BaseListComponent;
    @ViewChild('galleryPreview', { static: false }) galleryPreview: BaseListComponent;
    // @ViewChild('eventItemModal', { static: false }) eventItemModal: EventItemModalComponent;
    // @ViewChild('eventEditModal', { static: false }) eventEditModal: EventEditModalComponent;
    @ViewChild('selectBranchModal', { static: false }) selectBranchModal: SelectBranchModalComponent;
    // @ViewChild('eventCreateEditModal', { static: true }) eventCreateEditModal: EventCreateEditModalComponent;
    @ViewChild('gallery', { static: false }) gallery: GalleryComponent;
    @ViewChild('onGoingList', { static: false }) onGoingList: BaseListComponent;
    @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
    @ViewChild('participantgrid', { static: false }) participantgrid: ParticipantGridComponent;
    @ViewChild('commercialgrid', { static: false }) commercialgrid: CommitteeGridComponent;
    @ViewChild('technicalgrid', { static: false }) technicalgrid: CommitteeGridComponent;
    @ViewChild('requestergrid', { static: false }) requestergrid: CommitteeGridComponent;
    @Input() campID = '';

    technicalRole = 'HSE';//CommiteRoleType.HSE;
    commercialRole = 'Buyers';//CommiteRoleType.Buyer;
    requesterRole = 'Requester';//CommiteRoleType.Buyer;
    isWithHSE = false;
    withCheckBox = 'none';
    selectedCategoryOnGoing: any;
    SelectedEvent: any;
    categoryCombo: any = [];
    filterTextOnGoing = '';
    OnGoingCategory = '';
    onGoingGridUrl: string;
    gridUrl = ProxyURL.GetSupplierList;
    gredUrlItems = ProxyURL.GetItemsList;

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
    eventName: string;
    eventTitle: string;
    eventStart: Date;
    eventEnd: Date;
    eventType: number;
    eventStatus: number;
    eventPaymentDate: Date;
    eventTarget: string;
    datatest: any;
    mode: string;
    gridItemUrl: any;
    dateBid: string;
    uomList: any;
    currency: string;
    bidStart: string;
    bidEnd: string;
    checkRoute: string;
    isHost: any;
    owner: string;

    isSubscribed = false;
    isBidding = false;
    isEventOwner = false;
    isEassesment = false;

    dataEventType: any[] = [];
    dataEventStatus: any[] = [];
    //#endregion
    selectedTableValues: any = [];
    //#region EventDTL
    dataAffiliatePartner: any[] = [];
    filterAffiliatePartner: string;
    //#endregion
    //#region EAssesment
    eassesmentStart: string;
    eassesmentEnd: string;
    eassesmentMode: string;
    quizID: string;
    withHSE: string;
    transStart: string;
    transEnd: string;
    transPercentage: string;
    poEval = false;
    //#endregion

    deletedItem: any = [];

    // #region EventITEM
    itemGridUrl: string;
    itemPermissionView = 'Pages.Event.Channel.Edit, Pages.Event.Channel.Subscribe';
    itemPermissionEdit = 'Pages.Event.Channel.Edit';
    itemPermissionDelete = 'Pages.Event.Channel.Edit.Delete';
    ApprovalStatus = -1;
    eventRecruiterID: any;
    currState: boolean;
    cars: any[];
    //#endregion

    constructor(
        injector: Injector,
        private location: Location,
        private _activatedRoute: ActivatedRoute,
        private _route: Router,
        private datePipe: DatePipe,
        private __proxy: GenericServiceProxy,
        private _storage: AppStorage,
        private _tenderCont: TenderCont,
        private _paxRegPaxLoc: PaxRegPaxLog
    ) {
        super(injector);

        if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'create').length > 0) {
            this.saveType = SaveType.Insert;
        } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'edit').length > 0 || this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'subscribe').length > 0) {
            this.saveType = SaveType.Update;
            this._activatedRoute.params.subscribe(params => {
                let campID = this._tenderCont.Items['CampID'];
                const code = campID;
                this.eventNo = code;
            });
        }

        if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'event').length > 0) {
            this.eventType = 2;
        }
    }

    ngOnInit(): void {
        this.checkCont();
        this.checkSubsribedTender();


        //Checking EventType
        if (this._tenderCont.Items['CampType'].includes('EBD')) {
            this.isBidding = true;
        }

        if (this._tenderCont.Items['CampType'].includes('EVE')) {
            this.isEassesment = true;
        }

        this.isHost = this._tenderCont.Items['IsHost'];
        //this.onGoingGridUrl = this.gridUrl;

        //this.BannerDetailUpOn();
        //console.log('url : ' + this.galleryUrl);
        //this.galleryUrl = ProxyURL.GetCompanyDocument;
        //this.selectMode = selectMode.multiple;
        //setTimeout(() => {
        this.expired = false;
        //console.log('mode : ' + this.mode);
        //this.gridItemUrl = ProxyURL.GetItemBidList;
        //}, 100);
        // console.log(this.sanitizer.bypassSecurityTrustResourceUrl(this.bannerDoc + 'Artboard 3.png'));
        // console.log(this.bannerDoc);
        this.eventStatus = this._tenderCont.Items['EventStatus'];
        this.eventRecruiterID = 'Will Be Assign Later';
        this.isBusy = true;
        this.errorDateRange = true;
        this.eventMinDate = new Date();
        this.paymentMinDate = new Date();
        this.campID = this._tenderCont.Items['CampID'];
        // if (this.appSession.user.userName === 'manager'){
        //     this.ApprovalStatus = 1;
        // }else{
        //     this.ApprovalStatus = -1;
        // }

        if (this.saveType === SaveType.Insert) {
            this.eventNo = this.l('AutoGenerated');
            this.eventTitle = '';
            this.eventStart = null;
            this.eventEnd = null;
            this.eventStatus = 1;
            this.eventPaymentDate = null;
            this.eventTarget = '';
        } else {
            if (this.eventNo && !this.isEassesment) {
                //this.itemGridUrl = ProxyURL.GetCampaignItemList + 'EventNo=' + this.eventNo + '&';
                this.populateTender();
            } else if (this.eventNo && this.isEassesment) {
                this.populateEassesment();
                this.populateParticipant();
                this.populateCommittee();
            } else {
                // if url address show edit, but without passing event No will redirect to Event Listing
                this.back();
            }
        }


        //this.populateTable();
        //#region Event Summary
        if (!this.isEassesment) {
            this.populateEvent();
        }
        //#endregion
    }

    //#region Event Information

    goBack() {
        this.location.back();
        AppConsts.isAdmin = 'false';
    }

    delete(data): void {
        let test = {};
        let delRow = this.selectedTableValues.indexOf(data);
        this.selectedTableValues.splice(delRow, 1);
        this.deletedItem.push(data);
        this.recalculateNumbering();
    }

    recalculateNumbering(): void {
        if (this.selectedTableValues.length > 0) {
            for (let i = 0; i < this.selectedTableValues.length; i++) {
                this.selectedTableValues[i].SeqNo = (i + 1);
            }
        }
    }

    checkCont() {
        if (this._tenderCont.Items['CampID'] === undefined) {
            this.goBack();
        }
    }

    checkSubsribedTender() {
        AppConsts.isAdmin = 'true';
    }

    populateEassesment() {
        this.SelectedEvent = this._tenderCont.Items;
        console.log(JSON.stringify(this._tenderCont.Items));
        this.eventName = this._tenderCont.Items['Name'];
        this.eventTitle = this._tenderCont.Items['Title'];
        this.owner = this._tenderCont.Items['Owner'];
        this.quizID = this._tenderCont.Items['QuizID'];
        this.withHSE = this._tenderCont.Items['TargetSaving'] == 1 ? "True" : "False";
        this.isWithHSE = this._tenderCont.Items['TargetSaving'] == 1 ? true : false;
        this.eassesmentStart = moment(this._tenderCont.Items['PlannedStartTime']).format('DD/MM/YYYY HH:mm');
        this.eassesmentEnd = moment(this._tenderCont.Items['PlannedEndTime']).format('DD/MM/YYYY HH:mm');
        this.eassesmentMode = this._tenderCont.Items['EventMode'];
        this.campType = this._tenderCont.Items['CampType'];
        this.currency = this._tenderCont.Items['Currency'];
        this.poEval = this._tenderCont.Items['CampDisc'] == 0.00 ? false : true;
        this.transPercentage = this._tenderCont.Items['CampDisc'];
        this.transStart = moment(this._tenderCont.Items['PlannedBidStartTime']).format('DD/MM/YYYY HH:mm');
        this.transEnd = moment(this._tenderCont.Items['PlannedBidEndTime']).format('DD/MM/YYYY HH:mm');
    }

    populateTender() {
        this.SelectedEvent = this._tenderCont.Items;
        // console.log('Tender: ' + JSON.stringify(this._tenderCont.Items));
        this.eventName = this._tenderCont.Items['Name'];
        this.eventTitle = this._tenderCont.Items['Title'];
        this.bidStart = moment(this._tenderCont.Items['BidStartTime']).format('DD/MM/YYYY HH:mm');
        this.bidEnd = moment(this._tenderCont.Items['BidEndTime']).format('DD/MM/YYYY HH:mm');
        this.campType = this._tenderCont.Items['CampType'];
        this.currency = this._tenderCont.Items['Currency'];
    }

    subscribeTender() {
        this._route.navigate(['/app/transaction/invoice/' + this._tenderCont.Items['CampID']]);
    }

    navigate(data: string) {
        AppConsts.parentId = this._tenderCont.Items['CampID'];
        this._route.navigate([data]);
    }

    populateTable() {
        let url = ProxyURL.GetItemBidList;
        this.__proxy.request(url, RequestType.Get)
            .subscribe(result => {
                let data = result;

                if (data != undefined) {
                    let dummyDate = moment().format('YYYY-MM-DD');
                    for (let i = 0; i < data.length; i++) {
                        let dataInject: any = {};
                        //console.log(data[i]);
                        dataInject.LotNo = data[i].LotNo;
                        dataInject.ItemNo = data[i].ItemNo;
                        dataInject.Description = data[i].Description;
                        dataInject.LotName = data[i].LotName;
                        dataInject.Price = data[i].Price;
                        dataInject.PackQty = data[i].PackQty;
                        dataInject.MarkUp = data[i].MarkUp;
                        dataInject.Uom = data[i].Uom;

                        dataInject.SubSellPrice = dataInject.PackQty * dataInject.Price;

                        //  this.selectedTableValues.push(JSON.parse(JSON.stringify(this.inputHelper)));
                        this.dataTable.value.push(JSON.parse(JSON.stringify(dataInject)));
                        this.dataTable.initRowEdit(JSON.parse(JSON.stringify(dataInject)));

                    }
                }
            });

        let codemasterUrl = ProxyURL.GetCodeMasterCombo;

        this.__proxy.request(codemasterUrl + 'code=UOM&', RequestType.Get)
            .pipe(finalize(() => {
            }))
            .subscribe(result => {

                for (let i = 0; i < result.length; i++) {
                    if ((result[i].Code == 'kg') || (result[i].Code == 'l') || ((result[i].Code == 'Pcs') || (result[i].Code == 'MT') || (result[i].Code == 'LOT'))) {

                    }
                }
                this.uomList = result;

            });

    }

    toggleEdit(): void {
        this.currState = !this.currState;
        this.cars.map(elem => {
            elem.edit = this.currState;
        });
    }

    BannerDetailUpOn(): void {
        this.galleryUrl = ProxyURL.GetCompanyDocument + 'campno=' + this.eventNo + '&' + 'mode=1&';
        this.__proxy.request(this.galleryUrl, RequestType.Get)
            .subscribe(result => {
                //console.log('result : ' + JSON.stringify(result));
                this.lenghtBannerDetail = result.totalCount;
                let dataDoccode = result.items;
                dataDoccode.forEach(row => {
                    //let data : any = {};
                    let doccode: any;
                    doccode = row.DocCode;
                    this.chooseGallery.push(doccode);

                });
                this.GalleryChoosed = this.chooseGallery.join('|');
                //console.log('result : ' + JSON.stringify(this.lenghtBannerDetail));
            });
    }

    UpOnGoing(): void {
        //console.log("date banner : " + this.eventStart)
        let date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDay();
        this.startDate = new Date(y, m, d + 10);
        //console.log("date now : " + this.startDate)
        if (this.startDate < this.eventStart) {
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

    // assignBanner(): void {
    //     this.data.bizregid = this._storage.bizRegID ? this._storage.bizRegID : 'x';
    //     this.data.bizlocid = this._storage.bizLocID ? this._storage.bizLocID : 'x';
    //     this.data.transno = 'x';
    //     this.data.campno = this.saveType === SaveType.Insert ? 'xxx' : this.eventNo;
    //     this.data.camptype = this.eventType ? this.eventType : 0;
    //     this.data.transdate = this.eventPaymentDate ? toISOFormat(new Date(this.eventPaymentDate.setHours(0,0,0))) : null;
    //     this.data.description = this.eventTitle ? this.eventTitle : '';
    //     this.data.effectivedate = this.eventStart ? toISOFormat(new Date(this.eventStart.setHours(0,0,0))) : null;
    //     this.data.expirydate = this.eventEnd ? toISOFormat(new Date(this.eventEnd.setHours(23,59,59))) : null;
    //     this.data.totalqty = this.eventTarget ? +this.eventTarget : 0;
    //     this.data.status = this.eventStatus ? this.eventStatus : 0;
    //     this.data.createby = this.appSession.user.userName;
    //     // let params = {
    //     //     datatest.bizregid
    //     //     //selectedMode: selectMode.multiple
    //     //     //this.data.bizregid: this._storage.bizRegID? this._storage.bizRegID : 'x',

    //     // }

    //     console.log("data save 1 : " + JSON.stringify(this.data));
    //     //this.eventCreateEditModal.show(this.data);
    // }

    activateNext(): void {
        let triggerNext = document.querySelector('#btnSendEmail');

        triggerNext.addEventListener('click', function () {

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
                this.refresh();
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
                this.dataEventType = this.dataEventType.filter(function (el) { return el['CodeDesc'] != 'Event'; });
                this.eventType = 2;
            });
    }

    countItem() {
        this.approved = 0;
        this.subscribed = 0;
        let counts = [];
        this.__proxy.request(this.itemGridUrl + 'Flag=1', RequestType.Get)
            .subscribe(result => {
                for (let i of result.items) {
                    i.Status === 2 ? this.approved++ : true;
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

    refresh() {
        if (this.saveType === SaveType.Update) {
            // let hdrurl = ProxyURL.GetCampaignList + 'CampaignNo=' + this.eventNo + '&';
            // this.__proxy.request(hdrurl, RequestType.Get)
            //     .pipe(finalize(() => {
            //         this.getCodeMasterCombo();
            //     }))
            //     .subscribe(result => {
            //         if (result.items[0]) {

            //             // if Exist Event no will proceed to binding data to form
            //             let hdr = result.items[0];
            //             //console.log('hasil : ' + JSON.stringify(hdr));
            //             this.eventNo = hdr['EventID'];
            //             this.eventTitle = hdr['Title'];
            //             this.dateBid = moment(hdr['EffectiveDate']).format('DD-MMM-YYYY');//new Date(hdr['EffectiveDate'],"");
            //             this.eventStart = new Date(hdr['EffectiveDate']);
            //             this.eventEnd = new Date(hdr['ExpiryDate']);
            //             this.eventType = hdr['CampType'];
            //             this.eventStatus = hdr['Status'];
            //             this.eventPaymentDate = new Date(hdr['TransDate']);
            //             this.eventTarget = hdr['TotalQty'];
            //             //console.log("date banner1 : " + this.eventStart);
            //             this.UpOnGoing();
            //             if (hdr['ReqNo'] == null || hdr['ReqNo'] == undefined) {
            //                 this.eventRecruiterID;
            //             } else {
            //                 this.eventRecruiterID = hdr['ReqNo'];
            //             }

            //             // this request to get List of subscribed affiliate for selected Event (Dropdown filter)
            //             // if (!this.isGranted('Pages.Event.Channel.Subscribe')) {
            //             //     let dtlurl = ProxyURL.GetCampaignDTLCombo + 'EventNo=' + this.eventNo + '&';
            //             //     this.__proxy.request(dtlurl, RequestType.Get)
            //             //     .pipe(finalize(() => {
            //             //         this.filterAffiliatePartner = '';
            //             //         // this.itemGridRefresh();
            //             //     }))
            //             //     .subscribe(result => {
            //             //         let dataAll: any = {};
            //             //         dataAll.BizRegID = '';
            //             //         dataAll.CompanyName = 'All';
            //             //         result.unshift(dataAll);
            //             //         this.dataAffiliatePartner = result;
            //             //     });
            //             // } else {
            //             //     this.filterAffiliatePartner = this._storage.bizRegID;
            //             //     // this.itemGridRefresh();
            //             // }

            //         } else {
            //             // if NOT EXIST event no will redirect to Event listing
            //             this.message.warn(this.l('InvalidCampNo')).then(() => {
            //                 this.back();
            //             });
            //         }
            //     });
        }
    }

    itemGridRefresh(): void {
        this.itemGridUrl = ProxyURL.GetCampaignItemList + 'EventNo=' + this.eventNo + '&';
        if (this.filterAffiliatePartner) { this.itemGridUrl += 'BizRegID=' + encodeURIComponent('' + this.filterAffiliatePartner) + '&' }
        setTimeout(() => {
            this.itemList.refresh();
        }, 100);
        this.countItem();
    }

    viewGallery(data: any, setting: any): void {
        // this.eventItemModal.show(data, setting);
    }

    deleteGallery(data: any): void {
        if (this.lenghtBannerDetail < 2) {
            this.message.warn(this.l('DataDeleteMinWarningMessage'));
        }
        else {
            this.message.confirm(
                this.l('DataDeleteWarningMessage', data.Description),
                this.l('AreYouSure'),
                isConfirmed => {
                    if (isConfirmed) {
                        let dataPush: any = [];
                        dataPush.push(data);

                        //console.log("A " + JSON.stringify(dataPush));

                        let urlDelete = ProxyURL.DeleteCampaignDoc;
                        let notif = 'SuccessfullyDeleted';

                        this.__proxy.request(urlDelete, RequestType.Post, dataPush)
                            .subscribe((result) => {
                                if (result.success) {
                                    this.notify.success(this.l(notif));
                                    this.BannerDetailUpOn();
                                    this.galleryPreview.refresh();
                                }
                                else {
                                    this.notify.error(this.l(result.message));
                                }
                            });
                    }
                }
            );
        }
    }

    editEvent(data: any): void {
        console.log('data : ' + data);
        // this.eventEditModal.show(data);
    }

    assignBanner(data: any): void {
        this.data.bizregid = this._storage.bizRegID ? this._storage.bizRegID : 'x';
        this.data.bizlocid = this._storage.bizLocID ? this._storage.bizLocID : 'x';
        this.data.transno = 'x';
        this.data.campno = this.saveType === SaveType.Insert ? 'xxx' : this.eventNo;
        this.data.camptype = this.eventType ? this.eventType : 0;
        this.data.transdate = this.eventPaymentDate ? toISOFormat(new Date(this.eventPaymentDate.setHours(0, 0, 0))) : null;
        this.data.description = this.eventTitle ? this.eventTitle : '';
        this.data.effectivedate = this.eventStart ? toISOFormat(new Date(this.eventStart.setHours(0, 0, 0))) : null;
        this.data.expirydate = this.eventEnd ? toISOFormat(new Date(this.eventEnd.setHours(23, 59, 59))) : null;
        this.data.totalqty = this.eventTarget ? +this.eventTarget : 0;
        this.data.status = this.eventStatus ? this.eventStatus : 0;
        this.data.doccode = this.GalleryChoosed;
        this.saveType === SaveType.Insert ? this.data.createby = this.appSession.user.name : this.data.updateby = this.appSession.user.userName;
        // this.eventCreateEditModal.show(this.data);
    }

    showGallery(): void {
        //console.log('save type : ' + this.saveType);
        if (this.saveType === SaveType.Insert) {
            //console.log('a');
            let params = {
                selectedMode: selectMode.none
            }
            this._route.navigate(['/app/event/gallery/'], { queryParams: params });
        } else if (this.saveType === SaveType.Update) {
            //console.log('b');
            let params = {
                selectedMode: selectMode.single
            }
            this._route.navigate(['/app/event/gallery/subscribe/' + this.eventNo], { queryParams: params });
        }
    }

    isHdrEditDisabled(): boolean {
        if (this.isGranted('Pages.Event.Channel.Create')) {
            if (this.eventStart < new Date() && this.saveType === SaveType.Update) {
                return false;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    filterApproval(value: number): void {
        let url = ProxyURL.GetCampaignItemList + 'EventNo=' + this.eventNo + '&BizRegID=' + encodeURIComponent('' + this.filterAffiliatePartner) + '&';
        if (value) {
            this.ApprovalStatus = value;
            this.itemGridUrl = ((value == -1) ? url : url + '&ApprovalStatus=' + value + '&');
            setTimeout(() => {
                this.itemList.refresh();
            }, 100);
        }

        //this.itemGridUrl = url;

        setTimeout(() => {
            this.itemList.refresh();
        }, 100);
    }

    //save old
    //save(): void {
    //    let dataPush: any = [];
    //    this.dataGalery.forEach(row => {
    //        //this.data : any = {};
    //        //this.data;
    //        let datas: any = {};
    //        let dataEvent: any = { "hdr": this.data, "doc": datas
    //        };
    //        // this.data.bizregid = this._storage.bizRegID ? this._storage.bizRegID : 'x';
    //        // this.data.bizlocid = this._storage.bizLocID ? this._storage.bizLocID : 'x';
    //        // this.data.transno = 'x';
    //        // this.data.campno = this.saveType === SaveType.Insert ? 'xxx' : this.eventNo;
    //        // this.data.camptype = this.eventType ? this.eventType : 0;
    //        // this.data.transdate = this.eventPaymentDate ? toISOFormat(new Date(this.eventPaymentDate.setHours(0,0,0))) : null;
    //        // this.data.description = this.eventTitle ? this.eventTitle : '';
    //        // this.data.effectivedate = this.eventStart ? toISOFormat(new Date(this.eventStart.setHours(0,0,0))) : null;
    //        // this.data.expirydate = this.eventEnd ? toISOFormat(new Date(this.eventEnd.setHours(23,59,59))) : null;
    //        // this.data.totalqty = this.eventTarget ? +this.eventTarget : 0;
    //        // this.data.status = this.eventStatus ? this.eventStatus : 0;
    //        // this.data.createby = this.appSession.user.userName;

    //        datas.bizregid = this._storage.bizRegID ? this._storage.bizRegID : 'x';
    //        datas.bizlocid = this._storage.bizLocID ? this._storage.bizLocID : 'x';
    //        datas.campno = this.saveType === SaveType.Insert ? 'xxx' : this.eventNo;
    //        datas.DocNo = row.DocCode;
    //        datas.SeqNo = 0;
    //        datas.LineCode  = 0;  
    //        //console.log('data : ' + JSON.stringify(datas));
    //        dataPush.push(dataEvent);
    //    });
    //    //console.log("data save : " + JSON.stringify(dataPush));

    //    this.message.confirm(
    //        this.l('DataSaveConfirmationMessage'),
    //        this.l('AreYouSure'),
    //        isConfirmed => {
    //            if (isConfirmed) {
    //                this.isBusy = true;
    //                let url = '';

    //                if (this.saveType === SaveType.Insert) {
    //                    url = ProxyURL.AddEventHDR;
    //                } else {
    //                    url = ProxyURL.UpdateEventHDR;
    //                }

    //                this.__proxy.request(url, RequestType.Post, dataPush)
    //                    .pipe(finalize(() => {
    //                        this.isBusy = false;
    //                        this.back();
    //                    }))
    //                    .subscribe(result => {
    //                        this.notify.success(this.l('SuccessfullySaved'));
    //                    });
    //            }
    //        }
    //    );
    //}

    checkDateFrom(data?: Date) {
        this.dateRangeCheck(data, this.dateTo, '"Date To" Must Be After "Date From"');
    }

    checkDateTo(data?: Date) {
        this.dateRangeCheck(this.dateFrom, data, '"Date To" Must Be After "Date From"');
    }

    dateRangeCheck(from: Date, to: Date, msg: string) {
        this.eventMinDate = this.eventStart;
        let date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDay();
        this.startDate = new Date(y, m, d + 11);
        if (this.eventEnd != null) {
            if (this.eventEnd < this.eventStart) {
                this.eventEnd = null;
                this.eventEnd = null;
            }
            else {
                this.paymentMinDate = this.eventEnd;
            }
            if (new Date(this.eventPaymentDate).toDateString < new Date(this.eventEnd).toDateString) {
                this.eventPaymentDate = null;
            }
        }
        if (from == undefined) {
            this.dateRangeMsg = '"Date From" must be filled';
            this.errorDateRange = true;
        } else if (to == undefined) {
            this.dateRangeMsg = '"Date To" must be filled';
            this.errorDateRange = true;
        } else if (to < from) {
            this.dateRangeMsg = msg;
            this.errorDateRange = true;
        } else if (to < this.startDate && this.saveType !== SaveType.Update) {
            this.dateRangeMsg = '"Date To" must be current date + 1';
            this.errorDateRange = true;
        } else {
            this.dateRangeMsg = '';
            this.errorDateRange = false;
        }
        //this.message.info(this.datePipe.transform(this.dateFrom, 'yyyy/MM/dd') + ' - ' + this.datePipe.transform(this.dateTo, 'yyyy/MM/dd'));
    }

    selectWebsite(event: any): void {
        let data = event;
        this.dataGalery = event;

        //console.log('Expired:' + this.isGranted('Pages.Event.Channel.Subscribe').toString());
        //console.log('Expired:' + this.expired.toString());
        // console.log('data kami gaes:' + JSON.stringify(this.inputHelper.DocCode));
        // if (this.isGranted('Pages.Event.Channel.Subscribe') && this.expired === false) {
        //     this.selectBranchModal.show(this.eventNo, event);
        // }
    }

    getCodeMasterCombo() {
        this.__proxy.request(ProxyURL.GetCodeMasterCombo + 'code=CPT', RequestType.Get)
            .pipe().subscribe(result => {

                this.categoryCombo = result;
                this.categoryCombo.unshift({ "CodeType": "CPT", "Code": "0", "CodeDesc": "All", "CodeRemark": "", "CodeRef": "", "CodeVal1": "", "CodeVal2": "", "CodeVal3": "" });
                this.selectedCategoryOnGoing = 'All';
            });
    }

    edit(data: any): void {
        this._route.navigate(['/app/event/subscribe/' + data['EventID']]);
    }

    // delete(data: any): void {
    //     //console.log(data);
    //     let obj: any = [];
    //     data.Status = 0;
    //     data.CampNo = data.EventID;
    //     data.TransNo = 'x';
    //     obj.push(data);
    //     //console.log(obj);
    //     this.message.confirm(
    //         this.l('DataDeleteWarningMessage', data.CityName),
    //         this.l('AreYouSure'),
    //         isConfirmed => {
    //             if (isConfirmed) {
    //                 this.__proxy.request(ProxyURL.UpdateListCampaignHDR, RequestType.Post, obj)
    //                 .subscribe(() => {
    //                     //this.refresh();
    //                     this.onGoingList.refresh();
    //                     this.notify.success(this.l('SuccessfullyDeleted'));
    //                 });
    //             }
    //         }
    //     );
    // }

    refreshOnGoing(): void {
        this.onGoingGridUrl = this.gridUrl + 'filtertext=' + this.filterTextOnGoing + '&';
        console.log('onGoingData: ' + JSON.stringify(this.onGoingGridUrl));
        setTimeout(() => {
            this.onGoingList.refresh();
        }, 100);
    }

    onOnGoingCategoryChange(data: any[]): void {
        this.selectedCategoryOnGoing = data;
        this.OnGoingCategory = this.selectedCategoryOnGoing.CodeDesc;
    }

    filterlistongoing(): void {
        let url = this.gridUrl + 'ExpiryType=ongoing' + '&';
        this.selectedCategoryOnGoing != null ? url += 'category=' + encodeURIComponent('' + this.OnGoingCategory) + '&' : '';
        this.SelectedEvent != null ? url += 'EventNo=' + encodeURIComponent('' + this.SelectedEvent.ChannelNo) + '&' : '';

        this.onGoingList.gridUrl = url;
    }

    //#endregion

    //#region Event Summary
    populateEvent() {
        let url = ProxyURL.GetUpdatedEvent + 'campID=' + this.eventNo + '&';

        //console.log(this._tenderCount);
        this.__proxy.request(url, RequestType.Get)
            .subscribe(result => {
                console.log(result);
                this.inputHelper.id = result[0].CampID;
                this.inputHelper.name = result[0].Name;
                this.inputHelper.description = result[0].Description;
                this.inputHelper.eventtype = result[0].CampType;
                //this.inputHelper.testproject = ?
                this.inputHelper.lastmodified = result[0].LastUpdate;
                this.inputHelper.commodity = result[0].CommID;
                this.inputHelper.currency = result[0].Currency;
                this.inputHelper.contractmonths = result[0].CampMonths;
                this.inputHelper.contracteffectivedate = result[0].CampEffDate;
                this.inputHelper.baselinespend = result[0].BaseLineSpend;
                this.inputHelper.targetSaving = result[0].TargetSaving;
                this.inputHelper.creationdate = result[0].CreateDate;
                //this.inputHelper.projectreason = ?
                this.inputHelper.owner = result[0].Owner;
                this.inputHelper.canplacebidduringpreview = result[0].PreBidOpt;
                this.inputHelper.specifybidbeginend = result[0].LotBiddingOpt;
                this.inputHelper.plannedstarttime = result[0].PlannedBidStartTime;
                this.inputHelper.plannedbidstarttime = result[0].PlannedStartTime;
                this.inputHelper.runtimefirstlot = result[0].FirstLotRunTime;
                this.inputHelper.timebetweenclosing = result[0].TimeLotClose;
                this.inputHelper.allowbidovertime = result[0].IsAllowBidOvrTime;
                this.inputHelper.bidranktriggerovertime = result[0].OvrTimeTrigger;
                this.inputHelper.startovertimebidsubmit = result[0].StartI0vrTime;
                this.inputHelper.overtimeperiod = result[0].OvrTimePeriod;
                this.inputHelper.estimatedawarddate = result[0].EstAwardDate;
                this.inputHelper.improvebidamount = result[0].ImproveBidBy;
                this.inputHelper.cansubmittiebids = result[0].SubmitTieBidOpt;
                this.inputHelper.allowselectbidcurrency = result[0].IsAllowSelBidCurr;
                this.inputHelper.specityviewmarketinfo = result[0].ViewMktInfoOpt;
                this.inputHelper.showleadbid = result[0].IsShowLeadBid;
                this.inputHelper.canseeranks = result[0].IsCanSeeRank;
                this.inputHelper.indicatevaluespecified = result[0].IsSpecifyInitValue;
                this.inputHelper.EventStatus = result[0].EventStatus;
            })
    }

    publishEvaluation() {
        let dataParticipant = this.participantgrid.get();
        
        if(dataParticipant.length>0){
            let dataRequester = dataParticipant.filter(x => x.Requester === "Yes");
            let dataBuyers = dataParticipant.filter(x => x.Buyers === "Yes");

            if((dataRequester.length<dataParticipant.length) || (dataBuyers.length<dataParticipant.length)){
                this.notify.error(this.l('PublishEventLessEvaluator'));
            }else{

                this.message.confirm(
                    this.l('PromptMessageBeforePublish', this.inputHelper.name),
                    this.l('AreYouSure'),
                    isConfirmed => {
                        if (isConfirmed) {
                            this.spinnerService.show();
                            let url = ProxyURL.CreateEvent + 'mode=3&';
                            let inputData: any = {};

                            inputData.CampID = this.eventNo;
                            inputData.BizRegID = this._storage.bizRegID;
                            inputData.BizLocID = this._storage.bizLocID;

                            this.__proxy.request(url, RequestType.Post, inputData)
                                .pipe(finalize(() => {
                                    this.spinnerService.hide();
                                }))
                                .subscribe(result => {
                                    //console.log(result);
                                    if (result == "true") {
                                        this.notify.info(this.l('SavedSuccessfully'));
                                        this._route.navigate(['/app/event']);
                                    } else if (result == "participantData_empty") {
                                        this.notify.error(this.l('ParticipantInadequate'));
                                    } else if (result == "committeeData_empty") {
                                        this.notify.error(this.l('CommitteeInadequate'));
                                    } else if (result == "dataStatus_empty") {
                                        this.notify.error(this.l('DataNotFound'));
                                    } else {
                                        this.notify.error(this.l('FailedToSave'));
                                    }
                                });
                        }
                    }
                );
            }
        }else{
            this.notify.error(this.l('PublishEventLessEvaluator'));
        }
    }

    publish() {
        this.message.confirm(
            this.l('PromptMessageBeforePublish', this.inputHelper.name),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    let url = ProxyURL.CreateEvent + 'mode=2&';
                    let inputData: any = {};

                    inputData.CampID = this.inputHelper.id;
                    inputData.BizRegID = this._storage.bizRegID;
                    inputData.BizLocID = this._storage.bizLocID;

                    this.__proxy.request(url, RequestType.Post, inputData)
                        .pipe(finalize(() => {
                            this.spinnerService.hide();
                        }))
                        .subscribe(result => {
                            //console.log(result);
                            if (result == "true") {
                                this.notify.info(this.l('SavedSuccessfully'));
                                this._route.navigate(['/app/event/all']);
                            } else if (result == "lotSelection_empty") {
                                this.notify.error(this.l('LotSelectionEmpty'));
                            } else if (result == "participantData_empty") {
                                this.notify.error(this.l('ParticipantInadequate'));
                            } else if (result == "dataStatus_empty") {
                                this.notify.error(this.l('DataNotFound'));
                            } else if (result == "eventRule_false") {
                                this.notify.error(this.l('EventRuleInvalid'));
                            } else {
                                this.notify.error(this.l('FailedToSave'));
                            }
                        })
                }
            }
        )
    }

    declineRespon() {
        //let inputData: any = {};
        this.message.confirm(
            this.l(this.eventTitle),
            this.l('AreYouSure'),
            isConfirmed => {
                this.spinnerService.show();
                if (isConfirmed) {
                    this.spinnerService.show();
                    let url = ProxyURL.DeclineInvitedEvent + 'eventNo=' + this.eventNo + '&';
                    this.__proxy.request(url, RequestType.Post, this.eventNo)
                        .pipe(finalize(() => {
                            this.spinnerService.hide();
                        }))
                        .subscribe((result) => {
                            if (result) {
                                this.notify.info(this.l('SavedSuccessfully'));
                                this._route.navigate(['/app/event/invited'])
                            } else {
                                this.notify.error(this.l('FailedToSave'));
                            }
                        })
                    //console.log("Mlebu Kene")
                }
            }
        )
    }

    //#endregion
    populateParticipant(): void {
        let url = ProxyURL.GetParticipantList + 'campid=' + this.campID + '&';
        if (this.participantgrid != undefined) {
            this.participantgrid.refresh(url);
        }

    }

    populateCommittee(): void {
        let requesterUrl = ProxyURL.GetCommitteeList + 'campid=' + this.campID + '&' + 'reviewerType=' + this.requesterRole + '&';
        if (this.requestergrid != undefined) {
            this.requestergrid.refresh(requesterUrl);
        }
        let technicalUrl = ProxyURL.GetCommitteeList + 'campid=' + this.campID + '&' + 'reviewerType=' + this.technicalRole + '&';
        if (this.technicalgrid != undefined) {
            this.technicalgrid.refresh(technicalUrl);
        }
        let commercialUrl = ProxyURL.GetCommitteeList + 'campid=' + this.campID + '&' + 'reviewerType=' + this.commercialRole + '&';
        if (this.commercialgrid != undefined) {
            this.commercialgrid.refresh(commercialUrl);
        }
    }

    editEvents() {
        this._route.navigate(['/app/event/edit-evaluation']);
    }

    editVendor() {
        this._route.navigate(['/app/event/vendor']);
    }

    editEvaluator() {
        this._route.navigate(['/app/event/evaluator']);
    }
}

