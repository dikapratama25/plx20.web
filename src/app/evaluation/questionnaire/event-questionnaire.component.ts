import { CacheDto } from './../../../shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, NgZone, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { RealTimeService } from '@app/shared/form/real-time/real-time.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { TenderCont, PaxRegPaxLog } from '@shared/AppEnums';
import { Location } from '@angular/common';
import { questionerMode } from '@app/shared/form/questionnaire/questionnaire-field.component';

@Component({
    selector: 'event-questionnaire',
    templateUrl: './event-questionnaire.component.html',
    encapsulation: ViewEncapsulation.None,
    //styleUrls: ['./event-questionnaire.component.scss'],
    animations: [appModuleAnimation()]
})
export class EventQuestionnaireComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('wizard', { static: true }) wizard: ElementRef;
    submitted = false;
    mode: questionerMode = questionerMode.preview;
    section: any = {};
    options: {
        No: number, QuizID: string, BizRegID: string, BizLocID: string,
        SecNo: number, SecDesc: string, TotalQty: number, TotalAmt: number
    }[] = [];
    // responseOptions: {
    //     No: number, QuizID: string, BizRegID: string, BizLocID: string,
    //     SecNo: number, SecDesc: string, TotalQty: number, TotalAmt: number
    // }[] = [];
    totalAnswered = 0;
    totalQuestion = 0;
    campID: string;
    questionList: any = [];
    eventName: string;
    transNo: string = '';
    paxRegID: string = '';
    paxLocID: string = '';
    responseRemark: string;
    response: any;
    showLegend=false;
    companyName:string;
    responseOptions: any = [
        { ResponseOptID: "20200925155A1DF9", ResponseText: "Not Comply", Response: 0 },
        { ResponseOptID: "2020092515C6E1F5", ResponseText: "Partially Comply", Response: 1 },
        { ResponseOptID: "2020092515DDBEEF", ResponseText: "Comply", Response: 2 }
    ]

    constructor(
        injector: Injector,
        private location: Location,
        private _proxy: GenericServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _realTimeService: RealTimeService,
        public _zone: NgZone,
        private _config: NgSelectConfig,
        private _tenderCont: TenderCont,
        private _paxRegPaxLoc: PaxRegPaxLog
    ) {
        super(injector);

        this._activatedRoute.queryParams
            .subscribe(params => {
                this.campID = params.campid;
                this.transNo = params.transno === undefined ? '' : params.transno;
                this.paxRegID = params.paxregid === undefined ? '' : params.paxregid;
                this.paxLocID = params.paxlocid === undefined ? '' : params.paxlocid;
                this.mode = params.mode !== undefined ? params.mode : 0;
            });
    }

    ngOnInit(): void {
        this.campID = (this.campID == undefined ? this._tenderCont.Items['CampID'] : this.campID);
        this.eventName = (this.eventName == undefined ? this._tenderCont.Items['Name'] : this.eventName);

        if (this.campID === undefined) {
            this.location.back();
        }

        //this.mode = (this.paxRegID != '' && this.paxRegID != undefined) ? questionerMode.survey : null;
        // this.paxRegID = (this.paxRegID != '' && this.paxRegID != undefined) ? this.paxRegID : this.appStorage.bizRegID;
        // this.paxLocID = (this.paxLocID != '' && this.paxLocID != undefined) ? this.paxLocID : this.appStorage.bizLocID;

        this.getQuestionSection();
        // else {
        //     this.message.error(this.l('PleaseSelectTender'));
        // }
    }

    ngAfterViewInit(): void {
        this.getVendorName()
    }

    init(): void {
        if (this.totalQuestion === 0) {
            this.totalQuestion = this.options.map(a => a.TotalQty).reduce(function (a, b) { return a + b; });
        }
        this.totalAnswered = this.options.map(a => a.TotalAmt).reduce(function (a, b) { return a + b; });
    }

    onPrev() {
        this.section = this.options[this.section.No - 1];
        this.getQuestion();
    }

    onNext() {
        this.section = this.options[this.section.No + 1];
        this.getQuestion();
    }

    onSelect(value: any, data: any): void {
        let item = this.questionList.find(x => x.SecNo == data.SecNo && x.GrpNo == data.GrpNo && x.SeqNo == data.SeqNo);
        item.Value = value !== undefined ? value.code : null;

        let answered = this.options[this.section.No].TotalAmt;
        let tempAnswered = this.questionList.filter(x => x.Value != null).length;

        if (value !== undefined) {
            if (tempAnswered > answered) {
                this.addTotalAmt();
            }
            this.saveQuestion(item);
        }
        else if (value === undefined) {
            this.deleteQuestion(item);
        }
    }

    addTotalAmt(): void {
        if (this.options[this.section.No].TotalAmt === this.totalQuestion) { return; }
        this.options[this.section.No].TotalAmt = this.options[this.section.No].TotalAmt + 1;
        this.init();
    }

    deductTotalAmt(): void {
        if (this.options[this.section.No].TotalAmt === 0) { return; }
        this.options[this.section.No].TotalAmt = this.options[this.section.No].TotalAmt - 1;
        this.init();
    }

    onRemarkChange(value: any, data: any): void {
    }

    onRemarkClear(data: any): void {
        let item = this.questionList.find(x => x.SecNo == data.SecNo && x.GrpNo == data.GrpNo && x.SeqNo == data.SeqNo);
        item.Remark = '';
        if (item.Value != null) {
            this.saveQuestion(item);
        }
    }

    onRemarkBlur(value: string, data: any): void {
        let item = this.questionList.find(x => x.SecNo == data.SecNo && x.GrpNo == data.GrpNo && x.SeqNo == data.SeqNo);
        if (item.Value != null && item.Remark != value) {
            item.Remark = value;
            this.saveQuestion(item);
        }
    }

    getQuestionSection() {
        this.spinnerService.show();
        let url = ProxyURL.GetQuestionnaireSection + 'campID=' + encodeURIComponent(this.campID) + '&';
        if (this.transNo !== '') { url += 'TransNo=' + encodeURIComponent('' + this.transNo) + '&'; } 
        if (this.paxRegID !== '' && this.paxLocID !== '') {
            url += 'paxRegID=' + encodeURIComponent(this.paxRegID) + '&';
            url += 'paxLocID=' + encodeURIComponent(this.paxLocID) + '&';
        }
        this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result) {
                    this.options = result;
                    this.init();

                    for (var i = 0; i < this.options.length; i++) {
                        this.options[i].No = i;
                        if (this.options[i].TotalAmt === null) {
                            this.options[i].TotalAmt = 0;
                        }
                    }

                    this.section = this.options[0];
                    this.getQuestion();
                }
            });
    }

    getQuestion() {
        this.spinnerService.show();
        let url = ProxyURL.GetQuestionnaire + 'quizID=' + encodeURIComponent(this.section.QuizID) + '&SecNo=' + this.section.SecNo + '&campID=' + encodeURIComponent(this.campID) + '&';
        if (this.transNo !== '') { url += 'TransNo=' + encodeURIComponent('' + this.transNo) + '&'; } 
        if (this.paxRegID !== '' && this.paxLocID !== '') {
            url += 'paxRegID=' + encodeURIComponent(this.paxRegID) + '&';
            url += 'paxLocID=' + encodeURIComponent(this.paxLocID) + '&';
        }
        this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result) {
                    this.questionList = result;
                    for (let i = 0; i < this.questionList.length; i++) {
                        let opt = this.questionList[i].OptValue.split("|");
                        this.questionList[i].Opt = [];
                        for (let j = 0; j < opt.length; j++) {
                            let ans = opt[j].split("#");
                            let data = {};
                            data['code'] = ans[0];
                            data['remark'] = ans[1];
                            this.questionList[i].Opt.push(data);
                        }
                    }
                }
            });
    }

    updateValue(data: any, value: number, remark: string): void {
        let item = this.questionList.find(x => x.SecNo == data.SecNo && x.GrpNo == data.GrpNo && x.SeqNo == data.SeqNo);
        if (value != undefined) {
            let tempValue = item.value;
            item.value = value;
            if (tempValue < 0 && value >= 0) {
                this.options[this.section.No].TotalAmt = this.options[this.section.No].TotalAmt + 1;
            }
            else if (tempValue >= 0 && value < 0) {
                this.options[this.section.No].TotalAmt = this.options[this.section.No].TotalAmt - 1;
            }
        }
        if (remark != undefined) {
            item.remark = remark;
        }
    }

    saveQuestionHeader(): void {
        this.spinnerService.show();
        let data: any = [];
        let dataOptions: any = {};
        dataOptions = this.section;
        dataOptions.TransNo = (this.transNo != '' && this.transNo != undefined) ? this.transNo : '';
        dataOptions.PaxRegID = (this.paxRegID != '' && this.paxRegID != undefined) ? this.paxRegID : this.appStorage.bizRegID;
        dataOptions.PaxLocID = (this.paxLocID != '' && this.paxLocID != undefined) ? this.paxLocID : this.appStorage.bizLocID;
        dataOptions.UserID = (this.appSession.userId > 0) ? this.appSession.userId : null;
        dataOptions.ParentID = this.campID;
        data.push(dataOptions);
        //console.log(data);

        let url = ProxyURL.CreateUpdateQuestionHDR;
        this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result.success) {
                    this.notify.success(this.l('UpdateSuccessfully'));
                }
                else {
                    this.notify.error(this.l('FailedToUpdate'));
                }
            });
    }

    saveQuestion(item: any): void {
        this.spinnerService.show();
        let data: any = [];
        item.TransNo = (this.transNo != '' && this.transNo != undefined) ? this.transNo : '';
        item.PaxRegID = (this.paxRegID != '' && this.paxRegID != undefined) ? this.paxRegID : this.appStorage.bizRegID;
        item.PaxLocID = (this.paxLocID != '' && this.paxLocID != undefined) ? this.paxLocID : this.appStorage.bizLocID;
        item.UserID = (this.appSession.userId > 0) ? this.appSession.userId : null;
        item.ParentID = this.campID;
        data.push(item);

        let url = ProxyURL.CreateUpdateQuestion;
        this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result.success) {
                    this.saveQuestionHeader();
                }
                else {
                    this.notify.error(this.l('FailedToUpdate'));
                }
            });
    }

    deleteQuestion(item: any): void {
        this.spinnerService.show();
        let data: any = [];
        item.TransNo = (this.transNo != '' && this.transNo != undefined) ? this.transNo : '';
        item.PaxRegID = (this.paxRegID != '' && this.paxRegID != undefined) ? this.paxRegID : this.appStorage.bizRegID;
        item.PaxLocID = (this.paxLocID != '' && this.paxLocID != undefined) ? this.paxLocID : this.appStorage.bizLocID;
        item.ParentID = this.campID;
        data.push(item);

        let url = ProxyURL.DeleteQuestion;
        this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                this.deductTotalAmt();
                this.saveQuestionHeader();
            });
    }

    onSelectedResponse(item?: any): void {
        this.spinnerService.show();
        let data: any = [];
        let input: any = {};

        if (item != undefined) {
            input = item;
        }
        else {
            input.Response = null;
            input.ResponseOptID = '';
            input.ResponseText = '';
        }

        input.TransNo = (this.transNo != '' && this.transNo != undefined) ? this.transNo : '';
        input.PaxRegID = (this.paxRegID != '' && this.paxRegID != undefined) ? this.paxRegID : this.appStorage.bizRegID;
        input.PaxLocID = (this.paxLocID != '' && this.paxLocID != undefined) ? this.paxLocID : this.appStorage.bizLocID;
        input.ParentID = this.campID;
        input.QuizID = this.section.QuizID;
        input.BizRegID = this.appStorage.bizRegID;
        input.BizLocID = this.appStorage.bizLocID;
        input.SecNo = this.section.SecNo;
        data.push(input);

        let url = ProxyURL.SaveReview;
        this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                //console.log(result);
                if (result.success) {
                    this.notify.success(this.l('UpdateSuccessfully'));
                }
                else {
                    this.notify.error(this.l('FailedToUpdate'));
                }
            });
    }

    saveResponse(): void {
        this.spinnerService.show();
        let item: any = this.section;
        let data: any = [];
        //console.log(this.paxRegID);
        //console.log(this.appStorage.bizRegID);
        item.TransNo = (this.transNo != '' && this.transNo != undefined) ? this.transNo : '';
        item.PaxRegID = (this.paxRegID != '' && this.paxRegID != undefined) ? this.paxRegID : this.appStorage.bizRegID;
        item.PaxLocID = (this.paxLocID != '' && this.paxLocID != undefined) ? this.paxLocID : this.appStorage.bizLocID;
        item.ParentID = this.campID;
        //item.QuizID = this.section.QuizID;
        item.BizRegID = this.appStorage.bizRegID;
        item.BizLocID = this.appStorage.bizLocID;
        //item.SecNo = this.section.SecNo;
        //item.Remark = this.section
        data.push(item);

        let url = ProxyURL.SaveReview;
        this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                //console.log(result);
                if (result.success) {
                    this.notify.success(this.l('UpdateSuccessfully'));
                }
                else {
                    this.notify.error(this.l('FailedToUpdate'));
                }
            });
    }

    romanize(num: number): string {
        if (isNaN(num))
            return 'NaN';
        var digits = String(+num).split(""),
            key = ["", "c", "cc", "ccc", "cd", "d", "dc", "dcc", "dccc", "cm",
                "", "x", "xx", "xxx", "xl", "l", "lx", "lxx", "lxxx", "xc",
                "", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1).join("m") + roman;
    }

    goBack() {
        this.location.back();
    }

    getVendorName() {
    
        if(this.paxLocID!=''){
          this.showLegend=true;
          let url = ProxyURL.GetVendorDetail + 'PaxLocID=' + encodeURIComponent(this.paxLocID) + '&campID='+this.campID+'&';
          this.spinnerService.show();
          this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
              if (result) {
                this.companyName = this.paxLocID+" - "+result[0].CompanyName;
              } 
            });
        }
    
      }
}
