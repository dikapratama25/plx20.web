import { ProxyURL } from '../../../shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '../../shared/form/list/base-list.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Component, OnInit, ViewEncapsulation, Injector, ViewChild } from '@angular/core';
import { TenderCont } from '@shared/AppEnums';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { Router } from '@angular/router';

@Component({
  templateUrl: './event-summary.component.html',
  styleUrls: ['./event-summary.component.less'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class EventSummaryComponent extends AppComponentBase implements OnInit {
  @ViewChild('participantListComponent', {static: false}) participantListComponent: BaseListComponent;
  @ViewChild('allContentListComponent', {static: false}) allContentListComponent: BaseListComponent;

  inputHelper: any = {};
  participantURL: string;
  allContentURL: string;

  constructor(
    injector: Injector,
    private _tenderCount: TenderCont,
    private _proxy: GenericServiceProxy,
    private _storage: AppStorage,
    private _route: Router
  ) {
    super(injector);
  }

  ngOnInit() {
    // this.inputHelper.id = '';
    // this.inputHelper.name = '';
    // this.inputHelper.description = '';
    // this.inputHelper.eventtype = '';
    // this.inputHelper.testproject = '';
    // this.inputHelper.lastmodified = '';
    // this.inputHelper.commodity = '';
    // this.inputHelper.currency = '';
    // this.inputHelper.contractmonths = '';
    // this.inputHelper.contracteffectivedate = '';
    // this.inputHelper.baselinespend = '';
    // this.inputHelper.eventtype = '';
    // this.inputHelper.creationdate = '';
    // this.inputHelper.projectreason = '';
    // this.inputHelper.owner = '';

    // this.inputHelper.canplacebidduringpreview = '';
    // this.inputHelper.specifybidbeginend = '';
    // this.inputHelper.plannedstarttime = '';
    // this.inputHelper.plannedbidstarttime = '';
    // this.inputHelper.runtimefirstlot = '';
    // this.inputHelper.timebetweenclosing = '';
    // this.inputHelper.allowbidovertime = '';
    // this.inputHelper.bidranktriggerovertime = '';
    // this.inputHelper.startovertimebidsubmit = '';
    // this.inputHelper.overtimeperiod = '';
    // this.inputHelper.estimatedawarddate = '';

    // this.inputHelper.improvebidamount = '';
    // this.inputHelper.cansubmittiebids = '';

    // this.inputHelper.allowselectbidcurrency = '';

    // this.inputHelper.specityviewmarketinfo = '';
    // this.inputHelper.showleadbid = '';
    // this.inputHelper.canseeranks = '';
    // this.inputHelper.indicatevaluespecified = '';

    this.populateData();

    this.populateEvent();

  }

  populateData() {
    this.participantURL = ProxyURL.GetSupplierList; // + 'MaxResultCount=5&' + 'approvalstatus=-1' + '&';
    this.allContentURL = ProxyURL.GetItemStock + 'MaxResultCount=5' + '&';
  }

  populateEvent() {
    let url = ProxyURL.GetUpdatedEvent + 'campID=' + this._tenderCount.Items['CampID'] + '&';
    
    //console.log(this._tenderCount);
    this._proxy.request(url, RequestType.Get)
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
          this.inputHelper.contractmonths= result[0].CampMonths;
          this.inputHelper.contracteffectivedate = result[0].CampEffDate;
          this.inputHelper.baselinespend = result[0].BaseLineSpend;
          this.inputHelper.targetSaving = result[0].TargetSaving;
          this.inputHelper.creationdate = result[0].CreateDate;
          //this.inputHelper.projectreason = ?
          this.inputHelper.owner = result[0].Owner;
          this.inputHelper.canplacebidduringpreview = result[0].PreBidOpt;
          this.inputHelper.specifybidbeginend  = result[0].LotBiddingOpt;
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

  publish() {
    if(confirm(this.l('PromptMessageBeforePublish'))) {
      let url = ProxyURL.CreateEvent + 'mode=2&';
      let inputData: any = {};

      inputData.CampID = this.inputHelper.id;
      inputData.BizRegID = this._storage.bizRegID;
      inputData.BizLocID = this._storage.bizLocID;

      this._proxy.request(url, RequestType.Post, inputData)
        .subscribe(result => {
          if (result == "true") {
            this.notify.info(this.l('SavedSuccessfully'));
            this._route.navigate(['/app/event/all']);
          } else {
              this.notify.error(this.l('FailedToSave'));
          }
        })
    }
  }

}
