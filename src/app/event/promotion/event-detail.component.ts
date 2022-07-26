import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { TenderCont, PaxRegPaxLog } from '@shared/AppEnums';

@Component({
  templateUrl: './event-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class EventDetailComponent extends AppComponentBase implements OnInit, AfterViewInit {

  @ViewChild('itemsListComponents', { static: false }) itemsListComponents: BaseListComponent;

  gridUrl: string;
  campID: string;
  BizRegID: string;
  BizLocID: string;
  status: number;
  cols: any;
  eventID: string;
  eventName: string;

  inputHelper: any = {};

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private _storage: AppStorage,
    private __proxy: GenericServiceProxy,
    private __fileDownloadService: FileDownloadService,
    private _route: Router,
    private _tenderCont: TenderCont,
    private _paxRegPaxLoc: PaxRegPaxLog
  ) {
    super(injector);
    this.BizRegID = this._storage.bizRegID;
    this.BizLocID = this._storage.bizLocID;
    this._activatedRoute.params.subscribe(params => {
      // let paramId=AppConsts.ParentID ? AppConsts.ParentID : '20200520142HVUAE';

      this.campID = params['id'];
    });
  }

  ngOnInit(): void {
    // this.campID = this._tenderCont.Items['CampID'];
    this.gridUrl = ProxyURL.GetParticipantEvaluation + 'campID=' + this.campID + '&';
    this.eventID = this._tenderCont.Items['CampID'];
    this.eventName = this._tenderCont.Items['Name'];
  }

  populateData() {
    if (this.status == 0) {
      this.gridUrl = ProxyURL.GetEventItems + 'CampaignID=' + this.campID + '&mode=' + 1 + '&';
    } else {
      this.gridUrl = ProxyURL.GetEventItems + 'CampaignID=' + AppConsts.parentId + '&mode=' + 1 + '&';
    }
  }

  ngAfterViewInit(): void {

  }

  detail(data?: any) {
    AppConsts.parentId = this.eventID;
    this._paxRegPaxLoc.PaxRegID = data[0].PaxRegID;
    this._paxRegPaxLoc.PaxLocID = data[0].PaxLocID;
    //this._route.navigate(['/app/event/participant']);
    // AppConsts.isEventDtl = 'true';
  }

  refresh(): void {
    if (this.status == 0) {
      let url = ProxyURL.GetEventItems + 'CampaignID=' + this.campID + '&mode=' + 1 + '&';
      this.itemsListComponents.gridUrl = url;
    } else {
      let url = ProxyURL.GetEventItems + 'CampaignID=' + AppConsts.parentId + '&mode=' + 1 + '&';
      this.itemsListComponents.gridUrl = url;
    }
  }
}
