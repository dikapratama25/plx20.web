import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { TenderCont } from '@shared/AppEnums';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { finalize } from 'rxjs/operators';
import { questionerMode } from '@app/shared/form/questionnaire/questionnaire-field.component';

@Component({
    templateUrl: './technical-commercial-review.component.html',
    // styleUrls: ['./document-review.component.less'],
    encapsulation: ViewEncapsulation.None
  })

  export class TechnicalCommercialComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
    @ViewChild('baselistTabCommercial', { static: false }) baselistTabCommercial: BaseListComponent;
    @ViewChild('baselistTabTechnical', { static: false }) baselistTabTechnical: BaseListComponent;


    //#region Variable
    checkData: number;
    campID: string;
    title = '-';
    subTitle: string;
    roles: string;
    eventName: string;
    eventID: string;
    employeeID: string;

    totalValue: number = 0;
    totalPendingTech : number = 0;
    totalCompletedTech : number = 0;

    totalValComm: number = 0;
    totalPendingRevComm : number = 0;
    totalPendingSubmComm : number = 0;
    totalCompletedComm : number = 0;

    gridComUrl: string = undefined;
    gridTechUrl: string = undefined;
    eventMode = 'Evaluation';
    //#endregion
    showSuppDoc = true;
    //#region Commercial
    selectedComm: any[] = [];
    //#endregion

    //#region Technical
    selectedTech: any[] = [];
    //#endregion

    constructor(
      injector: Injector,
      private _storage: AppStorage,
      private _activedRoute: ActivatedRoute,
      private _proxy: GenericServiceProxy,
      private _route: Router,
      private formBuilder: FormBuilder,
      private _tenderCount: TenderCont
  ) {
      super(injector);
      //Create Bidding
      this.eventName = this._tenderCount.Items['Name'];
      this.eventID = this._tenderCount.Items['CampID'];
      if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'technical-review').length > 0) {
          this.checkData = 0;
          this.title = this.l('HSE Review');
          this.subTitle = this.l('HSE Review Detail');
          this.roles = this.l('HSE');
          this.showSuppDoc = false;
      } else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'commercial-review').length > 0) {
          this.checkData = 1;
          this.title = this.l('Buyer Review');
            this.subTitle = this.l('Buyer Review Detail');
            this.roles = this.l('Buyers');
            this.showSuppDoc = false;
      } else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'requester-review').length > 0) {
        this.checkData = 1;
        this.title = this.l('Requester Review');
          this.subTitle = this.l('Requester Review Detail');
          this.roles = this.l('Requester');
          this.showSuppDoc = false;
    }
  }

    ngOnInit(): void {
    
      this.campID = this._tenderCount.Items['CampID'];//'2020051916RKSLOE';
      this.employeeID = this.appStorage.employeeID;
      // this.populateTechReview();
      //console.log(this.campID);
    }

    ngAfterViewInit(): void {
        if (this.checkData == 0) {
          
            // this.gridTechUrl = ProxyURL.GetReviewCommitteeList + 'campID=' + this.campID + '&mode=' + this.eventMode + '&'
            // this.baselistTabTechnical.setURL(this.gridTechUrl);
            // this.baselistTabTechnical.refresh();
            let url = ProxyURL.GetCounterCommitteeReviewList + 'campID=' + this.campID + '&';
            this._proxy.request(url, RequestType.Get) 
            .pipe(finalize(() => {
                this.gridTechUrl = ProxyURL.GetReviewCommitteeList + 'campID=' + this.campID + '&mode=' + this.eventMode + '&'
                this.baselistTabTechnical.setURL(this.gridTechUrl);
                this.baselistTabTechnical.refresh();
                }))
            .subscribe((result) => {
                //console.log(result)
                let total = result.pendingReview+result.completed;
                this.totalValue = total;
                this.totalPendingTech = result.pendingReview;
                this.totalCompletedTech = result.completed;
                // }
                // console.log(this.totalValue);
                // console.log(this.totalPendingTech);
                // console.log(this.totalCompletedTech);
            });
            this.selectedTech = [];
            //console.log('initTecnical');
        } else {
            
            // this.gridComUrl = ProxyURL.GetReviewCommitteeList + 'campID=' + this.campID + '&mode=' + this.eventMode + '&';
            // this.baselistTabCommercial.setURL(this.gridComUrl);
            // this.baselistTabCommercial.refresh();
            // let url = ProxyURL.GetCounterCommReviewList + 'campID=' + this.campID + '&';
            // this._proxy.request(url, RequestType.Get)
            // .subscribe((result) => {
            //     //console.log(result)
            //     this.totalValComm = result.items[0].totalEvent;
            //     this.totalPendingRevComm = result.items[0].totalPendingReview;
            //     this.totalPendingSubmComm = result.items[0].totalPendingSubmit;
            //     this.totalCompletedComm = result.items[0].totalCompleted
            // });
            let url = ProxyURL.GetCounterCommitteeReviewList + 'campID=' + this.campID + '&';
            this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => {
                this.gridComUrl = ProxyURL.GetReviewCommitteeList + 'campID=' + this.campID + '&mode=' + this.eventMode + '&';
                this.baselistTabCommercial.setURL(this.gridComUrl);
                this.baselistTabCommercial.refresh();
            }))
            .subscribe((result) => {
             
                let total = result.pendingReview+result.completed;
                this.totalValue = total;
                this.totalPendingTech = result.pendingReview;
                this.totalCompletedTech = result.completed;
                // }
                // console.log(this.totalValue);
                // console.log(this.totalPendingTech);
                // console.log(this.totalCompletedTech);
            });
            this.selectedComm = [];
            //console.log('initCommercial');
        }
    }

    back(): void {
        this._route.navigate(['/app/event/event-review']);
    }

    populateTechReview() {
        this.gridTechUrl = ProxyURL.GetParticipantCombo + 'campID=' + this.campID + '&type=' + this.checkData + '&';
        //this.gridTechUrl = ProxyURL.GetReviewList + 'campID=' + this.campID + '&type=' + this.checkData + '&';
    }

    onTechLoadFinished() {
        this.refreshComGrid();
    }

    refreshComGrid(): void {
        setTimeout(() => {
            this.gridComUrl = ProxyURL.GetReviewList + 'campID=' + this.campID + '&Type=' + this.checkData + '&';
            this.baselistTabCommercial.setURL(this.gridComUrl);
            this.baselistTabCommercial.refresh();
            //console.log('refresh');
        }, 1000);
    }

    //#region Technical
    selectTech(data: any): void {
      this.selectedTech = data;
      //console.log(this.selectedTech);
    }

    detailTech(data?: any) {
        //console.log(data);
        let params ={
            type : this.checkData,
            campid : this.campID,
            paxregid : data.PaxRegID,
            paxlocid : data.PaxLocID,
            branchname: data.CompanyName,
            eventname: this.eventName,
            eventid: this.eventID
        }
        this._route.navigate(['/app/event/detail-review/'], { queryParams: params, skipLocationChange: true });
    }
    //#endregion

    //#region Commercial
    selectComm(data: any): void {
        this.selectedComm = data;
        //console.log(this.selectedComm);
    }

    detailComm(data?: any) {
      let params ={
        type : this.checkData,
        campid : this.campID,
        paxregid : data.PaxRegID,
        paxlocid : data.PaxLocID,
        branchname : data.CompanyName
      }
      this._route.navigate(['/app/event/detail-review/'], { queryParams: params, skipLocationChange: true });
    }
     //#endregion

    compare(data?: any) {
        let params ={
            type : this.checkData,
            campid : this.campID
            // paxregid : data.PaxRegID,
            // paxlocid : data.PaxLocID,
            // branchname : data.CompanyName
        }
        this._route.navigate(['/app/event/compare-participant/'], { queryParams: params, skipLocationChange: true });
    }

    reviewQuestionnaire(data?: any): void {
        console.log(data);
        let params ={
          campid : this.campID,
          campname : this.eventName,
          transno : data.PONo,
          paxregid : data.PaxRegID,
          paxlocid : data.PaxLocID,
          mode : questionerMode.survey
        }
        //console.log(params);
        this._route.navigate(['/app/event/questionnaire/'], { queryParams: params });
      }
}
