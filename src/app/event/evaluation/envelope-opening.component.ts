import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CountdownComponent } from 'ngx-countdown';
import { TenderCont, CommiteRoleType, EventStatus } from '@shared/AppEnums';
import { Router, ActivatedRoute } from '@angular/router';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { Location } from '@angular/common';
import { AppConsts } from '@shared/AppConsts';
import { stringToDateWithFormat } from '@shared/helpers/DateTimeHelper';
import * as moment from 'moment';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { finalize } from 'rxjs/operators';
import { NgOtpInputComponent } from 'ng-otp-input/lib/components/ng-otp-input/ng-otp-input.component';
import { RealTimeMethod } from '@app/shared/form/real-time/real-time-method';
import { SignalRHelper } from '@shared/helpers/SignalRHelper';
import { RealTimeService } from '@app/shared/form/real-time/real-time.service';
import { Observable, combineLatest as _observableCombineLatest } from 'rxjs';

@Component({
    templateUrl: './envelope-opening.component.html',
    // styleUrls: ['./envelope-opening.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
  })

export class EnvelopeOpeningComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  @ViewChild('cdResend', { static: false }) private cdResend: CountdownComponent;
  @ViewChild('otp', { static: false}) otp: any;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
  @ViewChild('baselistTabParticipantList', { static: false }) baselistTabParticipantList: BaseListComponent;
  @ViewChild('baselistTabAttendList', { static: false }) baselistTabAttendList: BaseListComponent;
  @ViewChild('mainTabs', { static: false }) mainTabs: TabsetComponent;

  gridAttendUrl: string = undefined;
  gridParticipantUrl: string = undefined;
  campID: string;
  BizRegID: string;
  BizLocID: string;
  EmployeeID: string;
  status: number;
  cols: any;
  eventID: string;
  eventName: string;
  eventType: string;
  eventCloseDate: any;
  reviewerType: string;
  openingStatus: string = 'Incomplete';
  inEventAuthCode: string;
  eventAuthCode: string;
  reviewerData: any;

  empUrl = ProxyURL.GetEmployee;
  empOrgUnitUrl = ProxyURL.GetEmployeeByOrganizationUnit;
  empModel: any = {};
  roleName: string;

  isEventOwner = false;
  isResendOtp = false;
  isCheckIn = false;
  isDoneOpening = false;
  isCommitteeWitness = false;

  inputHelper: any = {};

  constructor(
    injector: Injector,
    private location: Location,
    private _proxy: GenericServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private _storage: AppStorage,
    private _route: Router,
    private _tenderCont: TenderCont,
    private _realTimeService: RealTimeService,
    public _zone: NgZone
  ) {
    super(injector);
    this.BizRegID = this._storage.bizRegID;
    this.BizLocID = this._storage.bizLocID;
    this.EmployeeID = this._storage.employeeID;

    this._activatedRoute.params.subscribe(params => {
      const code = params['id'] ? params['id'] : AppConsts.parentId;
      this.eventID = code;
      this.campID = this.eventID;
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // console.log("tendercont : " + JSON.stringify(this._tenderCont.Items));
    this.status = this._tenderCont.Items['IsApproved'] !== undefined ? this._tenderCont.Items['IsApproved'] : 0;
    this.campID = this._tenderCont.Items['CampID'];//'20201116X51ST6UY';//
    this.eventID = this._tenderCont.Items['CampID'];//'20201116X51ST6UY';//
    this.eventName = this._tenderCont.Items['Name'];//'MICRO PILE Contract Work 2020241';//
    this.eventType = this._tenderCont.Items['CampType']; //'EVE-01';//
    this.eventCloseDate = moment(this._tenderCont.Items['CampExpDate']).format('YYYY/MM/DD');//moment('2020-12-31 11:57:00.000').format('YYYY/MM/DD');//
    this.isDoneOpening = (this._tenderCont.Items['EventStatus'].toString() === EventStatus.PendingReview.toString()); //false;//
    this.openingStatus = (this.isDoneOpening) ? 'Complete' : 'Incomplete';
    this.populateData();
  }

  populateData() {
    this.getReviewerData();
    this.registerRealTime();
  }

  registerRealTime() {
    this.registerEvents();
    let methods = [RealTimeMethod.rtm_clobid_event_review];
    if (this.appSession.application) {
        SignalRHelper.initSignalR(() => { this._realTimeService.init(methods); });
    }
    this.registerRealtimeGroup();
  }
  
  registerEvents(): void {
      const self = this;
      abp.event.on(RealTimeMethod.rtm_clobid_event_review, (arg1: any) => {
          self._zone.run(() => {
              this.onUpdatedCheckIn(arg1);
          });
      });
  }

  registerRealtimeGroup() {
    let url = ProxyURL.RealTimeLeaveGroupSample + 
              'groupName=' + this.campID + 
              '&userIds=' + this.appSession.userId + '&';
    let inputData: any = {};
    this.spinnerService.show();
    this._proxy.request(url, RequestType.Post, inputData)
      .pipe(finalize(() => {
          url = ProxyURL.RealTimeJoinGroupSample + 
          'groupName=' + this.campID + 
          '&userIds=' + this.appSession.userId + '&';
          this._proxy.request(url, RequestType.Post, inputData)
          .pipe(finalize(() => {
              this.spinnerService.hide();
          }))
          .subscribe((result) => {
              if (result) {
                  // console.log("success join group");
              } else {
                  // console.log("failed join group");
              }
          });
      }))
      .subscribe((result) => {
          if (result) {
              // console.log("success leave group");
          } else {
              // console.log("failed leave group");
          }
      });
  }

  refreshAttendGrid(): void {
    setTimeout(() => {
      this.gridAttendUrl = ProxyURL.GetReviewerEvaluation + 'campID=' + this.campID + '&';
      this.baselistTabAttendList.setURL(this.gridAttendUrl);
      this.baselistTabAttendList.refresh();
    }, 1000);
  }

  refreshParticipantGrid(): void {
    setTimeout(() => {
      this.gridParticipantUrl = ProxyURL.GetParticipantSubmitted + 'campID=' + this.campID + '&';
      this.baselistTabParticipantList.setURL(this.gridParticipantUrl);
      this.baselistTabParticipantList.refresh();
    }, 1000);
  }

  onAttendLoadFinished() {
    if (this.isDoneOpening) {
      this.refreshParticipantGrid();
    }
  }

  getReviewerData() {
    let url = ProxyURL.GetReviewerEvaluationByUser + 
              'CampID=' + this.campID + 
              '&UserID=' + this.appSession.userId + '&';
    this.spinnerService.show();
    if (url != null) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
             this.checkOpeningStatus();
             this.spinnerService.hide();
        }))
        .subscribe(result => {
          if (result && result.items && result.items.length > 0) {
            this.reviewerData = result.items[0];
            this.reviewerType = result.items[0].ReviewerType;
            this.isCheckIn = (result.items[0].Status === 'Ready') ? true : false;
            this.isCommitteeWitness = (result.items[0].IsReq === 1) ? true : false;
            this.refreshAttendGrid();
            if (this.isCheckIn) {
              setTimeout(() => {
                this.otp.setValue('');
                this.otp.otpForm.disable();
              }, 1000);
            }
          }
        });
    }
  }

  checkCont() {
    if (this._tenderCont.Items['CampID'] === undefined || this.campID === '' || this.campID === undefined || this.campID === null) {
      this.location.back();
    }
  }

  onBaseListFinished() {
    if (this.reviewerType === 'Commercial Committee') {
      if (this.baselistTabParticipantList.model.records.filter(x => x.Status === 'Away').length <= 0) {
        this.redirectReview();
      }
    } 
    else if (this.reviewerType === 'Technical Committee') {
      // console.log("data baselist : " + JSON.stringify(this.baselistTabTechnical.model.records));
      // console.log("count away data baselist : " + JSON.stringify(this.baselistTabTechnical.model.records.filter(x => x.Status === 'Away').length));
      if (this.baselistTabAttendList.model.records.filter(x => x.Status === 'Away').length <= 0) {
        this.redirectReview();
      }
    }
  }

  checkOpeningStatus() {
    // console.log("data reviewertype : " + this.reviewerType + "||" + this._tenderCont.Items['EventStatus']);
    if (this._tenderCont.Items['EventStatus'] === EventStatus.PendingReview) {
      this.redirectReview();
    }
  }

  onUpdatedCheckIn(arg1) {
    this.isDoneOpening = (arg1.toString() === EventStatus.PendingReview.toString());
    this.openingStatus = (this.isDoneOpening) ? 'Complete' : 'Incomplete';
    this.refreshAttendGrid();
    if (this.isDoneOpening) {
      this.redirectReview();
    }
  }

  redirectReview() {
    // console.log("rolename : " + this.roleName);
    // if (this.roleName === 'Buyer') { //Commercial
    //   this._route.navigate(['/app/event/commercial-review/']);
    // } else if (this.roleName === 'HSE') { //Technical
    //   this._route.navigate(['/app/event/technical-review/']);
    // }
  }

  sendAuthCode() {
    let url = ProxyURL.SendOtpCode + 
              'CampID=' + this.campID + 
              '&BizRegID=' + this.BizRegID + 
              '&BizLocID=' + this.BizLocID +
              '&UserName=' + this.appSession.user.name +
              '&Mode=' + 1 + '&';
    // console.log("user name : " + this.appSession.user.name + "|" + this.appSession.user.surname);
    this.spinnerService.show();
    this.cdResend.restart();
    this.cdResend.begin();
    this.isResendOtp = true;
    if (url != null) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
             this.spinnerService.hide();
            //  console.log("isresend otp : " + this.isResendOtp);
        }))
        .subscribe(result => {
          if (result.length > 0) {
            this.eventAuthCode = result;
            // console.log(result + "iniresult");
            this.notify.success(this.l('SendAuthSuccessfully'));
          }
          else {
            this.isResendOtp = false;
            this.notify.info(this.l('Failed'));
          }
        });
    }
  }

  sendCheckIn() {
    let url = ProxyURL.SendCheckInOtp + 
              'CampID=' + this.campID + 
              '&BizRegID=' + this.BizRegID + 
              '&BizLocID=' + this.BizLocID  + 
              '&OtpCode=' + this.inEventAuthCode  + 
              '&Mode=' + 1 + '&';
    this.spinnerService.show();
    if (url != null) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
             this.spinnerService.hide();
        }))
        .subscribe(result => {
          if (result == "true") {
            this.isCheckIn = true;
            this.otp.setValue('');
            this.otp.otpForm.disable();
            this.notify.success(this.l('CheckInSuccessfully'));
            // this.populateData();
            this.refreshAttendGrid();
          }
          else {
            this.notify.info(this.l('Failed'));
          }
        });
    }
  }

  incrementTimer(event) {
    // console.log(JSON.stringify(event));
  }

  onOtpChange(input: any) {
    this.inEventAuthCode = input;
    // console.log("otpinput : " + this.inEventAuthCode);
  }

  resendOtpCount(event) {
    if (event.action = 'done') {
      this.isResendOtp = false;
      // console.log("muncul resend");
    }
  }

}