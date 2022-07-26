import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { TenderCont } from '@shared/AppEnums';
import { GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { questionerMode } from '@app/shared/form/questionnaire/questionnaire-field.component';

@Component({
    templateUrl: './detail-review.component.html',
    // styleUrls: ['./detail-review.component.less'],
    encapsulation: ViewEncapsulation.None
  })

  export class DetailReviewComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
    @ViewChild('baselistTabCommercial', { static: false }) baselistTabCommercial: BaseListComponent;
    @ViewChild('baselistTabTechnical', { static: false }) baselistTabTechnical: BaseListComponent;

  
    campID: string;
    regID: string;
    vendorID: string;
    reviewerID: string;
    eventName: string;
    eventID: string;

    paxRegid:string;
    //#region Variable
    checkData: number;
    title: string;
    subTitle: string;
    roles: string;
    vendorName: string;
    //#endregion

    //#region Commercial
    gridComUrl: string = undefined;
    selectedComm: any[] = [];
    //#endregion

    //#region Technical
    gridTechUrl: string = undefined;
    selectedTech: any[] = [];
    //#endregion

    constructor(
      injector: Injector,
      private _storage: AppStorage,
      private _activedRoute: ActivatedRoute,
      private _proxy: GenericServiceProxy,
      private _route: Router,
      private _tenderCount: TenderCont
    ) {
        super(injector);

        this._activedRoute.queryParams
            .subscribe(params => {
                //console.log(params);
                this.checkData = params.type;
                this.campID = params.campid;
                this.regID = params.paxlocid;
                this.vendorID = params.paxlocid;
                this.vendorName = params.branchname;
                this.reviewerID = this._storage.bizRegID;
                this.eventName = params.eventname;
                this.eventID = params.eventid;
                this.paxRegid = params.paxregid;

                if (this.checkData == 1) {
                  //this.reviewerID = this._storage.bizRegID;
                  //this.vendorID = params['id'].split('|')[2];
                  this.roles = this.l('Commercial');
        
                  this.title = this.l('CommercialReview');
                  this.subTitle = this.l('CommercialDetail');
        
                  this.gridComUrl = ProxyURL.GetDetailReview + 'campID=' + this.campID + '&bizRegID=' + params.paxregid + '&bizLocID=' + params.paxlocid + '&Type=' + 1 + '&';
                  this.baselistTabCommercial.setURL(this.gridComUrl);
                  this.baselistTabCommercial.refresh();
                  this.selectedComm = [];
                } else {
                  //Technical  Review
                  this.title = this.l('TecnicalReview');
                  this.subTitle = this.l('TecnicalDetail');
                  this.roles = this.l('Technical');
                  this.gridTechUrl = ProxyURL.GetDetailReview + 'campID=' + this.campID + '&bizRegID=' + params.paxregid + '&bizLocID=' + params.paxlocid + '&Type=0&';
                  this.baselistTabTechnical.setURL(this.gridTechUrl);
                  this.baselistTabTechnical.refresh();
                  this.selectedTech = [];
                }
            });
        //Create Bidding
        // if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'technical-review').length > 0) {
        //     this.checkData = 0;
        // } else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'commercial-review').length > 0) {
        //     this.checkData = 1;
        // } 
        // this._activedRoute.params.subscribe(params => {
          // console.log(params['id']);
          //this.checkData = params['id'].split('|')[0];
          //this.campID = params['id'].split('|')[1];          
          // });
        }
  
    ngOnInit(): void {
      // this.campID='2020051916RKSLOE';
      // if (this.checkData == 0) {
      //   this.title = this.l('TecnicalReview');
      //   this.subTitle = this.l('TecnicalDetail');
      //   this.roles = this.l('Technical');
      // } else {
      //   this.title = this.l('CommercialReview');
      //   this.subTitle = this.l('CommercialDetail');
      //   this.roles = this.l('Commercial');
      //   this.gridComUrl = ProxyURL.GetReviewList + 'campID=' + this.campID + '&Type=' + 1 + '&';
      //   this.baselistTabCommercial.setURL(this.gridComUrl);
      //   this.baselistTabCommercial.refresh();
      //   this.selectedComm = [];
      // }
    }
    ngAfterViewInit(): void {
    }
  
    comment(data: any): void {
      console.log(data);
    }

    reviewQuestionnaire(): void {
      let params ={
        campid : this.campID,
        campname : this.eventName,
        paxregid : this.paxRegid,
        paxlocid : this.vendorID,
        mode : questionerMode.comment
    }
    //console.log(params);
    this._route.navigate(['/app/event/event-questionnaire/'], { queryParams: params, skipLocationChange: true });
    }
}