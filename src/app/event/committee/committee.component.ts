import { result } from 'lodash';
import { request } from 'http';
import { Component, Injector, ViewChild, ViewEncapsulation, OnInit, AfterViewInit,Input } from '@angular/core';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { CommitteeListModalComponent } from './committee-listing.component';
import { CommitteeInfoDetailModalComponent } from './committee-info-detail.component';
import { CommitteeGridComponent } from './committee-grid.component';
import { AppConsts } from '@shared/AppConsts';
import { TenderCont, PaxRegPaxLog, CommiteRoleType } from '@shared/AppEnums';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-committee',
  templateUrl: './committee.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class CommitteeComponent extends AppComponentBase implements OnInit,AfterViewInit {
  @ViewChild('committeeListModal', { static: true }) committeeListModal: CommitteeListModalComponent;
  @ViewChild('committeeInfoDetailModal', { static: true }) committeeInfoDetailModal: CommitteeInfoDetailModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
  @ViewChild('requestergrid', { static: false }) requestergrid: CommitteeGridComponent;
  @ViewChild('commercialgrid', { static: false }) commercialgrid: CommitteeGridComponent;
  @ViewChild('technicalgrid', { static: false }) technicalgrid: CommitteeGridComponent;
  @Input() campID = '';

  docCode = '';
  gridUrl: string;
  eventID: string;
  eventName: string;
  data: any = {};
  datas: any[] = [];
  requesterRole = 'Requester';//CommiteRoleType.Requester;
  technicalRole = 'HSE';//CommiteRoleType.HSE;
  commercialRole = 'Buyers';//CommiteRoleType.Buyer;
  eventMode = '';
  companyName = '';
  PaxRegID = '';
  PaxLocID = '';
  customParameter='';
  poNo='';
  selectedPaxMode: any;
  showTotal = 0;
  allowedDelete = false;

  comboPaxMode: any = [
    { Code: "1", Remark: "Service Vendor", },
    { Code: "2", Remark: "Supply Vendor" },
    { Code: "3", Remark: "Tender Winner" }
  ]

  urlEventStatus = ProxyURL.GetEventStatus;
  currentEventStatus = '';
  disabledButton = false;
  isSetRequired = false;
  isEassesment = false;
  isWithHSE = false;
  isVendorDetail = false;
  vendorDetailInfo = true;
  eventStatus: number;

  constructor(
    injector: Injector,
    private location: Location,
    private _activatedRoute: ActivatedRoute,
    private _route: Router,
    private _proxy: GenericServiceProxy,
    private _storage: AppStorage,
    private _tenderCont: TenderCont,
    private _paxRegPaxLoc: PaxRegPaxLog
  ) {
    super(injector);
    this._activatedRoute.params.subscribe(params => {
      this.PaxRegID = params['paxregid'] ? params['paxregid'] : '';
      this.PaxLocID = params['paxlocid'] ? params['paxlocid'] : '';
      this.poNo = params['pono'] ? params['pono'] : '';
    });

    if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'vendor-detail').length > 0) {
      this.isVendorDetail = true;
      this.customParameter='BizRegID='+this.PaxRegID+'&BizLocID='+this.PaxLocID+'&';
      if(this.poNo!=''){
        this.customParameter+='transNo='+this.poNo+'&';
      }
    }else{
      this.showTotal=1;
    }
    this.eventStatus = this._tenderCont.Items['EventStatus'];
    // this.campID = '20200520142HVUAE';
  }

  ngOnInit() {
    // console.log('Tender: ' + JSON.stringify(this._tenderCont.Items));
    this.checkCont();
    if (this._tenderCont.Items['CampType'].includes('EVE')) {
      this.isEassesment = true;
    }
    if (this._tenderCont.Items['TargetSaving'] === 1) {
      this.isWithHSE = true;
    }
    if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => (x === 'evaluator') || (x === 'vendor-detail')).length > 0) {
      this.eventMode = "Evaluation";
    }

    this.docCode = AppConsts.parentId;
    this.campID = this._tenderCont.Items['CampID'];
    this.eventID = this._tenderCont.Items['CampID'];
    this.eventName = this._tenderCont.Items['Name'];
    let url = this.urlEventStatus + 'campID=' + this.eventID + '&';
    this._proxy.request(url, RequestType.Get)
      .subscribe(result => {
        this.currentEventStatus = result;
        if (this.currentEventStatus != '0') {
          this.disabledButton = true;
        }
      });
  }

  ngAfterViewInit(): void {
    this.getVendorName();
  }

  checkCont() {
    if (this._tenderCont.Items['CampID'] === undefined || this._paxRegPaxLoc.PaxRegID === null) {
      this.location.back();
    }
  }

  goBack(){
    if(this.isVendorDetail){
      this._route.navigate(['/app/event/vendor']);
    }else{
      this._route.navigate(['/app/event/subscribe']);
    }
    
  }

  refresh(): void {
    let requesterUrl = ProxyURL.GetCommitteeList + 'campid=' + this.campID + '&' + 'reviewerType=' + this.requesterRole + '&getTotal='+this.showTotal+'&';
    
    
    let commercialUrl = ProxyURL.GetCommitteeList + 'campid=' + this.campID + '&' + 'reviewerType=' + this.commercialRole + '&getTotal='+this.showTotal+'&';
    
    let technicalUrl = ProxyURL.GetCommitteeList + 'campid=' + this.campID + '&' + 'reviewerType=' + this.technicalRole + '&getTotal='+this.showTotal+'&';
    if(this.poNo!=''){
      requesterUrl+="transNo="+this.poNo+"&"; 
      commercialUrl+="transNo="+this.poNo+"&"; 
      technicalUrl+="transNo="+this.poNo+"&"; 
    }
    this.requestergrid.refresh(requesterUrl);
    this.commercialgrid.refresh(commercialUrl);
    if (this.technicalgrid != undefined) {
      this.technicalgrid.refresh(technicalUrl);
    }

  }

  uploadComplete(dataResult: any): void {
    // this.committeegrid.set(dataResult);
    this.refresh();
  }

  edit(): void {

    this.committeeListModal.show(this.eventMode, this.campID, this.isWithHSE,this.PaxRegID,this.selectedPaxMode,this.poNo);
  }

  checkedData() {
    this.datas = [];

    if (this.requestergrid.checked !== null && this.requestergrid.checked.length > 0) {
      this.fillData(this.requestergrid.checked);
    }

    if (this.technicalgrid.checked !== null && this.technicalgrid.checked.length > 0) {
      this.fillData(this.technicalgrid.checked);
    }

    if (this.commercialgrid.checked !== null && this.commercialgrid.checked.length > 0) {
      this.fillData(this.commercialgrid.checked);
    }
  }

  fillData(data) {
    if (data !== null && data.length > 0) {
      data.forEach(element => {
        this.data = {};
        this.data.CampID = element.CampID;
        this.data.BizRegID = element.BizRegID;
        this.data.BizLocID = element.BizLocID;
        this.data.PaxRegID = this.PaxRegID;
        this.data.PaxLocID = this.PaxLocID;
        
        this.data.SeqNo = +element.SeqNo;
        this.data.UserID = +element.UserID;
        this.data.IsReq = element.IsReq === 0 ? 1 : 0; //(this.isSetRequired) ? 1 : 0;
        this.data.UpdateBy = this.appSession.user.userName;
        this.datas.push(this.data);
      });
    }
  }

  setAsRequired() {
    this.isSetRequired = true;
    this.checkedData();
    if (this.datas !== null && this.datas.length > 0) {
      let url = ProxyURL.InsertCommittee;
      let data = this.datas;
      // console.log("dataUpdate : " + JSON.stringify(data));
      this.message.confirm(
        this.l('CommitteeSetRequiredWarningMessage'),
        this.l('AreYouSure'),
        isConfirmed => {
          if (isConfirmed) {
            this._proxy.request(url, RequestType.Post, data)
              .pipe(finalize(() => {
                this.isSetRequired = false;
              }))
              .subscribe(result => {
                if (result.isSuccess) {
                  this.refresh();
                  this.notify.info(this.l('SavedSuccessfully'));
                } else {
                  this.notify.error(this.l('Failed'));
                }
              });
          }
        }
      );
    } else {
      this.notify.warn(this.l('PleaseSelectData'));
    }
  }

  deleteCommittee() {
    let delMessage = '';
    let url = '';
    this.checkedData();
    if ((this.datas !== null && this.datas.length > 0)) {
    let data:any;
    if(this.isVendorDetail){
      
      delMessage="DeleteAssignVendor";
       url = ProxyURL.DeleteCommitteeAssigned;
     //  url = ProxyURL.DeleteCommittee;
       data = this.datas;
     
    }else{
      delMessage = "DeleteAllAssignVendor";
       url = ProxyURL.DeleteCommittee;
       data = this.datas;
    }

      this.message.confirm(
        this.l(delMessage),
        this.l('AreYouSure'),
        isConfirmed => {
          if (isConfirmed) {
            this.spinnerService.show();
            this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
              .subscribe(result => {
                if (result.isSuccess) {
                  // this.committeegrid.remove();
                  this.refresh();
                  this.notify.info(this.l('SavedSuccessfully'));
                } else {
                  this.notify.error(this.l('Failed'));
                }
              });
          }
        }
      );
    } else {
      this.notify.warn(this.l('PleaseSelectData'));
    }


  }

  sendInvCommittee(): void {
    if (
      (this.commercialgrid.baselist.model.totalRecordsCount > 0) ||
      (this.technicalgrid.baselist.model.totalRecordsCount > 0)
    ) {
      let url = ProxyURL.SendInvitationCommittee + 'campid=' + this.campID + '&';
      let data = [];
      this._proxy.request(url, RequestType.Post, data)
        .subscribe(result => {
          if (result) {
            this.notify.info(this.l('SendInvSuccessfully'));
          } else {
            this.notify.error(this.l('Failed'));
          }
        });
    } else {
      this.notify.warn(this.l('NoData'));
    }
  }

  select(data?:any){
    this.checkedData();
    if ((this.datas !== null && this.datas.length > 0)) {
      this.allowedDelete = true;
    }else{
      this.allowedDelete = false;
    }
  }


  getVendorName() {
    
    if(this.PaxLocID!=''){
      let url = ProxyURL.GetVendorDetail + 'PaxLocID=' + encodeURIComponent(this.PaxLocID) + '&campID='+encodeURIComponent(this.campID)+'&poNO='+encodeURIComponent(this.poNo)+'&';
      this.spinnerService.show();
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => { this.spinnerService.hide(); }))
        .subscribe(result => {
          if (result) {
            
            
            this.companyName = this.poNo+" - "+this.PaxRegID+" - "+result[0].CompanyName;
            this.selectedPaxMode = result[0].PaxMode+"";
            this.customParameter='';
          } 
        });
    }

  }
  onPaxModeChange(event: any){
    
    let url = ProxyURL.ChangePaxMode;
    let data={
      campid:this.campID,
      paxlocid:this.PaxLocID,
      paxmode:this.selectedPaxMode,
      pono:this.poNo
    };
    this.spinnerService.show();
    this._proxy.request(url, RequestType.Post,data)
    .pipe(finalize(() => { this.spinnerService.hide(); }))
      .subscribe(success => {
        
        if(success){
          this.notify.info(this.l('SavedSuccessfully'));
        }
        
      });

  }

  detailParticipant(data?:any){
    
    this.committeeInfoDetailModal.show(data,this.disabledButton);
  }


}
