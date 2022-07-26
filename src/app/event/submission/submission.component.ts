import { result } from 'lodash';
import { request } from 'http';
import { Component, Injector, ViewChild, ViewEncapsulation, OnInit, Input, AfterViewInit } from '@angular/core';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { AppConsts } from '@shared/AppConsts';
import { TenderCont, PaxRegPaxLog } from '@shared/AppEnums';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { FileDownloadService } from '@shared/utils/file-download.service';
// import * as jsPDF from 'jspdf';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

//import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class SubmissionComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('participantgrid', { static: false }) participantgrid: BaseListComponent;
  @Input() campID = '';

  docCode = '';
  
  gridUrl = ProxyURL.GetParticipantSubmissionList;
  eventID: string;
  eventName: string;
  data: any = {};
  datas: any[] = [];
  onProgress = 0;
  pending = 0;
  inProgress = 0;
  submitted = 0;
  urlEventStatus = ProxyURL.GetEventStatus;
  currentEventStatus = '';
  disabledButton = false;
  eventMode = '';
  params: any;
  

  constructor(
    injector: Injector,
    private location: Location,
    private _activatedRoute: ActivatedRoute,
    private _route: Router,
    private _proxy: GenericServiceProxy,
    private _storage: AppStorage,
    private _tenderCont: TenderCont,
    private _paxRegPaxLoc: PaxRegPaxLog,
    private _fileDownloadService: FileDownloadService,
  ) {
    super(injector);

  }

  ngOnInit() {
    this.checkCont();


    this.docCode = AppConsts.parentId;
    this.campID = this._tenderCont.Items['CampID'];
    this.eventID = this._tenderCont.Items['CampID'];
    this.eventName = this._tenderCont.Items['Name'];

    this.gridUrl = ProxyURL.GetParticipantSubmissionList + 'campid=' + this.campID + '&';

  }

  ngAfterViewInit(): void {
    let url = ProxyURL.GetCounterSubmissionList + 'campid=' + this.campID + '&';
    this._proxy.request(url, RequestType.Get)
    .subscribe((result) => {
      
      this.pending = result['Pending'];
      this.inProgress = result['InProgress'];
      this.submitted = result['Completed'];
    });
}

  checkCont() {
    if (this._tenderCont.Items['CampID'] === undefined || this._paxRegPaxLoc.PaxRegID === null) {
      this.location.back();
    }
  }

  back(): void {
    this._route.navigate(['/app/event']);
}

  refresh(): void {
    let url = ProxyURL.GetParticipantSubmissionList + 'campid=' + this.campID + '&';
    this.participantgrid.setURL(url);
    this.participantgrid.refresh();
  }

  detailSubmission(data?: any) {
    let params = {
      campid: this.campID,
      transNo: data.PONo,
      paxRegID: data.VendorID,
      paxLocID: data.BizLocID,
    };

    //this._route.navigate(['/app/event/submission/submission-detail/'+this.campID]);
    this._route.navigate(['/app/event/submission/submission-detail'], { queryParams: params, skipLocationChange: true });
  }

  exportToExcel() {
    this.spinnerService.show();
    let url = ProxyURL.GetParticipantSubmissionList + 'campID=' + this.campID + '&Function=2&';
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(() => {
      this.spinnerService.hide();
      finalize(() => this.notify.info(this.l('DownloadingFile')));
    }))
      .subscribe(result => {
        this._fileDownloadService.downloadTempFile(result);
      });
  }


  printPDF() {
      let url = ProxyURL.GetParticipantSubmissionList + 'campID=' + this.campID + '&Function=2&IsPdf=1&' + 'SkipCount=0&MaxResultCount=0&';
      this._proxy.request(url, RequestType.Get)
      .pipe(finalize(() => {
        this.spinnerService.hide();
        finalize(() => this.notify.info(this.l('DownloadingFile')));
      }))
        .subscribe(result => {
          this.params = result;

          // let jsPDF = require('jspdf'); require('jspdf-autotable');
      let doc = new jsPDF('landscape','mm','a4');
      let rows = [];
      let no = 1;
        
      this.params.items.forEach(element => {
          let temp = [
              no++,
              element.Vendor,
              element.POno,
              element.Category,
              element.ServiceA230,
              element.SupplyB175,
              element.TenderC220,
              element.BuyerD300,
              element.HSEE75,
              element.Total,
              
          ];
          rows.push(temp);
      });

      const addHeaders = doc => {
          let pageCount = doc.internal.getNumberOfPages();
          for(let i = 0; i < pageCount; i++){
              doc.setPage(i);
              doc.text(45,15,"Event Submission"); //x,y
              doc.setFontSize(12);
              doc.text(45,20,"ID : "+this.campID); //x,y
              doc.text(45,25,"Name : "+this.eventName); //x,y
          }
      };

      const addFooters = doc => {
          let pageCount = doc.internal.getNumberOfPages();
          for(let i = 0; i <= pageCount; i++){
              doc.setPage(i);
              doc.text(1889,570,doc.internal.getCurrentPageInfo().pageNumber + "/" + pageCount); //x,y
          }
      };
      //@ts-ignore
      doc.autoTable ({
          theme: 'grid',
          showHead: 'everyPage',
          startY:35,
          columnStyles: {
              0: {cellWidth: 10, halign: 'left'}, //no
              1: {cellWidth: 30, halign: 'left'}, //vendor
              2: {cellWidth: 30, halign: 'left'}, //pono
              3: {cellWidth: 20, halign: 'left'}, //category
              4: {cellWidth: 30, halign: 'left'}, //ServiceA230
              5: {cellWidth: 30, halign: 'left'}, //SupplyB175
              6: {cellWidth: 30, halign: 'left'}, //TenderC220
              7: {cellWidth: 30, halign: 'left'}, //BuyerD300
              8: {cellWidth: 30, halign: 'left'}, //HSEE75
              9: {cellWidth: 20, halign: 'left'}, //Total
          
          },
          head: [['No','PO Number','Vendor','Category','Service A','Supply B','Tender C','Buyer D','HSE E','Total'  
      ]],
          body: rows
      });

      addHeaders(doc);

      addFooters(doc);

      doc.save("Event Submission_"+this.campID+".pdf")
  })
      //this._route.navigateByUrl('/app/report/digitalReport');
  }


}
