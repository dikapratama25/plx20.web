import { finalize } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewChild, Output, EventEmitter } from '@angular/core';
import { clone } from 'lodash';
import { Observable, combineLatest as _observableCombineLatest } from 'rxjs'

@Component({
  selector: 'editCompanyProfileModal',
  templateUrl: './edit-company-profile.component.html'
})
export class EditCompanyProfileModalComponent extends AppComponentBase {
  @ViewChild('editModal', { static: true }) modal: ModalDirective;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  modalTitle: string;

  companySelectedTaxOrganizationType: string;
  companySelectedSupplierType: string;
  companySelectedState: string;
  companySelectedCity: string;
  branchCompanySelectedState: string;
  branchCompanySelectedCity: string;

  inputHelper: any = {};
  dataTaxType: any[] = [];
  dataSupplierID: any[] = [];
  dataCountryID: any[] = [];
  BranchStateList: any[] = [];
  BranchCityList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy
  ) {
    super(injector);
    this.modalTitle = "Edit Company Profile";

  }

  async show() {
    this.active = true;
    return await new Promise(async () => {
        //this.inputHelper = clone(data);
        this.populateData();
        //this.populateCountry();
        this.modal.show();
    });
  }


  close(): void {
      this.active = false;
      this.modal.hide();
  }

  populateData(): void {
    this.spinnerService.show();
    let url = ProxyURL.GetProfileBusiness + 'bizregid=' + this.appStorage.bizRegID + '&';
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(()=>{
        setTimeout(() =>{
            this.populateTaxType();
        },0 )
    }))
    .subscribe((result)=> {
        this.inputHelper = result;
        //console.log("Result:"+JSON.stringify(result))
        //console.log(this.inputHelper);
        this.populateCountry();
    });
}

populateTaxType(): void {
    let url = ProxyURL.GetCodeMasterCombo + 'code=TOT&';
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(() => {
        if (this.inputHelper.ReqCode !== undefined
            && this.inputHelper.ReqCode !== null) {
                setTimeout(() => {
                    this.companySelectedTaxOrganizationType = this.inputHelper.ReqCode;
                    //console.log("Request Code:"+this.inputHelper.ReqCode);
                    if (this.dataTaxType.filter(x => x.Code === this.companySelectedTaxOrganizationType) == undefined
                        || this.dataTaxType.filter(x => x.Code ===  this.companySelectedTaxOrganizationType) == null
                        || this.dataTaxType.filter(x => x.Code ===  this.companySelectedTaxOrganizationType).length <= 0)
                    {
                        //console.log("MasukCompanyTaxOrganizationType1");
                        this.dataTaxType.unshift({'Code': '-', 'CodeDesc': '---- Select Tax Type ----'});
                        this.companySelectedTaxOrganizationType = '-';
                        $("#compTaxType").val(this.companySelectedTaxOrganizationType)
                    }
                    else
                    {
                        //console.log("MasukCompanyTaxOrganizationType2");
                        $("#compTaxType").val(this.companySelectedTaxOrganizationType);
                    }
                    this.populateSupplierID();
                }, 0)
            }
    }))
    .subscribe(result => {
        this.dataTaxType = result;
        //console.log(this.dataTaxType);
    });
}

