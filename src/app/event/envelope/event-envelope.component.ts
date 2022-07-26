import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { FileUploadComponent } from '@app/shared/form/file-upload/file-upload.component';

import { FileUpload } from 'primeng/fileupload';
import { SelectDoctypeModalComponent } from './select-doctype-modal.component';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { TenderCont, PaxRegPaxLog } from '@shared/AppEnums';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CountdownComponent } from 'ngx-countdown';

@Component({
  selector: 'event-envelope',
  templateUrl: './event-envelope.component.html',
  styleUrls: ['./event-envelope.component.less'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class EventEnvelopeComponent extends AppComponentBase implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
  @ViewChild('baselistTabA', { static: false }) baselistTabA: BaseListComponent;
  @ViewChild('baselistTabTechnical', { static: false }) baselistTabTechnical: BaseListComponent;
  @ViewChild('fileUploadInput', { static: true }) fileUploadInput: FileUploadComponent;
  @ViewChild('selectDoctypeModal', { static: true }) selectDoctypeModal: SelectDoctypeModalComponent;
  @ViewChild('mainTabs', { static: false }) mainTabs: TabsetComponent;
  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

  docCode = '';
  gridUrl: string;
  uploadUrl = ProxyURL.UploadDocEnvelopeFile;
  urlTabA = '';
  urlTabTechnical = '';//ProxyURL.GetEnvelopeRequiredDocsListTech;
  permissionDelete = 'Pages.Event.Envelope.Delete';
  accept = 'image/*, .csv, .xls, .xlsx, .doc, .docx, .pdf, .zip';
  campId = '';
  totalCommercial = 0;
  totalTechnical = 0;
  totalCommercialFilled = 0;
  totalTechnicalFilled = 0;
  DropZone = this.l('DropZone');
  eventID: string;
  eventName: string;
  bizregid: string;
  bizlocid: string;
  mode: string;
  downloadFlag = 'false';
  actionFlag = "action";
  uploadedAll = false;

  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private location: Location,
    private _route: Router,
    private _proxy: GenericServiceProxy,
    private _storage: AppStorage,
    private _httpClient: HttpClient,
    private _tenderCont: TenderCont,
    private _paxRegPaxLoc: PaxRegPaxLog
  ) {
    super(injector);

    this._activatedRoute.params.subscribe(params => {
      this.campId = AppConsts.parentId;//params['campid'] ? params['campid'] : paramId;
      this.bizregid = _storage.bizRegID;
      this.bizlocid = _storage.bizLocID;
      this.mode = params['mode'] ? params['mode'] : '0';
    });
  }

  ngOnInit() {
    this.checkCont();
    //console.log(this.mode);
    if (this.mode != '0') {
      this.bizregid = this._paxRegPaxLoc.PaxRegID; //'2016022409JMTGPR';
      this.bizlocid = this._paxRegPaxLoc.PaxLocID; //'2016022409IHUK6O';

      this.downloadFlag = 'true';
      this.actionFlag = 'none';

    }

    this.campId = AppConsts.parentId;
    this.eventID = this._tenderCont.Items['CampID'];
    this.eventName = this._tenderCont.Items['Name'];
console.log(this.campId);
    this.uploadUrl = AppConsts.remoteServiceBaseUrl + ProxyURL.UploadDocEnvelopeFile;
    this.urlTabA = ProxyURL.GetEnvelopeRequiredDocsList + 'campID=' + this.campId + '&bizreg=' + this.bizregid + '&bizloc=' + this.bizlocid + '&';
    this.urlTabTechnical = ProxyURL.GetEnvelopeRequiredDocsListTech + 'campID=' + this.campId + '&bizreg=' + this.bizregid + '&bizloc=' + this.bizlocid + '&';
    
    setTimeout(() => {
      this.populateDocrequired();

    }, 3000);


  }

  goBack(): void {
    this.location.back();
  }

  checkCont() {
    // if (this._tenderCont.Items['CampID'] === undefined || (this._paxRegPaxLoc.PaxRegID === undefined && this._paxRegPaxLoc.PaxLocID === undefined)) {
    //   this.goBack();
    // }
  }

  initTab() {
    let activeTab = this.mainTabs.tabs.findIndex(x => x.active === true);
    console.log(activeTab);
  }

  refresh() {

    this.populateDocrequired();
  }

  uploadHandlers(choosen?: any): void {

    this.spinnerService.show();
    const formData: FormData = new FormData();
    const file = choosen.fileRaw[0];
    let campID = this.campId;//'20200520142HVUAE';
    let filename =
      formData.append('file', file, file.name);
    formData.append('data', choosen.data.id);
    formData.append('campid', campID);

    console.log(choosen);
    this._httpClient
      .post<any>(this.uploadUrl, formData)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(response => {

        if (response.success) {
          this.notify.success(this.l('UploadSuccess'));

          this.refresh();
          this.refreshPartial(choosen.data);
        } else if (response.error != null) {
          this.notify.error(this.l('UploadFail'));
        }
      });
  }

  onUploadError(): void {
    this.notify.error(this.l('UploadFail'));
  }

  onBeforeSend(data: any) {
    alert("before send");
  }

  onUploadComplete(data: any) {
    alert("upload complete");
  }

  dealWithFiles(data?: any) {
    this.initTab();
    if (data.length > 0) {
      this.selectDoctypeModal.show(data, this.campId);
    }
  }

  refreshPartial(data?: any) {
    if (data.SectionDesc == "Commercial") {
      this.baselistTabA.refresh();
    } else {
      this.urlTabTechnical = ProxyURL.GetEnvelopeRequiredDocsListTech + 'campID=' + this.campId + '&bizreg=' + this.bizregid + '&bizloc=' + this.bizlocid + '&';
      this.baselistTabTechnical.setURL(this.urlTabTechnical);
      this.baselistTabTechnical.refresh();
    }
  }

  uploadHandler(data?: any) {

    console.log("handler");
    console.log(data);

  }

  delete(data: any, mode: any = 0): void {

    if (data != null) {

      if (data.DocNo != null) {
        this.message.confirm(

          this.l('DataDeleteWarningMessage', data.Description),
          this.l('AreYouSure'),
          isConfirmed => {
            if (isConfirmed) {
              let url = ProxyURL.DeleteDocEnvelopeFile + 'docNo=' + data.DocNo;
              this._proxy.request(url, RequestType.Get)
                .subscribe(result => {
                  console.log(result);
                  if (result) {
                    this.refresh();
                    this.refreshPartial(data);
                    this.notify.success(this.l('SuccessfullyDeleted'));
                  } else {
                    this.notify.error(this.l('FailedToDeleted'));
                  }
                });
            }
          }
        );
      } else {
        this.notify.error(this.l('NoFileToDeleted'));
      }
    }
  }


  populateDocrequired() {
    let url = ProxyURL.GetEnvelopeRequiredDocs + 'campID=' + this.campId + '&bizregid=' + this.bizregid + '&bizlocid=' + this.bizlocid + '&';
    //this.spinnerService.show();
    let data: any = [];
    if (url != null) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          //    this.spinnerService.hide();
        }))
        .subscribe(result => {

          if (result.length > 0) {

            let TotalDataCommercial = result.filter(x => (x.SectionDesc === 'Commercial'));
            let DataCommercialFilled = result.filter(x => (x.DocNo !== null) && (x.SectionDesc === 'Commercial'));

            let TotalDataTechnical = result.filter(x => (x.SectionDesc === 'Technical'));
            let DataTechnicalFilled = result.filter(x => (x.DocNo !== null) && (x.SectionDesc === 'Technical'));
            this.totalCommercialFilled = DataCommercialFilled.length;
            this.totalTechnicalFilled = DataTechnicalFilled.length;
            this.totalCommercial = TotalDataCommercial.length;
            this.totalTechnical = TotalDataTechnical.length;
            if (this.totalCommercial === this.totalCommercialFilled && this.totalTechnical === this.totalTechnicalFilled) {
              this.uploadedAll = true;
            } else {
              this.uploadedAll = false;
            }
          }
        });
    }
  }

  onDownloadClick(data: any): void {
    console.log(data);
    //console.log(JSON.stringify(data));
    if (data.PathRef == null || data.PathRef == '' || data.Status == 'Not Uploaded') {
      this.notify.error(this.l('DocumentUnavailable'));
    }
    else {
      let url = data.PathRef;
      url = url.replace(/\\/g, '/');
      console.log(url);
      window.open(url, '_blank');
    }
  }


}
