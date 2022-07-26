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
import { TenderCont,PaxRegPaxLog } from '@shared/AppEnums';

@Component({
  templateUrl: './compliance.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class ComplianceComponent extends AppComponentBase implements OnInit, AfterViewInit {

  @ViewChild('ComplianceListComponents', { static: false }) complianceListComponents: BaseListComponent;

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
    //   this._activatedRoute.params.subscribe(params => {
    //     // let paramId=AppConsts.ParentID ? AppConsts.ParentID : '20200520142HVUAE';
    //     let paramId = '20200520142HVUAE';
    //     this.campID = params['campid'] ? params['campid'] : paramId;
    // });
  }

  ngOnInit(): void {

    
    this.campID = this._tenderCont.Items['CampID'];
    this.eventID = this._tenderCont.Items['CampID'];
    this.eventName = this._tenderCont.Items['Name'];
    this.BizRegID = this._paxRegPaxLoc.PaxRegID;//'2016022409JMTGPR';
    this.BizLocID = this._paxRegPaxLoc.PaxLocID;//'2016022409IHUK6O';
    console.log(this._paxRegPaxLoc);
    // console.log('CampID : ' + this.tempCampID);
    // console.log('CampIDx : ' + AppConsts.parentId);
    // console.log('status : ' + this.status);

    this.populateData();

  }

  populateData() {
    this.gridUrl = ProxyURL.GetQuestionnaireAnswer + 'campID=' + this.campID + '&bizreg=' + this.BizRegID + '&bizloc='+this.BizLocID+'&';
  }

  ngAfterViewInit(): void {

  }

  exportToExcel() {
    let url = ProxyURL.GetBQList + 'campID=' + this.campID + '&';
    this.__proxy.request(url, RequestType.Get)
      .pipe(
        finalize(() => this.notify.info(this.l('DownloadingFile')))
      )
      .subscribe(result => {
        this.__fileDownloadService.downloadTempFile(result);
      });
  }

}