populateSupplierID(): void {
    let url = ProxyURL.GetCodeMasterCombo + 'code=KAS&';
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(() => {
        if (this.inputHelper.BusinessType !== undefined
            && this.inputHelper.BusinessType !== null) {
                setTimeout(() => {
                    this.companySelectedSupplierType = this.inputHelper.BusinessType;
                    //console.log("Business Type:"+this.inputHelper.BusinessType);
                    //console.log("SupplierID"+this.dataSupplierID);
                    if (this.dataSupplierID.filter(x => x.Code === this.companySelectedSupplierType) == undefined
                        || this.dataSupplierID.filter(x => x.Code ===  this.companySelectedSupplierType) == null
                        || this.dataSupplierID.filter(x => x.Code ===  this.companySelectedSupplierType).length <= 0)
                    {
                        //console.log("MasuksupplyID1");
                        this.dataSupplierID.unshift({'Code': '-', 'CodeDesc': '---- Select Supplier Type ----'});
                        this.companySelectedSupplierType = '-';
                        $("#compSupplyID").val(this.companySelectedSupplierType)
                    }
                    else
                    {
                        //console.log("MasuksupplyID2");
                        $("#compSupplyID").val(this.companySelectedSupplierType);
                    }
                })
        }
    }))
    .subscribe(result => {
        this.dataSupplierID = result;
    });
  }

  populateCountry(): void {
    let url = ProxyURL.GetCountryCombo;
    this._proxy.request(url, RequestType.Get)
    .pipe(finalize(() => {
        if (this.inputHelper.Country !== undefined
            && this.inputHelper.Country !== null) {
                setTimeout(() => {
                    $("#compCountry").val(this.inputHelper.Country);
                }, 0);
            }
            this.getCompanyStateList()
            this.getCompanyCityList();
    }))
    .subscribe(result => {
      //console.log(result);
        this.dataCountryID = result;
    });
  }

  getCompanyStateList(): void{
    let stateURL = ProxyURL.GetState + "countryCode=" + this.inputHelper.Country + '&';

    this._proxy.request(stateURL, RequestType.Get)
      .pipe(finalize(() => {
        if (this.inputHelper.State !== undefined
            && this.inputHelper.State !== null) {
                setTimeout(() => {
                    this.companySelectedState = this.inputHelper.State;
                    if (this.stateList.filter(x => x.Code === this.companySelectedState) == undefined
                        || this.stateList.filter(x => x.Code ===  this.companySelectedState) == null
                        || this.stateList.filter(x => x.Code ===  this.companySelectedState).length <= 0)
                    {
                        //console.log("MasukCompanyState1");
                        this.stateList.unshift({'Code': '-', 'Remark': '---- Select State ----'});
                        this.companySelectedState = '-';
                        $("#compState").val(this.companySelectedState)
                    }
                    else
                    {
                        //console.log("MasukCompanyState2");
                        $("#compState").val(this.companySelectedState);
                    }

                }, 0);
            }
        this.getCompanyBranchStateList();
      }))
      .subscribe(result => {
            this.stateList = result;
      });
  }

  getCompanyBranchStateList(): void{
    let stateURL = ProxyURL.GetState + "countryCode=" + this.inputHelper.Country + '&';

    this._proxy.request(stateURL, RequestType.Get)
      .pipe(finalize(() => {
        if (this.inputHelper.stateBl !== undefined
            && this.inputHelper.stateBl !== null) {
                setTimeout(() => {
                    this.branchCompanySelectedState = this.inputHelper.stateBl;
                    if (this.BranchStateList.filter(x => x.Code === this.branchCompanySelectedState) === undefined
                    || this.BranchStateList.filter(x => x.Code === this.branchCompanySelectedState) === null
                    || this.BranchStateList.filter(x => x.Code === this.branchCompanySelectedState).length <= 0) {
                        //console.log("Masuk_StateB1_1");
                        this.BranchStateList.unshift({ 'Code': '-', 'Remark':'---- Select State ----'});
                        this.branchCompanySelectedState = '-';
                        $("#compBranchState").val(this.branchCompanySelectedState)
                    }
                else {
                    //console.log("Masuk_StateB1_2");
                    $("#compBranchState").val(this.branchCompanySelectedState);
                }
                },0);
            }
      }))
      .subscribe(result => {
            this.BranchStateList = result;
      });
  }

  getCompanyCityList(): void{
    let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.inputHelper.Country + '&' + 'stateCode=' + this.inputHelper.State + '&';

    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        if (this.inputHelper.City !== undefined && this.inputHelper.City !== null) {
            setTimeout(() => {
                this.companySelectedCity = this.inputHelper.City;
                if (this.cityList.filter(x => x.Code === this.companySelectedCity) === undefined
                || this.cityList.filter(x => x.Code === this.companySelectedCity) === null
                || this.cityList.filter(x => x.Code === this.companySelectedCity).length <= 0) {
                    this.cityList.unshift({ 'Code': '-', 'Remark':'---- Select City ----'});
                    this.companySelectedCity = '-';
                    $("#compCity").val(this.companySelectedCity)
                }
                else {
                    $("#compCity").val(this.companySelectedCity);
                }
            }, 0);
        }
        this.getCompanyBranchCityList();
      }))
      .subscribe(result => {
        this.cityList = result;
        //console.log(this.BranchCityList);
      });
  }

  getCompanyBranchCityList(): void{
    let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.inputHelper.Country + '&' + 'stateCode=' + this.inputHelper.stateBl + '&';

    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        if (this.inputHelper.cityBl !== undefined
            &&  this.inputHelper.cityBl !== null) {
                setTimeout(() => {
                    this.branchCompanySelectedCity = this.inputHelper.cityBl;
                    if (this.BranchCityList.filter(x => x.Code === this.branchCompanySelectedCity) === undefined
                    || this.BranchCityList.filter(x => x.Code === this.branchCompanySelectedCity) === null
                    || this.BranchCityList.filter(x => x.Code === this.branchCompanySelectedCity).length <= 0) {
                        this.BranchCityList.unshift({ 'Code': '-', 'Remark':'---- Select City ----'});
                        this.branchCompanySelectedCity = '-';
                        $("#compBranchCity").val(this.branchCompanySelectedCity)
                    }
                    else {

                        $("#compBranchCity").val(this.branchCompanySelectedCity);
                    }
                },0);
            }
            this.spinnerService.hide();
      }))
      .subscribe(result => {
        this.BranchCityList = result;
        //console.log(this.BranchCityList);
      });
  }

  companyTaxOrganizationTypeOnChange() {
      this.inputHelper.ReqCode = this.companySelectedTaxOrganizationType;
  }

  companySupplierTypeOnChange() {
      this.inputHelper.BusinessType = this.companySelectedSupplierType;
  }

  companyCountryComboOnChange() {
    this.getCompanyStateList();
    this.getCompanyCityList();
  }

  companyStateComboOnChange() {
      this.inputHelper.State = this.companySelectedState;
      this.getCompanyCityList();
  }

  companyCityComboOnChange() {
      this.inputHelper.City = this.companySelectedCity;
  }

  companyBranchStateComboOnChange() {
      this.inputHelper.stateBl = this.branchCompanySelectedState;
      this.getCompanyBranchCityList();
  }

  companyBranchCityComboOnChange() {
      this.inputHelper.cityBl = this.branchCompanySelectedCity;
  }

  onSubmit() {
    let urlUpdateCompany = ProxyURL.EditCompanyProfileInfo;
    let urlUpdateContact = ProxyURL.EditContactPersonInfo;
    let companyProfile = this.setCompanyProfileJSON();
    let contactPerson= this.setContactPersonJSON();
    this.inputHelper.Active = 1;
    this.inputHelper.Flag = 1;
    //console.log(companyProfile);
    //console.log(contactPerson);
    this._proxy.request(urlUpdateCompany, RequestType.Post, companyProfile)
                .subscribe((updateCompanyResult) => {
                    this.spinnerService.show();
                    if (updateCompanyResult.success) {
                        this._proxy.request(urlUpdateContact, RequestType.Post, contactPerson)
                        .pipe(finalize(() => {
                            this.spinnerService.hide();
                            this.modalSave.emit();
                            this.close();
                        }))
                        .subscribe((updateContactPerson) => {
                            if(updateContactPerson.success) {
                                this.notify.success(this.l('SavedSuccessfully'));
                            }
                            else {
                                this.message.error(updateContactPerson.error);
                            }
                        });
                    } else {
                        this.message.error(updateCompanyResult.error);
                    }
                });
}

  setContactPersonJSON() : string {
    let url = ProxyURL.GetCompanyDetail;
    url += `&bizRegID=${encodeURIComponent(this.inputHelper.BizRegID)}&bizLocID=${encodeURIComponent(this.inputHelper.BizLocID)}&`;
    url += `&type=KAS&`
    let data: any = {};
    this._proxy.request(url, RequestType.Get)
    .subscribe((result) => {
        data = result;
    });
    let contactData: any = {
        "bizregid": this.inputHelper.BizRegID,
        "companyname": this.inputHelper.CompanyName,
        "initname": data.InitName,
        "companytype": data.CompanyType,
        "regdate": data.RegDate,
        "fileno": data.FileNo,
        "refno1": data.RefNo1,
        "refno2": data.RefNo2,
        "owner": data.Owner,
        "icno": this.inputHelper.ICNo,
        "subgrp": data.SubGrp,
        "bizgrp": data.BizGrp,
        "bizcatgid": data.BizCatgID,
        "bizregtype": data.BizRegType,
        "bizregstatus": this.inputHelper.BizRegStatus,
        "commid": data.CommID,
        "industrytype": data.IndustryType,
        "businesstype": this.inputHelper.BusinessType,
        "regno": this.inputHelper.RegNo,
        "storestatus": data.StoreStatus,
        "privilegecode": data.PrivilegeCode,
        "address1": this.inputHelper.AddressBl1,
        "address2": this.inputHelper.AddressBl2,
        "address3": this.inputHelper.AddressBl3,
        "address4": data.CompanyAddress4,
        "wcaddress1": data.WCAddress1,
        "wcaddress2": data.WCAddress2,
        "wcaddress3": data.WCAddress3,
        "wcaddress4": data.WCAddress4,
        "postalcode": this.inputHelper.PostalCodeBl,
        "country": this.inputHelper.Country,
        "state": this.inputHelper.stateBl,
        "pbt": data.CompanyPBT,
        "city": this.inputHelper.cityBl,
        "area": data.CompanyArea,
        "telno": this.inputHelper.TelNo,
        "faxno": this.inputHelper.FaxNo,
        "email": this.inputHelper.Email,
        "cowebsite": data.CoWebsite,
        "contactperson": this.inputHelper.ContactPerson,
        "contactrace": data.ContactRace,
        "contactdesignation":data.ContactDesignation,
        "contactpersonemail": this.inputHelper.inputContactPersonEmail,
        "contactpersontelno": data.ContactPersonTelNo,
        "contactpersonfaxno": data.ContactPersonFaxNo,
        "contactpersonmobile": this.inputHelper.ContactPersonMobile,
        "contactperson2": this.inputHelper.ContactPerson2, //CEO
        "contactdesignation2": data.ContactDesignation2,
        "contactpersonemail2": data.ContactPersonEmail2,
        "contactpersontelno2": data.ContactPersonTelNo2,
        "contactpersonfaxno2": data.ContactPersonFaxNo2,
        "contactpersonmobile2": data.ContactPersonMobile2,
        "smsalertno": data.SMSAlertNo,
        "acctno": data.AcctNo,
        "agrno": data.AgrNo,
        "agrdate": data.AgrDate,
        "agradddate": data.AgrAddDate,
        "agrrenew": data.AgrRenew,
        "agrrenewdate": data.AgrRenewDate,
        "acctno2": data.AcctNo2,
        "agrno2": data.AgrNo2,
        "agrdate2": data.AgrDate2,
        "agradddate2": data.AgrAddDate2,
        "agrrenew2": data.AgrRenew2,
        "agrrenewdate2": data.AgrRenewDate2,
        "bankcode1": data.BankCode1,
        "bankaccount1": data.BankAccount1,
        "bankcode2": data.BankCode2,
        "bankaccount2": data.BankAccount2,
        "remark": data.Remark,
        "remark2": data.Remark2,
        "reqsupp": data.ReqSupp,
        "reqno": this.inputHelper.ReqNo,
        "reqdate": data.ReqDate,
        "reqcode": this.inputHelper.ReqCode,
        "refamount1": data.RefAmount1,
        "refamount2": data.RefAmount2,
        "istermagr": data.IsTermAgr,
        "israteagr": data.IsRateAgr,
        "imagepath": data.ImagePath,
        "mediaurl1": data.MediaUrl1,
        "mediaurl2": data.MediaUrl2,
        "mediaurl3": data.MediaUrl3,
        "approveddate": data.ApprovedDate,
        "approvedby": data.ApprovedBy,
        "isnew": data.IsNew,
        "status": data.Status,
        "biztype": data.BizType,
        "refid": this.inputHelper.RefID,
        "refno3": data.RefNo3,
        "refid2": data.SFID,
        "rowguid": data.rowguid
      }
      return contactData;
  }



  setCompanyProfileJSON(): string {
    let url = ProxyURL.GetCompanyDetail;
    url += `&bizRegID=${encodeURIComponent(this.inputHelper.BizRegID)}&bizLocID=${encodeURIComponent(this.inputHelper.BizLocID)}&`;
    url += `&type=KAS&`
    let data: any = {};
    this._proxy.request(url, RequestType.Get)
    .subscribe((result) => {
        data = result;
    });
    let companyData: any = {
        "bizregid": this.inputHelper.BizRegID,
        "companyname": this.inputHelper.CompanyName,
        "initname": data.InitName,
        "companytype": data.CompanyType,
        "regdate": data.RegDate,
        "fileno": data.FileNo,
        "refno1": data.RefNo1,
        "refno2": data.RefNo2,
        "owner": data.Owner,
        "icno": this.inputHelper.ICNo,
        "subgrp": data.SubGrp,
        "bizgrp": data.BizGrp,
        "bizcatgid": data.BizCatgID,
        "bizregtype": data.BizRegType,
        "bizregstatus": this.inputHelper.BizRegStatus,
        "commid": data.CommID,
        "industrytype": data.IndustryType,
        "businesstype": this.inputHelper.BusinessType,
        "regno": this.inputHelper.RegNo,
        "storestatus": data.StoreStatus,
        "privilegecode": data.PrivilegeCode,
        "address1": this.inputHelper.Address1,
        "address2": this.inputHelper.Address2,
        "address3": this.inputHelper.Address3,
        "address4": data.CompanyAddress4,
        "wcaddress1": data.WCAddress1,
        "wcaddress2": data.WCAddress2,
        "wcaddress3": data.WCAddress3,
        "wcaddress4": data.WCAddress4,
        "postalcode": this.inputHelper.PostalCode,
        "country": this.inputHelper.Country,
        "state": this.inputHelper.State,
        "pbt": data.CompanyPBT,
        "city": this.inputHelper.City,
        "area": data.CompanyArea,
        "telno": this.inputHelper.TelNo,
        "faxno": this.inputHelper.FaxNo,
        "email": this.inputHelper.Email,
        "cowebsite": data.CoWebsite,
        "contactperson": this.inputHelper.ContactPerson,
        "contactrace": data.ContactRace,
        "contactdesignation":data.ContactDesignation,
        "contactpersonemail": this.inputHelper.inputContactPersonEmail,
        "contactpersontelno": data.ContactPersonTelNo,
        "contactpersonfaxno": data.ContactPersonFaxNo,
        "contactpersonmobile": this.inputHelper.ContactPersonMobile,
        "contactperson2": this.inputHelper.ContactPerson2, //CEO
        "contactdesignation2": data.ContactDesignation2,
        "contactpersonemail2": data.ContactPersonEmail2,
        "contactpersontelno2": data.ContactPersonTelNo2,
        "contactpersonfaxno2": data.ContactPersonFaxNo2,
        "contactpersonmobile2": data.ContactPersonMobile2,
        "smsalertno": data.SMSAlertNo,
        "acctno": data.AcctNo,
        "agrno": data.AgrNo,
        "agrdate": data.AgrDate,
        "agradddate": data.AgrAddDate,
        "agrrenew": data.AgrRenew,
        "agrrenewdate": data.AgrRenewDate,
        "acctno2": data.AcctNo2,
        "agrno2": data.AgrNo2,
        "agrdate2": data.AgrDate2,
        "agradddate2": data.AgrAddDate2,
        "agrrenew2": data.AgrRenew2,
        "agrrenewdate2": data.AgrRenewDate2,
        "bankcode1": data.BankCode1,
        "bankaccount1": data.BankAccount1,
        "bankcode2": data.BankCode2,
        "bankaccount2": data.BankAccount2,
        "remark": data.Remark,
        "remark2": data.Remark2,
        "reqsupp": data.ReqSupp,
        "reqno": this.inputHelper.ReqNo,
        "reqdate": data.ReqDate,
        "reqcode": this.inputHelper.ReqCode,
        "refamount1": data.RefAmount1,
        "refamount2": data.RefAmount2,
        "istermagr": data.IsTermAgr,
        "israteagr": data.IsRateAgr,
        "imagepath": data.ImagePath,
        "mediaurl1": data.MediaUrl1,
        "mediaurl2": data.MediaUrl2,
        "mediaurl3": data.MediaUrl3,
        "approveddate": data.ApprovedDate,
        "approvedby": data.ApprovedBy,
        "isnew": data.IsNew,
        "status": data.Status,
        "biztype": data.BizType,
        "refid": this.inputHelper.RefID,
        "refno3": data.RefNo3,
        "refid2": data.SFID,
        "rowguid": data.rowguid
      }
    return companyData;
  }

}
