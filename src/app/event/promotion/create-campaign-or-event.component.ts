import { getDate } from 'ngx-bootstrap/chronos/utils/date-getters';
import { Component, AfterViewInit, OnInit, Injector } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppStorage } from "@app/shared/form/storage/app-storage.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ProxyURL } from "@shared/service-proxies/generic-service-proxies-url";
import { encodeURIArrayComponent, GenericServiceProxy, RequestType } from "@shared/service-proxies/generic-service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from "@angular/forms";
import { TenderCont } from "@shared/AppEnums";
import * as moment from 'moment';
import { result } from "lodash";
import { finalize } from "rxjs/operators";

@Component({
    selector: 'createCampaignorEventComponent',
    templateUrl: 'create-campaign-or-event.component.html',
    animations: [appModuleAnimation()],
})

export class CreateCampaignOrEventComponent extends AppComponentBase implements OnInit, AfterViewInit {

    errorDateRange = true;

    x: any;
    y: any;
    dateStart: Date;
    dateEnd: Date;
    datePlannedBidStart: Date;
    datePlannedBidEnd: Date;
    dateStartBriefing: Date;
    dateEndBriefing: Date;
    dateStartVisitation: Date;
    dateEndVisitation: Date;
    dateSaleStart: Date;
    dateSaleEnd: Date;
    mode: any;
    dataEventType: any[] = [];
    dataTestProject: any[] = [];
    dataProjectReasons: any[] = [];
    dataExecutionStrat: any[] = [];
    dataPredecProj: any[] = [];
    dataVenue: any[] = [];
    dataQuestion: any[] = [];
    dataQuestionDtl: any[] = [];
    selectedQuestion = '';
    dataPIC: any[] = [];
    inputHelper: any = {};
    dateFrom: Date; // moment(new Date()).format('YYYY-MM-DD');
    dateTo: Date; // moment(new Date()).format('YYYY-MM-DD');

    errorDate = '';
    dateRangeMsg = '';
    OfficerName = '';
    Currency = '';
    checkData: number;

    EventID: any;
    title: string;
    subTitle: string
    DocumentNo: string;
    EventType: string;
    nameTitle: any;
    Description: string;
    TestProject: any;
    BaseLanguage: string;
    Owner: string;
    ProjectReason: any;
    Commodity: string;
    BaselineSpend: any;
    ExecutionStrategy: any;
    TargetSaving: any;
    ContractDuration: any;
    campaignMinDate: Date;
    transactionMinDate: Date;
    campaignStart: Date;
    campaignEnd: Date;
    startDate: Date;
    PredecessorProject: any;
    url: string;
    preProject: any;
    statusValue: Boolean;
    withHSE: Boolean = true;
    selectQuestionItem: boolean = false;
    questionItem: any[] = [];
    isPOEvaluation: Boolean = false;

