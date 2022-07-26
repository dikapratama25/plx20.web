import { ZeroRefreshTokenService } from './../../../account/auth/zero-refresh-token.service';
import { result } from 'lodash';
import { AppStorageKey, AppStorage } from '@app/shared/form/storage/app-storage.component';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { PermissionCheckerService } from 'abp-ng2-module';
import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { RoleServiceProxy } from '@shared/service-proxies/service-proxies';
import { toISOFormat } from '@shared/helpers/DateTimeHelper';
import { finalize, tap, switchMap, concatMap, filter } from 'rxjs/operators';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BizUser } from '@app/shared/form/storage/bizuser';
import { HttpClient } from '@angular/common/http';
import { SelectDoctypeModalComponent } from './select-doctype-modal.component';
import { AppConsts } from '@shared/AppConsts';
import { AppAuthService } from '@app/shared/common/auth/app-auth.service';

@Component({
  //selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less']
})
export class ProfileComponent extends AppComponentBase implements AfterViewInit, OnInit {
  @ViewChild('mainTabs', { static: false }) mainTabs: TabsetComponent;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('regNo', { static: false }) regNo: NgSelectComponent;
  @ViewChild('fileNo', { static: false }) fileNo: NgSelectComponent;
  @ViewChild('companyState', { static: false }) companyState: NgSelectComponent;
  @ViewChild('companyCity', { static: false }) companyCity: NgSelectComponent;
  @ViewChild('branchState', { static: false }) branchState: NgSelectComponent;
  @ViewChild('branchCity', { static: false }) branchCity: NgSelectComponent;
  @ViewChild('industryKey', { static: false }) industryKey: NgSelectComponent;
  @ViewChild('role', { static: false }) role: NgSelectComponent;
  @ViewChild('selectDoctypeModal', { static: true }) selectDoctypeModal: SelectDoctypeModalComponent;
  @ViewChild('baselistTab', { static: false }) baselistTab: BaseListComponent;

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _permissionChecker: PermissionCheckerService,
    private _roleProxy: RoleServiceProxy,
    private _route: Router,
    private _storage: AppStorage,
    private _localStorageService: LocalStorageService,
    private _httpClient: HttpClient,
    private _authService: AppAuthService,
    private _refreshToken: ZeroRefreshTokenService
  ) {
    super(injector);
  }

  newTransporterUrl = ProxyURL.GetCityCombo;//GetTransporterData;
  newCompanyCityUrl = ProxyURL.GetCityCombo;

  urlSupportingDocs = ProxyURL.GetDocumentsBusiness;
  bizRegCookies: any;
  accept = 'image/*, .csv, .xls, .xlsx, .doc, .docx, .pdf, .zip';
  DropZone = this.l('DropZone');
  companyDetail: any = {};
  companyLocation: any = {};
  wasteDetails: any = {};
  newTransporterData: any = {};
  stagingHelper: any = {};
  designationCombo = [];
  packageCombo = [];
  wasteTypeCombo = [];
  industryKeyCombo = [];
  companyStateCombo = [];
  companyCityCombo = [];
  branchStateCombo = [];
  branchCityCombo = [];
  newCompanyCityCombo = [];
  selectedDesignation: any;
  selectedPackage: any;
  selectedWaste: any;
  selectedIndustryKey: any;
  selectedCompanyState: any;
  selectedCompanyCity: any;
  selectedBranchState: any;
  selectedBranchCity: any;
  companyHelper: any = {};
  inputHelper: any = {};
  wasteHelper: any = {};
  saving = false;
  pendingCAMApproval: boolean = false;
  wasteList: any = [];
  newWasteList: any = [];
  nav: number = 1;
  countryCompany: any;
  countryBranch: any;
  regNoList: any = [];//[{Code: 'N/A', Remark: 'N/A'}];

  BranchStateList: any[] = [];
  BranchCityList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  industryList: any[] = [];
  designationList: any[] = [];
  wasteDetailList: any[] = [];
  itemCodeList: any[] = [];
  dataTaxType: any[] = [];
  dataSupplierID: any[] = [];
  dataCountryID: any[] = [];
  checkTC = false;
  wasteItemName: any;
  wasteComponent: any;
  isSubmited: any = false;
  afterSubmited: any = false;
  companyStateUrl = ProxyURL.GetStateList;
  branchStateUrl = ProxyURL.GetStateList;
  companyCityUrl = ProxyURL.GetCityCombo;
  branchCityUrl = ProxyURL.GetCityCombo;
  binQty: any;
  preCustomer: boolean = false;
  comboLoaded: number = 0;
  totalCombo: number = 5;
  formStep: number = 0;
  stepOne: boolean = false;
  stepTwo: boolean = false;
  BizRegStatus: any;
  stepDetail: string;
  uploadUrl = ProxyURL.SaveDocumentsBusiness;
  totalData = 0;
  totalDataFilled = 0;
  downloadFlag = 'false';
  actionFlag = 'action';
  permissionDelete = 'Pages.Event.Envelope.Delete';
  uploadedAll = false;
  stepThree: boolean = false;
  selectCity: boolean = false;
  branchCityStatus: boolean = false;
  selectState: boolean = false;
  active: number = 0;
  flag: number = 0;
  url: string;
  updatePermission: boolean = false;
  updatePermissionContact: boolean = false;
  updatePermissionSubmit: boolean = false;
  isPreview: boolean;

  profile: any = {};
  contact: any = {};

  ngOnInit() {
    // this.active = 0;
    // this.flag = 0;

    this.getBizData();

    this.populateTaxType();

    this.populateSupplierID();

    this.populateCountryID();
  }

  get allowTC(): boolean {
    return this.isPreview ? this.setting.getBoolean('App.Entity.VendorManagement.IsRegisterPreviewTermAndConditions') : this.setting.getBoolean('App.Entity.VendorManagement.IsRegisterTermAndConditions');
  }

  get allowSupportingDoc(): boolean {
    return this.isPreview ? this.setting.getBoolean('App.Entity.VendorManagement.IsRegisterPreviewSupportingDoc') : this.setting.getBoolean('App.Entity.VendorManagement.IsRegisterSupportingDoc');
  }

  ngAfterViewInit() {

  }

  populateDocList(data?: any) {
    var quizId = this.setting.get('App.Entity.VendorManagement.RegisterSupportingDoc');

    // this.urlSupportingDocs = ProxyURL.GetBizDocuments + '&bizreg=' + this.appStorage.bizRegID + '&bizloc=' + this.appStorage.bizLocID + '&quizid=' + quizId + '&';
    this.urlSupportingDocs = ProxyURL.GetDocumentsBusiness + '&bizreg=' + this.inputHelper.BizRegID + '&bizloc=' + this.inputHelper.BizLocID + '&quizid=' + quizId + '&';
    this.baselistTab.setURL(this.urlSupportingDocs);
    this.baselistTab.refresh();
    this.populateDocrequired();
  }

  getBizData() {
    this.spinnerService.show();
    if (this.appStorage.bizRegID == null || this.appStorage.bizRegID == undefined) {
      this.url = ProxyURL.GetProfileBusiness + 'email=' + this.appSession.user.emailAddress + '&';
    } else {
      this.url = ProxyURL.GetProfileBusiness + 'bizregid=' + this.appStorage.bizRegID + '&';
    }
    this._proxy.request(this.url, RequestType.Get)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        console.log(JSON.stringify(result));
        if (result == 0 || result == null) {
          this.checkTC = false;
          this.formStep = 0;
        } else {
          this.inputHelper = result;
          //country mostly result in whitespace when get from DB so need to check validation from below code
          if (this.inputHelper.Country.trim() === "") {
            //console.log(true);
            this.inputHelper.Country = null;
          }
          this.active = this.inputHelper.Active;
          this.flag = this.inputHelper.Flag;
          this.getCompanyCityList();
          this.getStateList();
          this.getBranchCityList();

          this.checkTC = true;
          this.BizRegStatus = this.inputHelper.BizRegStatus;
          this.formStep = this.inputHelper.BizRegStatus;
          //console.log(this.formStep);
          if (this.formStep == 2) {
            this.updatePermission = true;
          } else if (this.formStep >= 3) {
            this.updatePermission = true;
            this.updatePermissionContact = true;
          } else {
            this.formStep = 1;
          }
          this.checkTC = true;
          this.nextTabTnc(0);
        }

        //check setting preview or register new
        if (this.flag == 0 && this.active == 0) {
          this.isPreview = false;
        } else {
          this.isPreview = true;
          //temporary solution when no need upload document
          this.totalDataFilled = 5;
        }
      });
  }

  setClass(num: number) {
    this.nav = num;
  }

  getNavClass(num: number) {
    let classes = num === this.nav ? 'nav-link active' : 'nav-link';
    return classes;
  }

  getContentClass(num: number) {
    let classes = num === this.nav ? 'tab-pane fadeIn active show animated kt-margin-t-20 fadeIn' : 'tab-pane fadeIn';
    return classes;
  }

  statePopulate(): void {
    let stateURL = ProxyURL.GetStateList;
    this._proxy.request(stateURL, RequestType.Get)
      .pipe(finalize(() => {
      }))
      .subscribe(result => {
        this.stateList = result;
        this.BranchStateList = result;
      });
  }


  getCompanyCityList(): void {
    this.spinnerService.show();
    let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.inputHelper.Country + '&' + 'stateCode=' + this.inputHelper.State + '&';

    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(result => {
        this.cityList = result;
        //this.BranchCityList = result;
      });
  }

  getBranchCityList(): void {
    this.spinnerService.show();
    let cityURL = ProxyURL.GetCityCombo + 'countryCode=' + this.inputHelper.Country + '&' + 'stateCode=' + this.inputHelper.stateBl + '&';

    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(result => {
        this.BranchCityList = result;
        //this.BranchCityList = result;
      });
  }


  getStateList(): void {
    this.spinnerService.show();
    let cityURL = ProxyURL.GetState + "countryCode=" + this.inputHelper.Country + '&';

    this._proxy.request(cityURL, RequestType.Get)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(result => {
        this.stateList = result;
        this.BranchStateList = result;
      });
  }

  onBranchStateChanged(): void {
    this.selectedBranchCity = '';
    this.getStateList();
  }
  saveProfile(data: number) {
    let dataBusiness: any = {};
    this.profile = {};
    this.contact = {};

    this.profile.BizRegID = this.inputHelper.BizRegID;
    this.profile.CompanyName = this.inputHelper.CompanyName;
    this.profile.ICNo = this.inputHelper.ICNo;
    this.profile.BizRegStatus = this.inputHelper.BizRegStatus;
    this.profile.BusinessType = this.inputHelper.BusinessType;
    this.profile.RegNo = this.inputHelper.RegNo;
    this.profile.Address1 = this.inputHelper.Address1;
    this.profile.Address2 = this.inputHelper.Address2;
    this.profile.Address3 = this.inputHelper.Address3;
    this.profile.PostalCode = this.inputHelper.PostalCode;
    this.profile.Country = this.inputHelper.Country;
    this.profile.State = this.inputHelper.State;
    this.profile.City = this.inputHelper.City;
    this.profile.TelNo = this.inputHelper.TelNo;
    this.profile.FaxNo = this.inputHelper.FaxNo;
    this.profile.Email = this.inputHelper.ContactPersonEmail;
    this.profile.ContactPerson = this.inputHelper.ContactPerson;
    this.profile.ContactPersonEmail = this.inputHelper.ContactPersonEmail;
    this.profile.ContactPersonMobile = this.inputHelper.ContactPersonMobile;
    this.profile.ContactPerson2 = this.inputHelper.ContactPerson2;
    this.profile.ReqNo = this.inputHelper.ReqNo;
    this.profile.ReqCode = this.inputHelper.ReqCode;
    this.profile.RefID = this.inputHelper.RefID;

    this.contact.BizRegID = this.inputHelper.BizRegID;

    dataBusiness.profile = this.profile;
    dataBusiness.contact = this.contact;
    console.log(this.inputHelper);
    console.log(dataBusiness);
    if (data == 1) {
      this.spinnerService.show();
      let url = ProxyURL.SaveProfileBusiness + '&mode=1&';

      // if (this.appStorage.bizRegID != null && this.appStorage.bizRegID != undefined) {
      //   this.inputHelper.BizRegID = this.appStorage.bizRegID;
      // }
      this._proxy.request(url, RequestType.Post, dataBusiness)
        .pipe(finalize(() => {
          this.spinnerService.hide();
        }))
        .subscribe(result => {
          if (result.success) {
            this.notify.success(this.l('SavedSuccessfully'));
          } else {
            this.message.error(result.error);
          }
        });
    } else {
      if (this.formStep >= 2) {
        this.nextTabTnc(1)
      } else {
        this.spinnerService.show();
        let url = ProxyURL.SaveProfileBusiness + '&mode=0&';
        // if (this.appStorage.bizRegID != null && this.appStorage.bizRegID != undefined) {
        //   this.inputHelper.BizRegID = this.appStorage.bizRegID;
        // }
          this._proxy.request(url, RequestType.Post, dataBusiness)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe(result => {
            if (result.success) {
              this.notify.success(this.l('SavedSuccessfully'));
              this.formStep = 2;
              this.stepOne = true;
              this.BizRegStatus = 2;
              this.updatePermission = true;
              this.nextTabTnc(1);
            } else {
              this.message.error(result.error);
            }
          });
      }
    }
  }

  saveContact(mode: number) {
    let data: any = {};
    // if (this.appStorage.bizRegID != null && this.appStorage.bizRegID != undefined) {
    //   data.BizRegID = this.appStorage.bizRegID;
    // } else {
    //   data.BizRegID = this.inputHelper.BizRegID;
    // }
    this.profile = {};
    this.contact = {};

    this.profile.BizRegID = this.inputHelper.BizRegID;

    this.contact.BizRegID = this.inputHelper.BizRegID;
    this.contact.ContactPerson = this.inputHelper.ContactPerson;
    this.contact.ICNo = this.inputHelper.ICNo;
    this.contact.ContactPersonEmail = this.inputHelper.ContactPersonEmail;
    this.contact.ContactPersonMobile = this.inputHelper.ContactPersonMobile;
    this.contact.WCAddress1 = this.inputHelper.AddressBl1;
    this.contact.WCAddress2 = this.inputHelper.AddressBl2;
    this.contact.WCAddress3 = this.inputHelper.AddressBl3;
    this.contact.State = this.inputHelper.stateBl;
    this.contact.City = this.inputHelper.cityBl;
    this.contact.PostalCode = this.inputHelper.PostalCodeBl;
    // data = this.inputHelper;
    data.profile = this.profile;
    data.contact = this.contact;
    console.log(this.inputHelper);
    console.log(data);
    if (mode == 1) {
      this.spinnerService.show();
      // let url = ProxyURL.SaveBizContactPerson + '&mode=1&';
      let url = ProxyURL.SaveProfileBusiness + '&mode=1&';
      this._proxy.request(url, RequestType.Post, data)
        .pipe(finalize(() => {
          this.spinnerService.hide();
        }))
        .subscribe(result => {
          // console.log(result);
          if (result.success) {
            this.setLocalStorage();
            this.notify.success(this.l('SavedSuccessfully'));
          } else {
            this.message.error(result.error);
          }
        });
    } else {
      if (this.formStep >= 3) {
        this.nextTabTnc(2);
      } else {
        this.spinnerService.show();
        // let url = ProxyURL.SaveBizContactPerson + '&mode=0&';
        let url = ProxyURL.SaveProfileBusiness + '&mode=0&';
        this._proxy.request(url, RequestType.Post, data)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe(result => {
            //console.log(result);
            if (result.success) {
              this.setLocalStorage();
              this.notify.success(this.l('SavedSuccessfully'));
              this.formStep = 3;
              this.stepTwo = true;
              this.BizRegStatus = 3;
              this.updatePermissionContact = true;
              this.nextTabTnc(2);
            } else {
              this.message.error(result.error);
            }
          });
      }
    }
  }


  populateState(): void {
    this.inputHelper.State = '';
    this.selectedCompanyCity = '';
    this.cityList = [];
    this.selectState = true;
    this.getStateList();
  }

  populateCity(): void {
    this.selectedCompanyCity = '';
    this.selectCity = true;
    this.getCompanyCityList();
  }

  populateCityBranch(): void {
    this.selectedBranchCity = '';
    this.branchCityStatus = true;
    this.getBranchCityList();
  }

  firstRegistration(): void {
    this.spinnerService.show();
    //let data: any = {Accepted: true};

    let url = ProxyURL.AcceptBusinessTerm;
    url += `&Accepted=true`;
    this._proxy.request(url, RequestType.Post, {})
      .pipe(finalize(() => { this.spinnerService.hide(); }))
      .subscribe((result) => {
        // console.log(result);
        if (result.success) {
          this.notify.success(this.l('SavedSuccessfully'));
          this.appStorage.set(new BizUser({
            bizRegID: result.BizRegID,
            bizLocID: result.BizLocID,
          }));
          this.getBizData();
          //console.log(this.appStorage);
        } else {
          this.message.error(result.error);
        }
      });
  }

  Submit(): void {
    this.spinnerService.show()
    let url = ProxyURL.PostProfileBusiness;
    // let data: any = {
    //   BizRegID: this.appStorage.bizRegID,
    //   BizLocID: this.appStorage.bizLocID,
    //   CurrentStep: 4
    // };
    let data: any = {
      BizRegID: this.inputHelper.BizRegID,
      BizLocID: this.inputHelper.BizLocID
    };

    this._proxy.request(url, RequestType.Post, data)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(result => {
        console.log(JSON.stringify(result));
        if (result.success) {
          this.notify.success(this.l('SavedSuccessfully'));
          this.stepThree = true;
          this.BizRegStatus = 4;
          // if (result.tenantId !== null) {
          //   abp.multiTenancy.setTenantIdCookie(result.tenantId);
            // this._refreshToken.tryAuthWithRefreshToken();
            // location.reload();
            // this._route.navigate(['app/biz/home']);
            // return;
          // }
          // location.reload();
          this.message.success(
            this.l('You have successfully saved your profile. Please relogin to continue'),
            this.l('SavedSuccessfully')).then(() => {
              // this._authService.logout(true);
              localStorage.clear();
              abp.auth.clearToken();
              abp.auth.clearRefreshToken();
              location.href = '';
            });
        } else {
          this.message.error(result.error);
        }
      });
  }
  //region upload for supporting docs
  uploadHandlers(choosen?: any): void {

    this.spinnerService.show();
    const formData: FormData = new FormData();
    const file = choosen.fileRaw[0];

    let filename = formData.append('file', file, file.name);
    formData.append('data', choosen.data.id);
    // formData.append('bizregid', this.appStorage.bizRegID);
    // formData.append('bizlocid', this.appStorage.bizLocID);
    formData.append('bizregid', this.inputHelper.BizRegID);
    formData.append('bizlocid', this.inputHelper.BizLocID);

    this.uploadUrl = AppConsts.remoteServiceBaseUrl + ProxyURL.SaveDocumentsBusiness;
    console.log(this.uploadUrl);
    this._httpClient
      .post<any>(this.uploadUrl, formData)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(response => {

        if (response.success) {
          this.notify.success(this.l('UploadSuccess'));

          this.refresh();
        } else if (response.error != null) {
          this.notify.error(this.l('UploadFail'));
        }
      });
  }

  refresh() {
    this.baselistTab.refresh();
    this.populateDocrequired();
  }

  onUploadError(): void {
    this.notify.error(this.l('UploadFail'));
  }



  dealWithFiles(data?: any) {

    if (data.length > 0) {
      this.selectDoctypeModal.show(data, this.inputHelper.BizRegID, this.inputHelper.BizLocID);
    }
  }



  populateDocrequired() {
    // let url = ProxyURL.GetBizDocuments + 'bizreg=' + this.appStorage.bizRegID + '&bizloc=' + this.appStorage.bizLocID + '&isList=0';
    let url = ProxyURL.GetDocumentsBusiness + 'bizreg=' + this.inputHelper.BizRegID + '&bizloc=' + this.inputHelper.BizLocID + '&isList=0';
    //this.spinnerService.show();
    this.totalDataFilled = 0;
    let data: any = [];
    if (url != null) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          //    this.spinnerService.hide();
        }))
        .subscribe(result => {

          if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
              if (result[i].DocNo != null) {
                this.totalDataFilled++;
              }

            }
            this.totalData = result.length;
            console.log(this.totalData);
            console.log(this.totalDataFilled);
            if (this.totalData === this.totalDataFilled) {
              this.uploadedAll = true;
            } else {
              this.uploadedAll = false;
            }
            console.log(this.uploadedAll);
          }
        });
    }
  }

  onDownloadClick(data: any): void {
    // console.log(JSON.stringify(data));
    if (data.PathRef === null || data.PathRef === '' || data.Status === 'Not Uploaded') {
      this.notify.error(this.l('DocumentUnavailable'));
    } else {
      let url = data.PathRef;
      url = url.replace(/\\/g, '/');

      window.open(url, '_blank');
    }
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

                  if (result) {
                    this.refresh();
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
  //endregion

  populateTaxType(): void {
    let url = ProxyURL.GetCodeMasterCombo + 'code=TOT&';
    this._proxy.request(url, RequestType.Get)
      .subscribe(result => {
        this.dataTaxType = result;
      });
  }

  populateSupplierID(): void {
    let url = ProxyURL.GetCodeMasterCombo + 'code=KAS&';
    this._proxy.request(url, RequestType.Get)
      .subscribe(result => {
        this.dataSupplierID = result;
      });
  }

  populateCountryID(): void {
    let url = ProxyURL.GetCountryCombo;
    this._proxy.request(url, RequestType.Get)
      .subscribe(result => {
        //console.log(result);
        this.dataCountryID = result;
      });
  }

  nextTabTnc(data: any): void {
    let activeTab = this.mainTabs.tabs.findIndex(x => x.active === true);
    setTimeout(() => {
      this.mainTabs.tabs[activeTab + 1].active = true;
    }, 0);
  }

  preTabTnc(data: any): void {
    let activeTab = this.mainTabs.tabs.findIndex(x => x.active === true);
    setTimeout(() => {
      this.mainTabs.tabs[activeTab - 1].active = true;
    }, 0);
  }

  setLocalStorage(): void {
    let userData: any = {};
    userData.email = this.appSession.user.emailAddress;
    userData.bizRegID = this.inputHelper.BizRegID;
    userData.bizLocID = this.inputHelper.BizLocID;
    userData.companyName = this.inputHelper.CompanyName;
    userData.companyType = this.inputHelper.BusinessType;
    userData.isHost = 0;
    this._localStorageService.setItem(AppStorageKey.bizUser,
    {
        biz: JSON.stringify(userData)
    });
  }

  // testReset(){
  //   abp.multiTenancy.setTenantIdCookie(1048);
  //   this._authService.logout(true);
  // }
}
