import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    templateUrl: './evaluation-review.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
  })

  export class EvaluationReviewComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('reviewListHSE', { static: false }) reviewListHSE: BaseListComponent;
    @ViewChild('reviewListBuyer', { static: false }) reviewListBuyer: BaseListComponent;

    gridUrlHSE: string;
    gridUrlBuyer: string;
    startDate = undefined;
    endDate = undefined;
    startDateBuyers = undefined;
    endDateBuyers = undefined;
    selectedVendorBuyers: any;
    selectedVendorHSE: any;
    comboVendor: any[];

    constructor(
      injector: Injector,
      private _proxy: GenericServiceProxy,
      private _route: Router
    ) {
      super(injector);
    }
  
  ngOnInit(): void {

    this.populateDataHSE();

    this.populateDataBuyer();

    this.populateAnswerCombo();

  }

  ngAfterViewInit(): void {
    
  }

    populateDataHSE(): void {
      this.gridUrlHSE = ProxyURL.GetReviewCommitteeList + 'mode=Review&roles=HSE&';
    }

    populateDataBuyer(): void {
      this.gridUrlBuyer = ProxyURL.GetReviewCommitteeList + 'mode=Review&roles=Buyers&';
    }

    reviewEventHSE(data: any): void {
      //console.log(data);
      let params = {
        parentid : data.EventID,
        secno : data.SecNo,
        userid : data.UserID,
        paxregid: data.VendorID,
        paxlocid: data.PaxLocID
      }
      this._route.navigate(['/app/event/evaluation-score'], { queryParams: params, skipLocationChange: true });
    }

    reviewEventBuyer(data: any): void {
      //console.log(data);
      let params = {
        parentid : data.EventID,
        secno : data.SecNo,
        userid : data.UserID,
        paxregid: data.VendorID,
        paxlocid: data.PaxLocID
      }
      this._route.navigate(['/app/event/evaluation-score'], { queryParams: params, skipLocationChange: true });
    }

    refreshFilter(data?: any): void {
      this.reviewListHSE.setURL(this.setUrl());
      this.reviewListHSE.refresh();
    }

    setUrl(): string {
      let url = ProxyURL.GetReviewCommitteeList + 'mode=Review&roles=HSE&';
      (this.selectedVendorHSE != null || this.selectedVendorHSE != undefined) ? url += 'vendorID=' + encodeURIComponent(this.selectedVendorHSE) + '&' : 'vendorID=null&';
      (this.startDate != undefined || this.startDate != null) ? url += 'filterFrom=' + encodeURIComponent(moment(new Date(this.startDate)).format('YYYY-MM-DD')) + '&' : 'filterFrom=null&';
      (this.endDate != undefined || this.endDate != null) ? url += 'filterTo=' + encodeURIComponent(moment(new Date(this.endDate)).format('YYYY-MM-DD')) + '&' : 'filterTo=null&';
      return url;
    }

    refreshFilterBuyers(data?: any): void {
      this.reviewListBuyer.setURL(this.setUrlBuyers());
      this.reviewListBuyer.refresh();
    }

    setUrlBuyers(): string {
      let url = ProxyURL.GetReviewCommitteeList + 'mode=Review&roles=Buyers&';
      (this.selectedVendorBuyers != null || this.selectedVendorBuyers != undefined) ? url += 'vendorID=' + encodeURIComponent(this.selectedVendorBuyers) + '&' : 'vendorID=null&';
      (this.startDateBuyers != undefined || this.startDateBuyers != null) ? url += 'filterFrom=' + encodeURIComponent(moment(new Date(this.startDateBuyers)).format('YYYY-MM-DD')) + '&' : 'filterFrom=null&';
      (this.endDateBuyers != undefined || this.endDateBuyers != null) ? url += 'filterTo=' + encodeURIComponent(moment(new Date(this.endDateBuyers)).format('YYYY-MM-DD')) + '&' : 'filterTo=null&';
      return url;
    }

    populateAnswerCombo(): void {
      let url = ProxyURL.GetBranchRelationCombo+"relationType=1";
          this._proxy.request(url, RequestType.Get)
          .subscribe((result) => {
              this.comboVendor = result.result;
              console.log(this.comboVendor);
          })
    }

  }
