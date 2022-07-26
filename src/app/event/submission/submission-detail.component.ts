import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  templateUrl: './submission-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class SubmissionDetailComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('reviewListHSE', { static: false }) reviewListHSE: BaseListComponent;
  @ViewChild('reviewListBuyer', { static: false }) reviewListBuyer: BaseListComponent;
  @ViewChild('questionBaseList', { static: false }) questionBaseList: BaseListComponent;


  gridUrlRequester = ProxyURL.GetReviewCommitteeList;
  gridUrlBuyer = ProxyURL.GetReviewCommitteeList;
  gridUrlHSE = ProxyURL.GetReviewCommitteeList;
  gridUrlDetail = ProxyURL.GetEvaluationReviewScore;
  startDate = undefined;
  endDate = undefined;
  startDateBuyers = undefined;
  endDateBuyers = undefined;
  startDateRequester = undefined;
  endDateRequester = undefined;
  selectedVendorRequester: any;
  selectedVendorBuyers: any;
  selectedVendorHSE: any;
  comboVendor: any[];
  CampID: string;
  TransNo: string;
  PaxRegID: string;
  PaxLocID: string;
  params: any;

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _route: Router,
    private _activatedRoute: ActivatedRoute,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(params => {

      this.CampID = params['campid'] ? params['campid'] : '2020051916RKSLOE';
      this.TransNo = params['transNo'];
      this.PaxRegID = params['paxRegID'];
      this.PaxLocID = params['paxLocID'];
    });

  }

  ngOnInit(): void {
    this.populateDataRequester();
    this.populateDataBuyer();
    this.populateDataHSE();
  }

  ngAfterViewInit(): void {

  }

  populateDataQuestion(data?: any) {
    console.log(data);
    let params = {
      parentid: data.EventID,
      transno: data.PONo,
      secno: data.SecNo,
      userid: data.UserID,
      paxregid: data.VendorID,
      paxlocid: data.PaxLocID
    }

    let url = ProxyURL.GetEvaluationReviewScore + 'parentid=' + encodeURIComponent(params.parentid) + '&transno=' + encodeURIComponent(params.transno) +  '&paxregid=' + encodeURIComponent(params.paxregid) + '&paxlocid=' + encodeURIComponent(params.paxlocid) + '&userid=' + encodeURIComponent(params.userid) + '&';
    if (params.secno !== undefined && params.secno !== null) {
      url += 'secno=' + encodeURIComponent(params.secno) + '&';
    }
    this.gridUrlDetail = url;
    this.questionBaseList.setURL(this.gridUrlDetail);
    this.questionBaseList.refresh();
  }

  populateDataRequester(): void {
    this.gridUrlRequester = ProxyURL.GetReviewCommitteeList + 'campID=' + this.CampID + '&transNo=' + this.TransNo + '&paxregID=' + this.PaxRegID + '&paxlocID=' + this.PaxLocID + '&mode=Review&roles=Requester&';
  }

  populateDataBuyer(): void {
    this.gridUrlBuyer = ProxyURL.GetReviewCommitteeList + 'campID=' + this.CampID + '&transNo=' + this.TransNo + '&paxregID=' + this.PaxRegID + '&paxlocID=' + this.PaxLocID + '&mode=Review&roles=Buyers&';
  }

  populateDataHSE(): void {
    this.gridUrlHSE = ProxyURL.GetReviewCommitteeList + 'campID=' + this.CampID + '&transNo=' + this.TransNo + '&paxregID=' + this.PaxRegID + '&paxlocID=' + this.PaxLocID + '&mode=Review&roles=HSE&';
  }

  refreshFilter(data?: any): void {
    this.reviewListHSE.setURL(this.setUrl());
    this.reviewListHSE.refresh();
  }

  setUrl(): string {
    let url = ProxyURL.GetReviewCommitteeList + 'campID=' + this.CampID + '&paxregID=' + this.PaxRegID + '&paxlocID=' + this.PaxLocID + '&mode=Review&roles=HSE&';
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
    let url = ProxyURL.GetReviewCommitteeList + 'campID=' + this.CampID + '&paxregID=' + this.PaxRegID + '&paxlocID=' + this.PaxLocID + '&mode=Review&roles=Buyers&';
    (this.selectedVendorBuyers != null || this.selectedVendorBuyers != undefined) ? url += 'vendorID=' + encodeURIComponent(this.selectedVendorBuyers) + '&' : 'vendorID=null&';
    (this.startDateBuyers != undefined || this.startDateBuyers != null) ? url += 'filterFrom=' + encodeURIComponent(moment(new Date(this.startDateBuyers)).format('YYYY-MM-DD')) + '&' : 'filterFrom=null&';
    (this.endDateBuyers != undefined || this.endDateBuyers != null) ? url += 'filterTo=' + encodeURIComponent(moment(new Date(this.endDateBuyers)).format('YYYY-MM-DD')) + '&' : 'filterTo=null&';
    return url;
  }

  populateAnswerCombo(): void {
    let url = ProxyURL.GetBranchRelationCombo + "relationType=1";
    this._proxy.request(url, RequestType.Get)
      .subscribe((result) => {
        this.comboVendor = result.result;
        console.log(this.comboVendor);
      })
  }


  back(){
    this._route.navigate(['/app/event/submission']);
  }

  exportToExcel() {
    this.spinnerService.show();
    let url = ProxyURL.GetParticipantSubmissionListDetail + 'campID=' + this.CampID + '&PaxRegID='+this.PaxRegID+'&TransNo='+this.TransNo+'&';
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
		this.spinnerService.show();
		let url = ProxyURL.GetParticipantSubmissionListDetail + 'campID=' + this.CampID + '&PaxRegID='+this.PaxRegID+'&TransNo='+this.TransNo+'&IsPdf=1&';
		this._proxy.request(url, RequestType.Get)
		.pipe(finalize(() => {
			this.spinnerService.hide();
			finalize(() => this.notify.info(this.l('DownloadingFile')));
		}))
		.subscribe(result => {
      this.params = result;
      let doc = new jsPDF('portrait','mm','a4');
      let rows = [];
      let no = 1;

      this.params.countains.items.forEach(element => {
        let temp = [
            element.Category,
            element.Questionnaire,
            element.Score,            
        ];
        rows.push(temp);
      });

      const addHeaders = doc => {
        let pageCount = doc.internal.getNumberOfPages();
        doc.setPage(1);
        doc.setFontSize(12);
        doc.text(15,15,this.params.header[0]); //x,y
        doc.text(15,20,this.params.header[1]); //x,y
        doc.text(15,25,this.params.header[2]); //x,y
      };

      const addFooters = doc => {
        let pageCount = doc.internal.getNumberOfPages();
        for(let i = 0; i <= pageCount; i++){
            doc.setPage(i);
            doc.text(190,290,doc.internal.getCurrentPageInfo().pageNumber + "/" + pageCount); //x,y
        }
      };

      //@ts-ignore
      doc.autoTable({
        theme: 'grid',
        showHead: 'everyPage',
        startY:30,
        columnStyles: {
            0: {cellWidth: 20, halign: 'centre'}, //category
            1: {cellWidth: 135, halign: 'centre'}, //questionnaire
            2: {cellWidth: 25, halign: 'centre'}, //score
        },
        head: [['Category','Questionnaire','Score'  
        ]],
        body: rows
      });
    
      addHeaders(doc);

      addFooters(doc);

      doc.save("Event Submission_Detail"+this.CampID+".pdf")
    });
  }
}
