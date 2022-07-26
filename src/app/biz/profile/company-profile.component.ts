import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { EditCompanyProfileModalComponent } from './edit-company-profile.component'
import { finalize } from 'rxjs/operators';
import { Observable, combineLatest as _observableCombineLatest } from 'rxjs'
import { SupportDocumentModalComponent } from './support-document/support-document.component';
import { TermsAndConditionModalComponent } from './terms-condition/terms-and-condition-modal.component'

@Component({
    templateUrl: './company-profile.component.html',
    animations: [appModuleAnimation()]
})

export class CompanyProfileComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('editCompanyProfileModal', { static: true }) editCompanyProfileModal: EditCompanyProfileModalComponent;
    @ViewChild('supportDocumentModal', { static: true }) supportDocumentModal: SupportDocumentModalComponent;
    @ViewChild('termsAndConditionModal', { static: true}) termsAndConditionModal: TermsAndConditionModalComponent;

    inputHelper: any = {};
    dataTaxType: any[] = [];
    dataSupplierID: any[] = [];
    dataCountryID: any[] = [];
    BranchStateList: any[] = [];
    BranchCityList: any[] = [];
    stateList: any[] = [];
    cityList: any[] = [];
    isEdit = false;

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.populateData();
    }

    ngAfterViewInit(): void {

    }

     refreshData() {
        this.dataCountryID = [];
        this.stateList = [];
        this.cityList = [];
        this.BranchStateList = [];
        this.BranchStateList = []
        this.dataSupplierID = [];
        this.dataTaxType = [];
        this.populateData();
    }

    populateData(): void {
        let url = ProxyURL.GetProfileBusiness + 'bizregid=' + this.appStorage.bizRegID + '&';
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(()=> {
            this.populateTaxType();
        }))
        .subscribe((result)=> {
            this.inputHelper = result;
            //console.log("Result:"+JSON.stringify(result))
            //console.log(this.inputHelper);
        });
    }

    populateTaxType(): void {
        this.spinnerService.show();
        let url = ProxyURL.GetCodeMasterCombo + 'code=TOT&';
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
            this.populateSupplierID();
        }))
        .subscribe(result => {
            this.dataTaxType = result;
        });
    }

    populateSupplierID(): void {
        let url = ProxyURL.GetCodeMasterCombo + 'code=KAS&';
        this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
            this.populateCountryID();
        }))
        .subscribe(result => {
            this.dataSupplierID = result;
        });
    }

    populateCountryID(): void {
    let url = ProxyURL.GetCountryCombo;
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(()=>{
        setTimeout(() => {
            this.getStateList();
        })
    }))
    .subscribe(result => {
        //console.log(result);
        this.dataCountryID = result;
    });
    }

    getStateList(): void{
    this.spinnerService.show();
    let cityURL = ProxyURL.GetState + "countryCode=" + this.inputHelper.Country + '&';
    this._proxy.request(cityURL, RequestType.Get)
        .pipe(finalize(() => {
        setTimeout(() => {
            if (this.stateList.filter(x => x.Code === this.inputHelper.State) == undefined
            || this.stateList.filter(x => x.Code ===  this.inputHelper.State) == null
            || this.stateList.filter(x => x.Code ===  this.inputHelper.State).length <= 0)
        {
            //console.log("MasukCompanyState1");
            this.stateList.unshift({'Code': '', 'Remark': ''});
            this.inputHelper.State = '';
            $("#companyState").val(this.inputHelper.State)
        }
        else
        {
            //console.log("MasukCompanyState2");
            $("#companyState").val(this.inputHelper.State);
        }

            if (this.BranchStateList.filter(x => x.Code === this.inputHelper.stateBl) === undefined
                    || this.BranchStateList.filter(x => x.Code === this.inputHelper.stateBl) === null
                    || this.BranchStateList.filter(x => x.Code === this.inputHelper.stateBl).length <= 0) {
                        //console.log("Masuk_StateB1_1");
                        this.BranchStateList.unshift({ 'Code': '', 'Remark':''});
                        this.inputHelper.stateBl = '';
                        $("#branchState").val(this.inputHelper.stateBl)
                    }
                else {
                    //console.log("Masuk_StateB1_2");
                        $("#branchState").val(this.inputHelper.stateBl);
                }
        },0);
        _observableCombineLatest([
            this.getCompanyCityList(),
            this.getCompanyCityList(true)
        ]);
        }))
        .subscribe(result => {
        this.stateList = result;
        this.BranchStateList = result;
        });
    }

    getCompanyCityList(isBranch: boolean = false): void{
    let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.inputHelper.Country + '&' + 'stateCode=' + (isBranch ? this.inputHelper.stateBl : this.inputHelper.State) + '&';
    this._proxy.request(cityURL, RequestType.Get)
        .pipe(finalize(() => {
        setTimeout(() => {
            if (!isBranch) {
                if (this.cityList.filter(x => x.Code === this.inputHelper.City) === undefined
                || this.cityList.filter(x => x.Code === this.inputHelper.City) === null
                || this.cityList.filter(x => x.Code === this.inputHelper.City).length <= 0) {
                    this.cityList.unshift({ 'Code': '', 'Remark':''});
                    this.inputHelper.City = '';
                    $("#companyCity").val(this.inputHelper.City)
                }
                else {
                    $("#companyCity").val(this.inputHelper.City);
                }
            } else {
                if (this.BranchCityList.filter(x => x.Code === this.inputHelper.cityBl) === undefined
                    || this.BranchCityList.filter(x => x.Code === this.inputHelper.cityBl) === null
                    || this.BranchCityList.filter(x => x.Code === this.inputHelper.cityBl).length <= 0) {
                        this.BranchCityList.unshift({ 'Code': '', 'Remark':''});
                        this.inputHelper.cityBl = '';
                        $("#branchCity").val(this.inputHelper.cityBl)
                    }
                    else {

                        $("#branchCity").val(this.inputHelper.cityBl);
                    }
                    //console.log(this.inputHelper.cityBl);
                    //console.log(JSON.stringify(this.BranchCityList));
            }
            this.spinnerService.hide();
        }, 0);
        }))
        .subscribe(result => {
        if(!isBranch) {
            this.cityList = result;
        }
        else {
            this.BranchCityList = result;
        }
        //console.log(this.BranchCityList);
        });
    }

    supportingDocs(): void{
        this.supportDocumentModal.show();
    }

    termsAndCondition(): void {
        this.termsAndConditionModal.show();
    }

    companyProfileOnEdit(): void{
        //console.log(this.inputHelper.State);
        // this.editCompanyProfileModal.show();
        this.isEdit = true;
    }

    updateCompanyProfile(): void {
        this.spinnerService.show();
        let url = ProxyURL.SaveProfileBusiness + '&mode=1&';
        let data: any = {};
        data.Profile = this.inputHelper;
        this._proxy.request(url, RequestType.Post, data)
            .pipe(finalize(() => {
                this.updateContactPerson();
            }))
            .subscribe(result => {
                if (result.success) {
                    // this.notify.success(this.l('SavedSuccessfully'));
                } else {
                    this.message.error(result.error);
                }
            });
    }

    updateContactPerson(): void {
        let data: any = {};
        data.BizRegID = this.inputHelper.BizRegID;
        data.ContactPerson = this.inputHelper.ContactPerson;
        data.ICNo = this.inputHelper.ICNo;
        data.ContactPersonEmail = this.inputHelper.ContactPersonEmail;
        data.ContactPersonMobile = this.inputHelper.ContactPersonMobile;
        data.WCAddress1 = this.inputHelper.AddressBl1;
        data.WCAddress2 = this.inputHelper.AddressBl2;
        data.WCAddress3 = this.inputHelper.AddressBl3;
        data.State = this.inputHelper.stateBl;
        data.City = this.inputHelper.cityBl;
        data.PostalCode = this.inputHelper.PostalCodeBl;

        this.spinnerService.show();
        let url = ProxyURL.SaveBizContactPerson + '&mode=1&';
        this._proxy.request(url, RequestType.Post, data)
        .pipe(finalize(() => {
            this.spinnerService.hide();
            this.isEdit = false;
        }))
        .subscribe(result => {
            if (result.success) {
                this.notify.success(this.l('SavedSuccessfully'));
            } else {
                this.message.error(result.error);
            }
        });
    }
}
