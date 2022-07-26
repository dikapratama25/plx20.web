import { result } from 'lodash';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { LazyLoadEvent } from 'primeng/public_api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { TenderCont } from '@shared/AppEnums';
import * as moment from 'moment';
// import { PopupMessageModalComponent } from '@app/event/popup-message/popup-message.component';

@Component({
    templateUrl: './event-promotion.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class EventPromotionComponent extends AppComponentBase implements OnInit, AfterViewInit {
    // @ViewChild('popupMessageModal', { static: true }) popupMessageModal: PopupMessageModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('onGoingList', { static: false }) onGoingList: BaseListComponent;

    selectedCategoryOnGoing: any;
    selectedCategoryUpComing: any;
    SelectedEvent: any;
    eventCombo: any;
    categoryCombo: any = [];
    selectedType: any;

    eventMode: number;

    //Filters
    advancedFiltersAreShown = false;
    filterText = '';
    filterTextOnGoing = '';
    filterTextUpComing = '';
    OnGoingCategory = '';
    UpComingCategory = '';
    Filter = '';
    flag = true;

    DiscoveryList = false;
    InvitedList = false;
    SubscribedList = false;
    EventList = false;
    startDate = undefined;
    endDate = undefined;

    gridUrl = ProxyURL.GetTenderEventList;
    permissionCreate = '';
    permissionEdit = 'Pages.Event.Channel.Edit, Pages.Event.Channel.Subscribe';
    permissionDelete = 'Pages.Event.Channel.Delete';
    permissionView = 'Pages.Event.Channel.View';

    onGoingGridUrl = ProxyURL.GetTenderEventList;
    upComingGridUrl: string;
    exPiredGridUrl: string;
    CodeDesc: string;
    mode: string;
    campIDSubcribe = '';
    cols: any[];
    comboTypeName: any[];

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _route: Router,
        private _proxy: GenericServiceProxy,
        private _storage: AppStorage,
        private _tenderCont: TenderCont
    ) {
        super(injector);
        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';

        AppConsts.isAdmin = 'false';

        if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'discovery').length > 0) {
            this.DiscoveryList = true;
            this.eventMode = 0;
            this.onGoingGridUrl = this.gridUrl + 'SearchAs=' + 'Discover' + '&';
        } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'invited').length > 0) {
            this.InvitedList = true;
            this.eventMode = 1;
            this.onGoingGridUrl = this.gridUrl + 'SearchAs=' + 'Invited' + '&';
        } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'subscribed').length > 0) {
            this.SubscribedList = true;
            this.eventMode = 1;
            this.onGoingGridUrl = this.gridUrl + 'SearchAs=' + 'Participate' + '&';
        } else {
            this.EventList = true;
            this.eventMode = 2;
            this.onGoingGridUrl = this.gridUrl + 'SearchAs=' + 'Creator' + '&';
        }
        // if (this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
        //
        // } else {
        //     this.onGoingGridUrl = this.gridUrl + 'ExpiryType=ongoing&BizRegID=' + this._storage.bizRegID + '&';
        // }
        //this.onGoingGridUrl = ProxyURL.GetEventHDR + 'Sorting=' + encodeURIComponent('c.CreateDate DESC') + '&'; // 'CampID=20200520142HVUAE&DecendingOrder=true&';
    }

    ngOnInit(): void {
        // this.getCodeMasterCombo();
        // this.getEventCombo();
        this.getTypeCombo();
    }

    ngAfterViewInit(): void {

    }

    onCompanyChange(data: any) {

    }

    getCodeMasterCombo() {
        this._proxy.request(ProxyURL.GetCodeMasterCombo + 'code=CPT', RequestType.Get)
            .pipe().subscribe(result => {
                this.categoryCombo = result;
                this.categoryCombo.unshift({ "CodeType": "CPT", "Code": "0", "CodeDesc": "All", "CodeRemark": "", "CodeRef": "", "CodeVal1": "", "CodeVal2": "", "CodeVal3": "" });
                this.selectedCategoryUpComing = 'All';
                this.selectedCategoryOnGoing = 'All';
            });
    }

    getEventCombo() {
        this._proxy.request(ProxyURL.GetCampaignCombo, RequestType.Get)
            .pipe().subscribe(result => {
                this.eventCombo = result;
            });
    }

    onOnGoingCategoryChange(data: any[]): void {
        this.selectedCategoryOnGoing = data;
        this.OnGoingCategory = this.selectedCategoryOnGoing.CodeDesc;
    }

    onUpComingCategoryChange(data: any[]): void {
        this.selectedCategoryUpComing = data;
        this.UpComingCategory = this.selectedCategoryUpComing.CodeDesc;
    }

    refreshOnGoing(): void {
        // this.onGoingGridUrl = this.gridUrl + 'DescendingOrder=true&';
        // setTimeout(() => {
        //     this.onGoingList.refresh();
        // }, 100);
    }

    // refreshUpComing(): void {
    //     this.upComingGridUrl = this.gridUrl + 'ExpiryType=upcoming&filtertext=' + this.filterTextUpComing + '&';
    //     setTimeout(() => {
    //         this.upComingList.refresh();
    //     }, 100);
    // }

    filterlistongoing(): void {
        // let url = this.gridUrl + 'ExpiryType=ongoing' + '&';
        // this.selectedCategoryOnGoing != null ? url += 'category=' + encodeURIComponent('' + this.OnGoingCategory) + '&' : '';
        // this.SelectedEvent != null ? url += 'EventNo=' + encodeURIComponent('' + this.SelectedEvent.ChannelNo) + '&' : '';

        // this.onGoingList.gridUrl = url;
    }

    // filterlistupcoming(): void {
    //     let url = this.gridUrl + 'ExpiryType=upcoming' + '&';
    //     this.selectedCategoryUpComing != null ? url += 'category=' + encodeURIComponent('' + this.UpComingCategory) + '&' : '';
    //     this.SelectedEvent != null ? url += 'EventNo=' + encodeURIComponent('' + this.SelectedEvent.ChannelNo) + '&' : '';

    //     this.upComingList.gridUrl = url;
    // }

    // filterlistexpired(): void {
    //     let url = this.gridUrl + 'ExpiryType=passed' + '&';
    //     this.selectedCategoryUpComing != null ? url += 'category=' + encodeURIComponent('' + this.UpComingCategory) + '&' : '';
    //     this.SelectedEvent != null ? url += 'EventNo=' + encodeURIComponent('' + this.SelectedEvent.ChannelNo) + '&' : '';

    //     this.expiredList.gridUrl = url;
    // }

    onSelectedChange(data: any): void {
        if (this.isGranted('Pages.Event.Channel.Edit')) {
            this._route.navigate(['/app/event/edit/' + data['EventID']]);
        } else if (this.isGranted('Pages.Event.Channel.Subscribe')) {
            this._route.navigate(['/app/event/subscribe/' + data['EventID']]);
        }
    }

    
    create(): void {
        // this._route.navigate(['/app/event/create']);
        this._route.navigate(['/app/event/create-evaluation']);        
    }

    createTender(): void {
        this._route.navigate(['/app/event/create-tender']);
    }

    edit(data: any): void {
        
        this._tenderCont.Items = data;
        this._route.navigate(['/app/event/subscribe']);
        // if (this.eventMode === 0 || this.eventMode === 1) {
        // if ((this.eventMode === 0 && !this.isGranted('Pages.Event.Evaluation')) || (this.eventMode === 1 && !this.isGranted('Pages.Event.Evaluation'))) {
        //     this._tenderCont.Items = data;
        //     this._route.navigate(['/app/event/subscribe/' + data['CampID']]);
        // // } else if (this.eventMode === 2 && this.isGranted('Pages.Event.Evaluation')) {
        // } else if (this.isGranted('Pages.Event.Evaluation')) {
        //     this._tenderCont.Items = data;
        //     this._route.navigate(['/app/event/event-detail/' + data['CampID']]);
        // } else {
        //     this._tenderCont.Items = data;
        //     this._route.navigate(['/app/event/subscribe/' + data['CampID']]);
        //     // this._route.navigate(['/app/event/participant']);
        // }
    }

    subscribe(data: any): void {
        this._tenderCont.Items = data['data'];
        this._route.navigate(['/app/event/prerequisite']);
        // this.campIDSubcribe = data['data']['CampID'];
        // this.popupMessageModal.show(this.l('AreYouSure'), this.l('EventWarningMessage'));
    }

    popupResponse(response: any): void {
        console.log(response);
        let url: string = ProxyURL.SubscribeResponse + 'CampID=' + this.campIDSubcribe + '&' + 'PaxRegID=' + this._storage.bizRegID + '&' + 'PaxLocID=' + this._storage.bizLocID + '&' + 'Status=' + response;
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                if (result.isSuccess) {
                    this.onGoingList.refresh();
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.campIDSubcribe = '';
                } else {
                    this.notify.error(this.l('Failed'));
                    this.campIDSubcribe = '';
                }
            });
        // if (data['data']['EventType'] === 'Bidding') {
        //     this.message.confirm(
        //         this.l('EventResponseWarningMessage'),
        //         this.l('AreYouSure'),
        //         isConfirmed => {
        //             if (isConfirmed) {
        //                 this._proxy.request(url, RequestType.Get)
        //                 .subscribe(result => {
        //                     if (result.isSuccess) {
        //                         this.onGoingList.refresh();
        //                         this.notify.info(this.l('SavedSuccessfully'));
        //                     } else {
        //                         this.notify.error(this.l('Failed'));
        //                     }
        //                 });
        //             }
        //         }
        //     );
        // } else {
        //     this.message.confirm(
        //         this.l('EventSubscribeWarningMessage'),
        //         this.l('AreYouSure'),
        //         isConfirmed => {
        //             if (isConfirmed) {
        //                 this._proxy.request(url, RequestType.Get)
        //                 .subscribe(result => {
        //                     if (result.isSuccess) {
        //                         this.onGoingList.refresh();
        //                         this.notify.info(this.l('SavedSuccessfully'));
        //                     } else {
        //                         this.notify.error(this.l('Failed'));
        //                     }
        //                 });
        //             }
        //         }
        //     );
        // }
    }

    view(data: any): void {
        let params = {
            result: data
        }
        //console.log('data : ' + JSON.stringify(data));
        this._route.navigate(['/app/event/view-history/' + data['EventID']]);
    }

    delete(data: any): void {
        //console.log(data);
        let obj: any = [];
        data.Status = 0;
        data.CampNo = data.EventID;
        data.TransNo = 'x';
        obj.push(data);
        //console.log(obj);
        this.message.confirm(
            this.l('DataDeleteWarningMessage', data.CityName),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this._proxy.request(ProxyURL.UpdateListCampaignHDR, RequestType.Post, obj)
                        .subscribe(() => {
                            //this.refresh();
                            this.onGoingList.refresh();
                            //this.upComingList.refresh();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    onEventChange(data?: string) {

    }

    onStartChange(data?:any){
        this.startDate=data;
        this.refreshFilter(1);
    }

    onEndChange(data?:any){
        
        this.endDate=data;
        this.refreshFilter(1);
    }

    refreshFilter(data?: any): void {
        if(this.onGoingList!=undefined){
            this.onGoingList.setURL(this.setUrl());
            this.onGoingList.refresh();
        }
    }

    setUrl(): string {
        let url = this.onGoingGridUrl;
        //console.log(url);
        (this.selectedType != null || this.selectedType != undefined) ? url += 'status=' + encodeURIComponent(this.selectedType) + '&' : 'status=null&';
        (this.startDate != undefined || this.startDate != null) ? url += 'From=' + encodeURIComponent(moment(new Date(this.startDate)).format('LL')) + '&' : 'From=null&';
        (this.endDate != undefined || this.endDate != null) ? url += 'To=' + encodeURIComponent(moment(new Date(this.endDate)).format('LL')) + '&' : 'To=null&';
        return url;
    }

    getTypeCombo(): void {
        let url = ProxyURL.GetCodeMasterCombo + 'code=EVE&';
        this._proxy.request(url, RequestType.Get, url)
        .subscribe((result) => {
            this.comboTypeName = result;
            this.comboTypeName.forEach(x => { x.CodeDesc = this.l(x.CodeDesc); });
        })
    }

}
