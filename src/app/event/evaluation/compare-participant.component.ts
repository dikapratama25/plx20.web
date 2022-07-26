import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType, encodeURIArrayComponent } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { TenderCont, PaxRegPaxLog } from '@shared/AppEnums';
import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  templateUrl: './compare-participant.component.html',
  styleUrls: ['./compare-participant.component.less'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class CompareParticipantComponent extends AppComponentBase implements OnInit, AfterViewInit {

  @ViewChild('baseList', { static: false }) baseList: BaseListComponent;
  @ViewChild('commbaseList', { static: false }) commbaseList: BaseListComponent;

  // id = '2020051916RKSLOE';
  mode = 0;
  gridUrl: string;
  cols: any;
  //#region Variable
  checkData: number;
  title: string;
  subTitle: string;
  eventName: string;
  roles: string;
  vendorName: string;
  campID: string;
  BizRegID: string;
  BizLocID: string;
  //#endregion

  inputHelper: any = {};

  isSelectLoading = false;
  selectedItems: any[];
  items: any[];

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    super(injector);
    this._activatedRoute.queryParams
        .subscribe(params => {
            //console.log(params);
            this.title = this.l('EvaluationSubmission');
            this.subTitle = this.l('EvaluationScore');
            let url = ProxyURL.GetEvaluationReviewScore + 'parentid=' + encodeURIComponent(params.parentid) + '&paxregid=' + encodeURIComponent(params.paxregid) + '&paxlocid=' + encodeURIComponent(params.paxlocid) + '&userid=' + encodeURIComponent(params.userid) + '&';
            if (params.secno !== undefined) {
              url += 'secno=' + encodeURIComponent(params.secno) + '&';
            }
            this.gridUrl = url;
        });
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  goBack() {
    this.location.back();
  }

  // populateData(data: any): void {
  //   this.spinnerService.show();
    
  //   this._proxy.request(this.gridUrl, RequestType.Get)
  //   .pipe((finalize) => 
  //   this.spinnerService.hide())
  //   .subscribe((result) =>
    
  //   ) 
  // }
}
