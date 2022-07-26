import { AppConsts } from '@shared/AppConsts';
import { TenderCont, EventStatus } from '@shared/AppEnums';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Observable, combineLatest as _observableCombineLatest } from 'rxjs';
// import { get, invoke } from 'lodash';

@Component({
    templateUrl: './event-review.component.html',
    styleUrls: ['./event-review.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
  })

  export class EventReviewComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('reviewList', { static: false }) onGoingList: BaseListComponent;

    BizRegID: string;
    BizLocID: string;
    EmployeeID: string;

    gridUrl = ProxyURL.GetTenderEventList;
    counterUrl = ProxyURL.GetCountEventByStatusPeruser;
    empUrl = ProxyURL.GetEmployee;
    empOrgUnitUrl = ProxyURL.GetEmployeeByOrganizationUnit;
    empModel: any = {};

    roleName: string;
    AllRoleName: any;

    countModel: any = {
      ongoing : 0,
      pendingOpening : 0,
      onReview : 0,
      finalReview : 0
    };

    isVMS = true;

    constructor(
      injector: Injector,
      private _activatedRoute: ActivatedRoute,
      private _route: Router,
      private _proxy: GenericServiceProxy,
      private _tenderCont: TenderCont
    ) {
      super(injector);
    }

    ngOnInit(): void {
      this.BizRegID = this.appStorage.bizRegID;
      this.BizLocID = this.appStorage.bizLocID;
      this.EmployeeID = this.appStorage.employeeID;
      //console.log(this.BizRegID);
      // AppConsts.isPendingReview = '';
      //this.gridUrl += 'PaxRegID=' + this.BizRegID + '&' + 'PaxLocID=' + this.BizLocID + '&' + 'SearchAs=' + 'Committee' + '&';
      this.gridUrl += 'SearchAs=CommitteeVMS&';
      this.getEmployee();
      this.getCounter();
    }

    ngAfterViewInit(): void {
    }

    review(event?: any) {
      this._tenderCont.Items = event;
      // if (event.EventStatus === EventStatus.PendingReview) {
      //   if (jQuery.inArray("Requester",this.AllRoleName)!==-1) { //Commercial
      //     this._route.navigate(['/app/event/requester-review/']);
      //   }
      //   if (this.roleName === 'Buyers') { //Commercial
      //     this._route.navigate(['/app/event/commercial-review/']);
      //   } else if (this.roleName === 'HSE') { //Technical
      //     this._route.navigate(['/app/event/technical-review/']);
      //   }
      // } else if (event.EventStatus === EventStatus.FinalReview) {
      //   if (this.roleName === 'Tender Committee') {
      //     this._route.navigate(['/app/event/final-review/']);
      //   }
      // } else {
      //   this._route.navigate(['/app/event/envelope-opening']);
      // }

      if (jQuery.inArray("Requester",this.AllRoleName)!==-1) { //Commercial
        this._route.navigate(['/app/event/requester-review/']);
      }
      if (this.roleName === 'Buyers') { //Commercial
        this._route.navigate(['/app/event/commercial-review/']);
      } else if (this.roleName === 'HSE') { //Technical
        this._route.navigate(['/app/event/technical-review/']);
      }
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
            this.AllRoleName = result2.map(x => x.RoleName);
            
            // this.roleName = result2[0].displayName;
          });
      }
    }

    getCounter() {
      let onGoingUrl = this.counterUrl + 'EventStatus=' + encodeURIComponent(EventStatus.PendingOpening + ',' + EventStatus.PendingReview + ',' + EventStatus.FinalReview) + '&' + 'mode=CommitteVMS&';
      let pendingOpeningUrl = this.counterUrl + 'EventStatus=' + encodeURIComponent(EventStatus.PendingOpening) + '&' + 'mode=CommitteVMS&';
      let pendingReviewUrl = this.counterUrl + 'EventStatus=' + encodeURIComponent(EventStatus.PendingReview) + '&' + 'mode=CommitteVMS&';
      let finalReviewUrl = this.counterUrl + 'EventStatus=' + encodeURIComponent(EventStatus.FinalReview) + '&' + 'mode=CommitteVMS&';

      if (onGoingUrl !== undefined && pendingOpeningUrl !== undefined && pendingReviewUrl !== undefined && finalReviewUrl !== undefined) {
        _observableCombineLatest([
          this._proxy.request(onGoingUrl, RequestType.Get),
          this._proxy.request(pendingOpeningUrl, RequestType.Get),
          this._proxy.request(pendingReviewUrl, RequestType.Get),
          this._proxy.request(finalReviewUrl, RequestType.Get)
        ])
          .subscribe(([result1, result2, result3, result4]) => {
            if (result1 && result1.length > 0) {
              this.countModel.ongoing = result1[0].totalEvent;
            }
            if (result2 && result2.length > 0) {
              this.countModel.pendingOpening = result2[0].totalEvent;
            }
            if (result3 && result3.length > 0) {
              this.countModel.onReview = result3[0].totalEvent;
            }
            if (result4 && result4.length > 0) {
              this.countModel.finalReview = result4[0].totalEvent;
            }
          });
      }
    }
  }