    constructor(
        injector: Injector,
        private _storage: AppStorage,
        private _activedRoute: ActivatedRoute,
        private _proxy: GenericServiceProxy,
        private _route: Router,
        private formBuilder: FormBuilder,
        private _tenderCount: TenderCont
    ) {
        super(injector);
        //Create Bidding
        if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'create').length > 0) {
            this.checkData = 0;
        } //Create Tender 
        else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'create-tender').length > 0) {
            this.checkData = 2;
        } //Edit Tender
        else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'edit-tender').length > 0) {
            this.checkData = 3;
        } //Create VendorEvaluation 
        else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'create-evaluation').length > 0) {
            this.checkData = 4;
        } //Edit VendorEvaluation
        else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'edit-evaluation').length > 0) {
            this.checkData = 5;
        } //Edit Bidding 
        else {
            this.checkData = 1;
        }
    }

    ngOnInit(): void {

        this.inputHelper.EventID = "[Auto Generated]";

        this.campaignMinDate = new Date();
        this.transactionMinDate = new Date();
        this.transactionMinDate.setDate(this.transactionMinDate.getDate() - 396);

        this.populateEventCombo();

        this.populateTestProject();

        this.populateProjectReasonsCombo();

        this.populateExecutionStratCombo();

        this.populatePredecessorProj();

        //console.log(this.checkData);

        if (this.checkData == 0) {
            this.title = this.l('EventCreation');
            this.subTitle = this.l('CreateNewBid');
        } else if (this.checkData == 1) {
            this.title = this.l('EditEvent');
            this.subTitle = this.l('EditEventDetail');
            let url = ProxyURL.GetUpdatedEvent + 'campID=' + this._tenderCount.Items['CampID'] + '&';
            this._proxy.request(url, RequestType.Get)
                .subscribe(result => {
                    //console.log(result);
                    this.inputHelper.EventID = result[0].CampID;
                    this.inputHelper.DocumentNo = result[0].DocumentNo;
                    this.inputHelper.EventType = result[0].CampType;
                    this.inputHelper.nameTitle = result[0].Name;
                    this.inputHelper.Description = result[0].Description;
                    //this.inputHelper.TestProject = result[0].?;
                    //this.inputHelper.BaseLanguage = result[0].?;
                    this.inputHelper.Owner = result[0].Owner;
                    this.inputHelper.Currency = result[0].Currency;
                    this.inputHelper.ProjectReason = result[0].CampReason;
                    this.inputHelper.Commodity = result[0].CommID;
                    this.inputHelper.BaselineSpend = result[0].BaseLineSpend;
                    this.inputHelper.ExecutionStrategy = result[0].ExecStrategy;
                    this.inputHelper.TargetSaving = result[0].TargetSaving;
                    this.inputHelper.ContractDuration = result[0].CampMonths;
                    this.dateStart = new Date(result[0].CampEffDate);
                    this.dateEnd = new Date(result[0].CampExpDate);
                    this.inputHelper.StartDate = new Date(result[0].CampEffDate);
                    this.inputHelper.EndDate = new Date(result[0].CampExpDate);
                    this.preProject = result[0].ParentID;
                    //console.log(this.preProject);
                    this.inputHelper.EventStatus = result[0].EventStatus;

                    if (this.inputHelper.EventStatus == 3) {
                        this.statusValue = true;
                    } else {
                        this.statusValue = false;
                    }
                    //console.log(this.statusValue);
                })
        } else if (this.checkData == 2) {
            this.title = this.l('EventCreation');
            this.subTitle = this.l('CreateNewTender');
        } else if (this.checkData == 4) {
            this.title = this.l('EventCreation');
            this.subTitle = this.l('CreateEvaluation');
            this.populateQuestionCombo();
        } else if (this.checkData == 5) {
            this.title = this.l('EditEvent');
            this.subTitle = this.l('EditEventDetail');
            this.populateQuestionCombo();
            let url = ProxyURL.GetUpdatedEvent + 'campID=' + this._tenderCount.Items['CampID'] + '&';
            this._proxy.request(url, RequestType.Get)
                .pipe(finalize(() => {
                    this.selectQuestionItem = true;
                    this.populateQuestionDtlCombo();
                }))
                .subscribe(result => {
                    this.inputHelper.EventID = result[0].CampID;
                    this.inputHelper.DocumentNo = result[0].DocumentNo;
                    this.inputHelper.EventType = result[0].CampType;
                    this.inputHelper.nameTitle = result[0].Name;
                    this.inputHelper.Description = result[0].Description;
                    //this.inputHelper.TestProject = result[0].?;
                    //this.inputHelper.BaseLanguage = result[0].?;
                    this.inputHelper.Owner = result[0].Owner;
                    this.inputHelper.Currency = result[0].Currency;
                    this.inputHelper.ProjectReason = result[0].CampReason;
                    this.inputHelper.Commodity = result[0].CommID;
                    this.inputHelper.BaselineSpend = result[0].BaseLineSpend;
                    this.inputHelper.ExecutionStrategy = result[0].ExecStrategy;
                    this.inputHelper.TargetSaving = result[0].TargetSaving;
                    this.withHSE = true; //result[0].TargetSaving == 1 ? true : false;
                    this.selectedQuestion = result[0].QuizID;
                    this.questionItem = JSON.parse("[" + result[0].Version + "]");
                    this.inputHelper.ContractDuration = result[0].CampMonths;
                    this.dateStart = new Date(result[0].CampEffDate);
                    this.dateEnd = new Date(result[0].CampExpDate);
                    this.inputHelper.StartDate = new Date(result[0].CampEffDate);
                    this.inputHelper.EndDate = new Date(result[0].CampExpDate);
                    this.preProject = result[0].ParentID;
                    //console.log(this.preProject);
                    this.inputHelper.EventStatus = result[0].EventStatus;
                    this.inputHelper.TransactionPercentage = result[0].CampDisc;
                    this.datePlannedBidStart = new Date(result[0].PlannedBidStartTime);
                    this.datePlannedBidEnd = new Date(result[0].PlannedBidEndTime);
                    this.inputHelper.PlannedBidStartTime = new Date(result[0].PlannedBidStartTime);
                    this.inputHelper.PlannedBidEndTime = new Date(result[0].PlannedBidEndTime);

                    if (this.inputHelper.EventStatus == 3) {
                        this.statusValue = true;
                    } else {
                        this.statusValue = false;
                    }
                    this.eventTypeChange();
                    // console.log(this.inputHelper);
                })
        }

    }

    ngAfterViewInit(): void {

    }

    checkDateFrom(data?: Date) {
        this.dateRangeCheck(data, this.dateTo, '"Date To" Must Be After "Date From"');
    }

    checkDateTo(data?: Date) {
        this.dateRangeCheck(this.dateFrom, data, '"Date To" Must Be After "Date From"');
    }

    populateQuestionCombo(): void {
        let url = ProxyURL.GetQuestionSet;
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                this.dataQuestion = result.items;
            });
    }

    populateEventCombo(): void {
        if (this.checkData == 1 || this.checkData == 0) {
            this.url = ProxyURL.GetCodeMasterCombo + 'code=EVT&coderef=EBD&';
        } else if (this.checkData == 4 || this.checkData == 5) {
            this.url = ProxyURL.GetCodeMasterCombo + 'code=EVT&coderef=EVE&';
        } else {
            this.url = ProxyURL.GetCodeMasterCombo + 'code=EVT&coderef=ETD&';
        }
        this._proxy.request(this.url, RequestType.Get)
            .subscribe(result => {
                //console.log(result);
                this.dataEventType = result;
                if (this.dataEventType.length > 0 && this.dataEventType.length < 2) {
                    this.inputHelper.EventType = this.dataEventType[0].Code;
                    this.eventTypeChange();
                }
            })
    }

    populateExecutionStratCombo(): void {
        let url = ProxyURL.GetCodeMasterCombo + 'code=STR';
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                //console.log(result);
                this.dataExecutionStrat = result;
            })
    }

    populateProjectReasonsCombo(): void {
        let url = ProxyURL.GetCodeMasterCombo + 'code=RSN';
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                //console.log(result);
                this.dataProjectReasons = result;
            })
    }

    populatePredecessorProj(): void {
        let url = ProxyURL.GetPreviousEvents;
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                //console.log(result);
                this.dataPredecProj = result;
                //console.log(this.dataPredecProj);
            })
    }

    populateTestProject(): void {
        this.dataTestProject = [{
            code: '0',
            codeDesc: 'No',
        }, {
            code: '1',
            codeDesc: 'Yes',
        }];
    }

    save(): void {
        let inputData: any = {};
        //this.spinnerService.show();

        if (this.checkData == 0) {
            //Create Bidding
            let url = ProxyURL.CreateEvent + 'type=BID&';

            inputData.CampID = "xxx";
            inputData.BizRegID = this._storage.bizRegID;
            inputData.BizLocID = this._storage.bizLocID;
            inputData.DocumentNo = this.inputHelper.DocumentNo;
            inputData.RefNo1 = 0;
            inputData.RefNo2 = 0;
            inputData.Name = this.inputHelper.nameTitle;
            inputData.Description = this.inputHelper.Description;
            inputData.ParentID = this.inputHelper.PredecessorProject;
            inputData.Owner = this.inputHelper.Owner;
            inputData.CampType = this.inputHelper.EventType;
            inputData.CampReason = this.inputHelper.ProjectReason;
            inputData.CampMonths = this.inputHelper.ContractDuration;
            inputData.CampEffDate = moment(this.inputHelper.StartDate).format("YYYY-MM-DD HH:mm");
            inputData.CampExpDate = moment(this.inputHelper.EndDate).format("YYYY-MM-DD HH:mm");
            // inputData.CampNote = "";
            // inputData.CampOrgAmt = 0;
            // inputData.CampDisc = 0;
            // inputData.TotalCampAmt = 0;
            // inputData.TotalQty = 0;
            inputData.Currency = "MYR";
            inputData.Regions = "";
            inputData.CommID = this.inputHelper.Commodity;
            inputData.ExecStrategy = this.inputHelper.ExecutionStrategy;
            inputData.Version = "";
            inputData.Template = "";
            inputData.BaselineSpend = this.inputHelper.BaselineSpend;
            inputData.TargetSaving = this.inputHelper.TargetSaving;
            inputData.ImproveBidBy = "0";
            inputData.refID = "x";
            inputData.approvalFlow = "0";
            if (this.inputHelper.StartDate > this.inputHelper.EndDate) {
                this.notify.info(this.l('PeriodDateIncorrect'));
            } else {
                //console.log(inputData)
                this._proxy.request(url, RequestType.Post, inputData)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                    }))
                    .subscribe((result) => {
                        //console.log(result);
                        if (result == "true") {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this._route.navigate(['/app/event/all']);
                        } else {
                            this.notify.error(this.l('FailedToSave'));
                        }
                    });
            }
        } else if (this.checkData == 2) {
            //Create Tender
            let url = ProxyURL.CreateEvent;

            //Temporapy Hardcode First
            inputData.QuizID = "2020100101A42EF3";
            inputData.QuizIDSuppDoc = "20200710XVXUM7";

            inputData.CampID = "xxx";
            inputData.BizRegID = this._storage.bizRegID;
            inputData.BizLocID = this._storage.bizLocID;
            inputData.DocumentNo = this.inputHelper.DocumentNo;
            inputData.CampType = this.inputHelper.EventType;
            inputData.Name = this.inputHelper.nameTitle;
            inputData.Owner = this.inputHelper.Owner;
            inputData.Currency = "MYR";
            inputData.CommID = this.inputHelper.Commodity;
            inputData.CampMonths = this.inputHelper.ContractDuration;
            inputData.CampEffDate = moment(this.inputHelper.StartDate).format("YYYY-MM-DD HH:mm");
            inputData.CampExpDate = moment(this.inputHelper.EndDate).format("YYYY-MM-DD HH:mm");
            if (this.inputHelper.StartDate > this.inputHelper.EndDate) {
                this.notify.info(this.l('PeriodDateIncorrect'));
            } else {

                // this._proxy.request(url, RequestType.Post, inputData)
                // .pipe(finalize(() => {
                //     this.spinnerService.hide();
                // }))
                // .subscribe((result) => {
                //     //console.log(result);
                //     if (result == "true") {
                //         this.notify.info(this.l('SavedSuccessfully'));
                //         this._route.navigate(['/app/event']);
                //     } else {
                //         this.notify.error(this.l('FailedToSave'));
                //     }
                // });
            }
        } else {
            //Create Evaluation
            let itemQuestion = '';
            itemQuestion = this.questionItem.toString();
            let url = ProxyURL.CreateEvent + encodeURIArrayComponent('secno', this.questionItem) + '&' + '&';
            inputData.QuizID = this.selectedQuestion;
            inputData.CampID = "xxx";
            inputData.BizRegID = this._storage.bizRegID;
            inputData.BizLocID = this._storage.bizLocID;
            inputData.DocumentNo = this.inputHelper.DocumentNo;
            inputData.CampType = this.inputHelper.EventType;
            inputData.Name = this.inputHelper.nameTitle;
            // inputData.Owner = this.inputHelper.Owner;
            inputData.Currency = "MYR";
            inputData.CommID = this.inputHelper.Commodity;
            inputData.CampMonths = this.inputHelper.ContractDuration;
            inputData.CampEffDate = moment(this.inputHelper.StartDate).format("YYYY-MM-DD HH:mm");
            inputData.CampExpDate = moment(this.inputHelper.EndDate).format("YYYY-MM-DD HH:mm");
            inputData.Version = this.questionItem.length > 0 ? itemQuestion : '';
            inputData.TargetSaving = this.withHSE ? 1 : 0;
            inputData.CampDisc = this.inputHelper.TransactionPercentage;
            inputData.PlannedBidStartTime = moment(this.inputHelper.PlannedBidStartTime).format("YYYY-MM-DD HH:mm");
            inputData.PlannedBidEndTime = moment(this.inputHelper.PlannedBidEndTime).format("YYYY-MM-DD HH:mm");
            if (this.inputHelper.StartDate > this.inputHelper.EndDate) {
                this.notify.info(this.l('PeriodDateIncorrect'));
            } else if (this.isPOEvaluation && this.inputHelper.PlannedBidStartTime > this.inputHelper.PlannedBidEndTime) {
                this.notify.info(this.l('PeriodDateIncorrect'));
            } else if (this.isPOEvaluation && (this.inputHelper.PlannedBidStartTime == undefined || this.inputHelper.PlannedBidEndTime == undefined || this.inputHelper.PlannedBidStartTime == null || this.inputHelper.PlannedBidEndTime == null)) {
                this.notify.error(this.l('FormNotComplete'));
            } else if (this.inputHelper.StartDate == undefined || this.inputHelper.EndDate == undefined || this.inputHelper.StartDate == null || this.inputHelper.EndDate == null) {
                this.notify.error(this.l('FormNotComplete'));
            } else if (this.questionItem == [] || this.questionItem.length == 0) {
                this.notify.error(this.l('FormNotComplete'));
            } else {
                this.spinnerService.show();
                this._proxy.request(url, RequestType.Post, inputData)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                    }))
                    .subscribe((result) => {
                        //console.log(result);
                        if (result == "true") {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this._route.navigate(['/app/event']);
                        } else {
                            this.notify.error(this.l('FailedToSave'));
                        }
                    });
            }
        }
    }

    dateRangeCheck(from: Date, to: Date, msg: string) {
        this.campaignMinDate = this.inputHelper.campaignStart;
        let date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDay();
        this.startDate = new Date(y, m, d + 8);
        //console.log(this.startDate);
        if (this.inputHelper.campaignEnd != null) {
            if (this.inputHelper.campaignEnd < this.inputHelper.campaignStart) {
                this.inputHelper.campaignEnd = null;
                this.inputHelper.campaignEnd = null;
            }
            else {
                this.errorDateRange = true;
            }
            //     this.paymentMinDate = this.campaignEnd;
            // }
            // if(new Date(this.campaignPaymentDate).toDateString < new Date(this.campaignEnd).toDateString){
            //     this.campaignPaymentDate = null;
            // }
        }
        if (from == undefined) {
            this.dateRangeMsg = '"Date From" must be filled';
            this.errorDateRange = true;
        }
        else if (to == undefined) {
            this.dateRangeMsg = '"Date To" must be filled';
            this.errorDateRange = true;
        }
        else if (to < from) {
            this.dateRangeMsg = msg;
            this.errorDateRange = true;
        }
        else if (to < this.inputHelper.campaignStart) {
            this.dateRangeMsg = '"Date To" must be current date + 1';
            this.errorDateRange = true;
        }
        else {
            this.dateRangeMsg = '';
            this.errorDateRange = false;
        }
        //this.message.info(this.datePipe.transform(this.dateFrom, 'yyyy/MM/dd') + ' - ' + this.datePipe.transform(this.dateTo, 'yyyy/MM/dd'));
    }

    update(): void {
        let url = ProxyURL.CreateEvent + 'mode=1&';
        let inputData: any = {};
        this.spinnerService.show();

        if (this.checkData == 1) {
            inputData.CampID = this.inputHelper.EventID;
            inputData.BizRegID = this._storage.bizRegID;
            inputData.BizLocID = this._storage.bizLocID;
            inputData.DocumentNo = this.inputHelper.DocumentNo;
            inputData.Name = this.inputHelper.nameTitle;
            inputData.Description = this.inputHelper.Description;
            inputData.ParentID = this.inputHelper.PredecessorProject;
            inputData.Owner = this.inputHelper.Owner;
            inputData.CampType = this.inputHelper.EventType;
            inputData.CampReason = this.inputHelper.ProjectReason;
            inputData.CampMonths = this.inputHelper.ContractDuration;
            inputData.CampEffDate = moment(this.inputHelper.StartDate).format("YYYY-MM-DD HH:mm");
            inputData.CampExpDate = moment(this.inputHelper.EndDate).format("YYYY-MM-DD HH:mm");
            inputData.Currency = this.inputHelper.Currency;
            inputData.CommID = this.inputHelper.Commodity;
            inputData.ExecStrategy = this.inputHelper.ExecutionStrategy;
            inputData.BaselineSpend = this.inputHelper.BaselineSpend;
            inputData.TargetSaving = this.inputHelper.TargetSaving;
            if (this.inputHelper.StartDate > this.inputHelper.EndDate) {
                this.notify.info(this.l('PeriodDateIncorrect'));
            } else {
                this._proxy.request(url, RequestType.Post, inputData)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                    }))
                    .subscribe((result) => {
                        if (result == "true") {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this._route.navigate(['/app/event/all']);
                        } else {
                            this.notify.error(this.l('FailedToSave'));
                        }
                    });
            }
        } else if (this.checkData == 5) {
            let itemQuestion = '';
            itemQuestion = this.questionItem.toString();
            inputData.QuizID = this.selectedQuestion;
            inputData.Version = this.questionItem.length > 0 ? itemQuestion : '';
            inputData.TargetSaving = this.withHSE ? 1 : 0;

            inputData.CampID = this.inputHelper.EventID;
            inputData.BizRegID = this._storage.bizRegID;
            inputData.BizLocID = this._storage.bizLocID;
            inputData.DocumentNo = this.inputHelper.DocumentNo;
            inputData.Name = this.inputHelper.nameTitle;
            inputData.Description = this.inputHelper.Description;
            inputData.ParentID = this.inputHelper.PredecessorProject;
            inputData.Owner = this.inputHelper.Owner;
            inputData.CampType = this.inputHelper.EventType;
            inputData.CampReason = this.inputHelper.ProjectReason;
            inputData.CampMonths = this.inputHelper.ContractDuration;
            inputData.CampEffDate = moment(this.inputHelper.StartDate).format("YYYY-MM-DD HH:mm");
            inputData.CampExpDate = moment(this.inputHelper.EndDate).format("YYYY-MM-DD HH:mm");
            inputData.Currency = this.inputHelper.Currency;
            inputData.CommID = this.inputHelper.Commodity;
            inputData.ExecStrategy = this.inputHelper.ExecutionStrategy;
            inputData.BaselineSpend = this.inputHelper.BaselineSpend;
            inputData.CampDisc = this.inputHelper.TransactionPercentage;
            inputData.PlannedBidStartTime = moment(this.inputHelper.PlannedBidStartTime).format("YYYY-MM-DD HH:mm");
            inputData.PlannedBidEndTime = moment(this.inputHelper.PlannedBidEndTime).format("YYYY-MM-DD HH:mm");

            url += encodeURIArrayComponent('secno', this.questionItem) + '&';
            if (this.inputHelper.StartDate > this.inputHelper.EndDate) {
                this.notify.info(this.l('PeriodDateIncorrect'));
            } else {
                this._proxy.request(url, RequestType.Post, inputData)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                    }))
                    .subscribe((result) => {
                        if (result == "true") {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this._route.navigate(['/app/event']);
                        } else {
                            this.notify.error(this.l('FailedToSave'));
                        }
                    });
            }
        } else {
            //Edit Tender
        }
    }

    back(): void {
        if (this.checkData === 5) {
            this._route.navigate(['/app/event/subscribe']);
        } else {
            this._route.navigate(['/app/event']);
        }
    }

    selectStart(data) {
        this.inputHelper.StartDate = data;
    }

    selectEnd(data) {
        this.inputHelper.EndDate = data;
    }

    selectPlannedBidStart(data) {
        this.inputHelper.PlannedBidStartTime = data;
    }

    selectPlannedBidEnd(data) {
        this.inputHelper.PlannedBidEndTime = data;
    }

    selectBriefingStart(data) {
        this.inputHelper.DateBriefingStart = data;
    }

    selectBriefingEnd(data) {
        this.inputHelper.DateBriefingEnd = data;
    }

    selectVisitationStart(data) {
        this.inputHelper.DateVisitationStart = data;
    }

    selectVisitationEnd(data) {
        this.inputHelper.DateVisitationEnd = data;
    }

    selectSaleStart(data) {
        this.inputHelper.DateSaleStart = data;
    }

    selectSaleEnd(data) {
        this.inputHelper.DateSaleEnd = data;
    }

    projectChange(data) {
        this.inputHelper.PredecessorProject = data.DocumentNo;
        //console.log(this.inputHelper.PredecessorProject );
    }

    selectHSE(data: Boolean) {
        if (data) {
            this.withHSE = false;
        } else {
            this.withHSE = true;
        }
    }

    populateQuestionDtlCombo() {
        this.spinnerService.show();
        let url = ProxyURL.GetQuestionDTL + 'quizid=' + this.selectedQuestion + '&';
        this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.dataQuestionDtl = result;
            });
    }

    populateQuestionItem(): void {
        this.questionItem = [];
        this.dataQuestionDtl = [];
        this.selectQuestionItem = true;
        this.populateQuestionDtlCombo();
    }

    eventTypeChange() {
        if (this.inputHelper.EventType === 'EVE-02') {
            this.isPOEvaluation = true;
        } else {
            this.isPOEvaluation = false;
        }
    }

}
