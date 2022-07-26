import { TenderCont } from '@shared/AppEnums';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { Observable, combineLatest as _observableCombineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    templateUrl: './final-award.component.html',
    // styleUrls: ['./final-award.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
  })

  export class FinalAwardComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('finalReviewList', { static: false }) finalReviewList: BaseListComponent;
    @ViewChild('baselist', { static: false }) baselist: BaseListComponent;

    title = 'Final Award';
    subTitle = 'Review';
    CampID: string;
    DocNo: string;
    EventName: string;

    BizRegID: string;
    BizLocID: string;
    EmployeeID: string;

    gridUrlBase = ProxyURL.GetParticipantFinalAwardDtl;
    gridUrlBaseLine = ProxyURL.GetParticipantTenderReviewDtlLine;
    evalScoreUrl: string;
    empUrl = ProxyURL.GetEmployee;
    empOrgUnitUrl = ProxyURL.GetEmployeeByOrganizationUnit;
    empModel: any = {};
    evalScoreModel: any = {};

    roleName: string;

    constructor(
      injector: Injector,
      private sanitizer: DomSanitizer,
      private _activatedRoute: ActivatedRoute,
      private _route: Router,
      private _proxy: GenericServiceProxy,
      private _storage: AppStorage,
      private _tenderCont: TenderCont
    ) {
      super(injector);

      this.BizRegID = this._storage.bizRegID;
      this.BizLocID = this._storage.bizLocID;
      this.EmployeeID = this._storage.employeeID;

      this._activatedRoute.params.subscribe(params => {
        this.CampID = params['campid'] ? params['campid'] : '2020051916RKSLOE';
      });
    }

    ngOnInit(): void {
      this.getEmployee();
    }

    ngAfterViewInit(): void {
      this.getEvaluationScore();
      this.populateData();
      this.detailBoard();
    }

    refresh(): void {
    }

    getEvaluationScore() {
      let quizID = this._tenderCont.Items['QuizID'] !== undefined ? this._tenderCont.Items['QuizID'] : '20200924066371BE';
      let campID = this._tenderCont.Items['CampID'] !== undefined ? this._tenderCont.Items['CampID'] : '2020022611VHQKMZ';

      this.evalScoreUrl = ProxyURL.GetEvaluationScore;
      this.evalScoreUrl += 'quizID=' + encodeURIComponent(quizID) + '&' + 'campID=' + encodeURIComponent(campID) + '&';
      this.finalReviewList.setURL(this.evalScoreUrl);
      this.finalReviewList.refresh();
    }

    getEmployee() {
      let url = this.empUrl + 'employeeID=' + encodeURIComponent(this.EmployeeID) + '&' + 'bizRegID=' + encodeURIComponent(this.BizRegID) + '&';
      let orgUrl = this.empOrgUnitUrl + 'employeeID=' + encodeURIComponent(this.EmployeeID) + '&';

      if (url !== undefined && orgUrl !== undefined) {
        _observableCombineLatest([
          this._proxy.request(url, RequestType.Get),
          this._proxy.request(orgUrl, RequestType.Get)
        ])
          .subscribe(([result1, result2]) => {
            this.empModel = result1.items[0];
            this.roleName = result2[0].RoleName;
          });
      }
    }

    detailBoard(data?:any){
      let paxregid='2016022409JMTGPR'; //data.BizRegID
      let paxlocid='2016022409IHUK6O';//data.BizLocID
      console.log("triggered");
      console.log(data);
      let url = this.gridUrlBase + 'campId=' + encodeURIComponent('' + this.CampID) + '&bizregid=' + encodeURIComponent('' + paxregid) + '&bizlocid=' + encodeURIComponent('' + paxlocid) +'&';
      this.baselist.setURL(url);
      this.baselist.refresh();
    }

    populateData(){
      let urlEventHDR: string = ProxyURL.getEventHdrByCampID + 'CampID=' + this.CampID +'&';
      if (urlEventHDR !== undefined) {
        this.spinnerService.show();
          this._proxy.request(urlEventHDR, RequestType.Get)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe((result) => {
            console.log(result);
            this.DocNo=result.documentNo;
            this.EventName = result.name;
          });
      }
    }

  }
