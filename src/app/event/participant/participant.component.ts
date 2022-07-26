import { result } from 'lodash';
import { request } from 'http';
import { Component, Injector, ViewChild, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ParticipantListModalComponent } from './participant-listing.component';
import { ParticipantGridComponent } from './participant-grid.component';
import { AppConsts } from '@shared/AppConsts';
import { TenderCont, PaxRegPaxLog } from '@shared/AppEnums';
import { Location } from '@angular/common';
import { CommitteeListModalComponent } from '../committee/committee-listing.component';


@Component({
    selector: 'app-participant',
    templateUrl: './participant.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ParticipantComponent extends AppComponentBase implements OnInit {
    @ViewChild('participantListModal', { static: true }) participantListModal: ParticipantListModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
    @ViewChild('participantgrid', { static: false }) participantgrid: ParticipantGridComponent;
    @ViewChild('committeeListModal', { static: true }) committeeListModal: CommitteeListModalComponent;
    @Input() campID = '';

    docCode = '';
    gridUrl: string;
    eventID: string;
    eventName: string;
    data: any = {};
    datas: any[] = [];

    urlEventStatus = ProxyURL.GetEventStatus;
    currentEventStatus = '';
    disabledButton = false;
    eventMode = '';
    isWithHSE = false;
    allowedDelete = false;

    constructor(
        injector: Injector,
        private location: Location,
        private _activatedRoute: ActivatedRoute,
        private _route: Router,
        private _proxy: GenericServiceProxy,
        private _storage: AppStorage,
        private _tenderCont: TenderCont,
        private _paxRegPaxLoc: PaxRegPaxLog
    ) {
        super(injector);
        // this.campID = '20200520142HVUAE';
    }

    ngOnInit() {
        this.checkCont();

        if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'vendor').length > 0) {
            this.eventMode = "Evaluation";
        }

        this.docCode = AppConsts.parentId;
        this.campID = this._tenderCont.Items['CampID'];
        this.eventID = this._tenderCont.Items['CampID'];
        this.eventName = this._tenderCont.Items['Name'];
        if (this._tenderCont.Items['TargetSaving'] === 1) {
            this.isWithHSE = true;
        }
        let url = this.urlEventStatus + 'campID=' + this.eventID + '&';
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                this.currentEventStatus = result;
                if (this.currentEventStatus != '0') {
                    this.disabledButton = true;
                }
            });

        this.populateData();
    }

    checkCont() {
        if (this._tenderCont.Items['CampID'] === undefined || this._paxRegPaxLoc.PaxRegID === null) {
            this.location.back();
        }
    }

    back(): void {
        this._route.navigate(['/app/event/subscribe']);
    }

    refresh(): void {
        let url = ProxyURL.GetParticipantList + 'campid=' + this.campID + '&';
        this.participantgrid.refresh(url);
    }

    uploadComplete(dataResult: any): void {
        this.refresh();
    }

    attachEvaluator(data: any): void {
        this.committeeListModal.show(this.eventMode, this.campID, this.isWithHSE, data.BizRegID, data.PaxMode);
    }

    detailVendor(data: any): void {
        
        this._route.navigate(['/app/event/vendor/vendor-detail/' + data.BizRegID + '/' + data.BizLocID+'/'+data.PONo]);

    }

    edit(): void {
        this.participantListModal.show(this.eventMode, this.campID, this.participantgrid.baselist.model.records);
    }

    select(data?: any) {
        if (data !== null && data.length > 0) {
            this.allowedDelete = true;
        } else {
            this.allowedDelete = false;
        }
    }

    deleteParticipant(): void {
        if (this.participantgrid.checked !== null && this.participantgrid.checked.length > 0) {
            let url = ProxyURL.DeleteParticipant;
            let data = this.participantgrid.checked;
            this.message.confirm(
                this.l('ParticipantDeleteWarningMessage'),
                this.l('AreYouSure'),
                isConfirmed => {
                    if (isConfirmed) {
                        this._proxy.request(url, RequestType.Post, data)
                            .subscribe(result => {
                                if (result.isSuccess) {
                                    this.refresh();
                                    this.notify.info(this.l('SavedSuccessfully'));
                                } else {
                                    this.notify.error(this.l('Failed'));
                                }
                            });
                    }
                }
            );
        } else {
            this.notify.warn(this.l('PleaseSelectData'));
        }
    }

    populateData() {

    }
}
