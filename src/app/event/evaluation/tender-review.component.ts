import { Component, Injector, Input, OnInit, AfterViewInit, Output, EventEmitter, ElementRef, ViewChild, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { CountdownComponent } from 'ngx-countdown';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { CardListComponent } from '@app/shared/form/card/card-list.component';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { RealTimeService } from '@app/shared/form/real-time/real-time.service';
import { RealTimeMethod } from '@app/shared/form/real-time/real-time-method';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { SignalRHelper } from '@shared/helpers/SignalRHelper';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';

@Component({
  templateUrl: './tender-review.component.html',
  // styleUrls: ['./tender-review.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class TenderReviewComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('cardList', { static: false }) cardList: CardListComponent;
  @ViewChild('baselist', { static: false }) baselist: BaseListComponent;

  title: string;
  subTitle: string;
  gridUrl = ProxyURL.GetParticipantTenderReview;
  mode = 0;
  CampID: string;
  gridBox: any = {};
  DocNo:string;
  EventName : string;
  gridUrlBase = ProxyURL.GetParticipantTenderReviewDtl;
  gridUrlBaseLine = ProxyURL.GetParticipantTenderReviewDtlLine;
  
  constructor(
    injector: Injector,
    private sanitizer: DomSanitizer,
    private _proxy: GenericServiceProxy,
    private _realTimeService: RealTimeService,
    private _activatedRoute: ActivatedRoute,
    public _zone: NgZone
  ) {
    super(injector);
    this._activatedRoute.params.subscribe(params => {
      this.CampID = params['campid'] ? params['campid'] : '2020051916RKSLOE';
    });
  }

  ngOnInit(): void {

  }
  refresh(): void {
    let url = this.gridUrl + 'campId=' + encodeURIComponent('' + this.CampID) + '&';
    this.cardList.setURL(url);
    this.cardList.refresh();

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

  detailBoard(data?:any){
    console.log("triggered");
    console.log(data);
    let url = this.gridUrlBase + 'campId=' + encodeURIComponent('' + this.CampID) + '&bizregid=' + encodeURIComponent('' + data.BizRegID) + '&bizlocid=' + encodeURIComponent('' + data.BizLocID) +'&';
    this.baselist.setURL(url);
    this.baselist.refresh();
  }

  ngAfterViewInit(): void {
    this.refresh();
    this.populateData();
}
}