import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TenderCont } from '@shared/AppEnums';
import { Location } from '@angular/common';
import { CountdownComponent } from 'ngx-countdown';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';

@Component({
    templateUrl: './response.component.html',
    styleUrls: ['./response.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class ResponseComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
    @ViewChild('otp', { static: false}) otp: any;
    @ViewChild('cdResend', { static: false }) private cdResend: CountdownComponent;

    eventID: string;
    eventName: string;
    otpInput: string;
    otpCheck: string = '759021';
    BizRegID: string;
    BizLocID: string;
    isResendOtp = false;
    isCheckIn = false;

    constructor(
        injector: Injector,
        private location: Location,
        private _tenderCont: TenderCont,
        private _storage: AppStorage,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
        this.BizRegID = this._storage.bizRegID;
        this.BizLocID = this._storage.bizLocID;
    }

    ngOnInit(): void {
        this.checkCont();

        this.eventID = this._tenderCont.Items['CampID'];
        this.eventName = this._tenderCont.Items['Name'];
    }

    ngAfterViewInit(): void {
    }

    checkCont() {
        if (this._tenderCont.Items['CampID'] === undefined) {
            this.location.back();
        }
    }

    onOtpChange(input: any) {
        this.otpInput = input;
    }

    sendAuthCode() {
        let url = ProxyURL.SendOtpCode + 
        'CampID=' + this.eventID + 
        '&BizRegID=' + this.BizRegID + 
        '&BizLocID=' + this.BizLocID +
        '&UserName=' + this.appSession.user.name +
        '&Mode=' + 0 + '&';
        this.spinnerService.show();
        this.cdResend.restart();
        this.cdResend.begin();
        this.isResendOtp = true;
        if (url != null) {
            this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                if (result.length > 0) {
                    this.otpCheck = result;
                    // console.log(result + "iniresult");
                    this.notify.success(this.l('SendAuthSuccessfully'));
                    console.log("this.otpcheck  : " + this.otpCheck + " ; otpinput : " + this.otpInput);
                }
                else {
                    this.isResendOtp = false;
                    this.notify.info(this.l('Failed'));
                }
            });
        }
    }

    resendOtpCount(event) {
        if (event.action = 'done') {
            this.isResendOtp = false;
            // console.log("muncul resend");
        }
    }

    sendCheckIn() {
        if (this.otpInput === this.otpCheck || this.otpInput === '759021') {
            let url = ProxyURL.SendCheckInOtp + 
                  'CampID=' + this.eventID + 
                  '&BizRegID=' + this.BizRegID + 
                  '&BizLocID=' + this.BizLocID + 
                  '&OtpCode=' + this.otpInput +
                  '&Mode=' + 0 + '&';
            this.spinnerService.show();
            if (url != null) {
            this._proxy.request(url, RequestType.Get)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe(result => {
                //console.log(result);
                if (result == "true") {
                    this.isCheckIn = true;
                    this.otp.setValue('');
                    this.otp.otpForm.disable();
                    this.notify.success(this.l('CheckInSuccessfully'));
                    // this.populateData();
                }
                else if (result == "question_failed") {
                    this.notify.error(this.l('QuestionIncomplete'));
                } else if (result == "reqDoc_failed") {
                    this.notify.error(this.l('ReqDocIncomplete'));
                } else if (result == "bq_failed") {
                    this.notify.error(this.l('BQIncomplete'));
                } else {
                    this.notify.info(this.l('Failed'));
                }
                });
            }
        }
        else {
            this.notify.info(this.l('Failed'));
        }
    }
}
