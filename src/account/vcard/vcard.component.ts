
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Component, OnInit, AfterViewInit, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProfileListDto } from '@shared/service-proxies/service-proxies';
import { VCard } from 'ngx-vcard';
import { VCardEncoding } from 'ngx-vcard';
import { VCardFormatter } from 'ngx-vcard';

@Component({
  templateUrl: './vcard.component.html',
  styleUrls: ['./vcard.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class VcardComponent extends AppComponentBase implements AfterViewInit, OnInit {
    vCardEncoding: typeof VCardEncoding = VCardEncoding;
    vCard: VCard;
    vCardString;

    vcardImg = '';
    vcardurlImg = '';

    profile: ProfileListDto = new ProfileListDto();
    pnMobileNo = '';
    pnDirectNo = '';
    cnTelNo = '';
    cnFaxNo = '';
    company: any;
    selectedEmloyee: any;
    multiDesignation = false;
    designation = '';
    designation2 = '';
    refID = '';
    fullName = '';

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _proxy: GenericServiceProxy,
   
    ) {
    super(injector);
    }
    
    ngOnInit() {
      this.refID = this._activatedRoute.snapshot.queryParams['vcid'];
      this.fullName = this._activatedRoute.snapshot.queryParams['nm'];
      this.getUserProfile(this.refID, this.fullName);
    }
    
    ngAfterViewInit() {
      this.generateVcard();
      this.generateVcf();
      //this.downloadQR();
      // let zoomQR = document.querySelector('#qrVCF img');
      let zoomQR = document.querySelectorAll('#employeeQR img');
      
      let zoomQR1 = document.querySelector('#vcardView');
      //let clickDlBtn = document.querySelector('#btnSaveQr');
      let clickDlBtn = document.querySelector('#downloadQRAddr');
      
      clickDlBtn.addEventListener('click',(evt) => this.downloadQR());

      for(let i=0;i<zoomQR.length;i++){
        zoomQR[i].addEventListener('click',function(event){
          //if(this.hasClass(zoomQR1,'zoomed')){
          if(zoomQR1.classList.contains('zoomed')){
              zoomQR1.classList.remove('zoomed');
          }
          else{
              zoomQR1.classList.add('zoomed');
          }
        });
      }

      //control the slider
      let switcher = document.querySelectorAll('.switcher');
      let employeeQR = document.querySelector('#employeeQR');
      for(let i=0;i<switcher.length;i++){
        switcher[i].addEventListener('click',function(){
          if(employeeQR.classList.contains('vcardLink')){
            employeeQR.classList.remove('vcardLink');
          }
          else{
            employeeQR.classList.add('vcardLink');
          }
        })
      }
    }

    getUserProfile(refID: string, fullName: string) {
      this.profile = new ProfileListDto();
      let url = ProxyURL.GetUserProfilebyRefIDName;
      if (refID !== undefined && refID !== null) { url += 'refID=' + encodeURIComponent(refID) + '&'; }
      if (fullName !== undefined && fullName !== null) { url += 'fullName=' + encodeURIComponent(fullName) + '&'; }
      // console.log(url);
      this._proxy.request(url, RequestType.Get)
      // .pipe(finalize(() => this.getCompanyDetail()))
      .subscribe(result => {
        if (result && result.totalCount > 0) {
            this.profile.upfID = result.items[0].UPFID;
            this.profile.refUSR = result.items[0].REFUSR;
            this.profile.bizRegID = result.items[0].BizRegID;
            this.profile.bizLocID = result.items[0].BizLocID;
            this.profile.referralID = result.items[0].ReferralID;
            this.profile.firstName = result.items[0].FirstName;
            this.profile.lastName = result.items[0].LastName;
            this.profile.sex = result.items[0].Sex;
            this.profile.salutation = result.items[0].Salutation;
            this.profile.designation = result.items[0].Designation;
            this.profile.emailAddress = result.items[0].EmailAddress;
            this.profile.directNo = result.items[0].DirectNo;
            this.profile.mobileNo = result.items[0].MobileNo;
            this.profile.socialMedia = result.items[0].socialMedia;
            this.profile.location = result.items[0].Location;
            if (result.items[0].Designation.split(',').length > 0) {
              this.designation = result.items[0].Designation.split(',')[0];
              this.designation2 = result.items[0].Designation.split(',')[1];
              this.multiDesignation = true;
            } else {
              this.designation = result.items[0].Designation;
              this.multiDesignation = false;
            }
            this.pnDirectNo = result.items[0].DirectNo.length > 12 ? result.items[0].DirectNo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : result.items[0].DirectNo.length > 11 ? result.items[0].DirectNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : result.items[0].DirectNo.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
            this.pnMobileNo = result.items[0].MobileNo.length > 12 ?  result.items[0].MobileNo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : result.items[0].MobileNo.length > 11 ?  result.items[0].MobileNo.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3') : result.items[0].MobileNo.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
            this.getCompanyDetail();
        }
      });
    }

    getCompanyDetail() {
      this.company = undefined;
      let url = ProxyURL.GetProfileBusiness;
      if (this.profile.bizRegID !== undefined && this.profile.bizRegID !== null) 
      { 
        url += 'bizregid=' + encodeURIComponent(this.profile.bizRegID) + '&';
        url += 'bizlocid=' + encodeURIComponent(this.profile.bizLocID) + '&';
      }
      this._proxy.request(url, RequestType.Get)
      // .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe(result => {
        if (result) {
          this.company = result;
          this.cnTelNo = 
          this.company.BranchTelNo.length > 12 ? this.company.BranchTelNo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 
          this.company.BranchTelNo.length > 11 ? this.company.BranchTelNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : 
          this.company.BranchTelNo.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
          this.cnFaxNo = 
          this.company.BranchFaxNo.length > 12 ? this.company.BranchFaxNo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 
          this.company.BranchFaxNo.length > 11 ? this.company.BranchFaxNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : 
          this.company.BranchFaxNo.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      }
      });
    }

    //function to generate QR Code
    generateVcard() {
        // let url = ProxyURL.GenerateVCardBase64 + 'qrcode=' + qrVCardUrl.replace('/'; '%2F').replace('?'; '%3F').replace('='; '%3D') + '&' + AppConsts.authorization.encrptedAuthTokenName + '=' + encodeURIComponent(value.token);
        let data: any = {};
        data.firstName = this.profile.firstName == null || this.profile.firstName == undefined ? '' : this.profile.firstName; //this.selectedEmloyee.name;
        data.lastName = this.profile.lastName == null || this.profile.lastName == undefined ? '' : this.profile.lastName; //this.selectedEmloyee.surname;
        data.company = this.company.BranchName == null || this.company.BranchName == undefined ? '' : this.company.BranchName;
        data.jobTitle = this.profile.designation == null || this.profile.designation == undefined ? '' : this.profile.designation; //this.selectedEmloyee.designation;
        data.address = this.company.BranchAddress1 == null || this.company.BranchAddress1 == undefined ? '' : this.company.BranchAddress1;
        data.city = this.company.BranchCityDesc == null || this.company.BranchCityDesc == undefined ? '' : this.company.BranchCityDesc;
        data.country = this.company.BranchCountryDesc == null || this.company.BranchCountryDesc == undefined ? '' : this.company.BranchCountryDesc;
        data.phone = this.profile.directNo == null || this.profile.directNo == undefined ? '' : this.profile.directNo; //this.selectedEmloyee.direct;
        data.mobile = this.profile.mobileNo == null || this.profile.mobileNo == undefined ? '' : this.profile.mobileNo; //this.selectedEmloyee.mobile;
        data.email = this.profile.emailAddress == null || this.profile.emailAddress == undefined ? '' : this.profile.emailAddress; //this.selectedEmloyee.email;
        data.url = 'https://www.cenviro.com';
        data.note = window.location.href;

        this._proxy.request(ProxyURL.GenerateVCardBase64, RequestType.Post, data)
        .subscribe((result) => {
            this.vcardImg = 'data:image/png;base64,' + result;
            // console.log(this.vcardImg);
        });

        let qrVCardUrl = window.location.href;
        let url = ProxyURL.GenerateQRBase64 + 'qrcode=' + qrVCardUrl.replace(/[\/]/g, '%2F').replace(/[?]/g, '%3F').replace(/[=]/g, '%3D').replace(/[ ]/g, '%40').replace(/[&]/g, '%26');
        this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
            this.vcardurlImg = 'data:image/png;base64,' + result;
        });
    }

    //function to generate vcf file
    generateVcf(){
        // this.vCard = {
        //      name: { firstNames: this.selectedEmloyee.name, lastNames: this.selectedEmloyee.surname }
        //     };

        this.vCard = { version: '3.0',
          name: { 
            firstNames: this.profile.firstName == null || this.profile.firstName == undefined ? '' : this.profile.firstName, 
            lastNames: this.profile.lastName == null || this.profile.lastName == undefined ? '' : this.profile.lastName
          },
          organization: this.company.BranchName == null || this.company.BranchName == undefined ? '' : this.company.BranchName,
          title: this.profile.designation == null || this.profile.designation == undefined ? '' : this.profile.designation,
          email: [this.profile.emailAddress == null || this.profile.emailAddress == undefined ? '' : this.profile.emailAddress],
          telephone: [
            {
              value: this.profile.directNo == null || this.profile.directNo == undefined ? '' : this.profile.directNo,
              param: { type: ['work'], value: 'uri' },
            },
            {
              value: this.profile.mobileNo == null || this.profile.mobileNo == undefined ? '' : this.profile.mobileNo,
              param: { type: ['cell'], value: 'uri' },
            },
          ],
          address: [
            {
              value: {
                label: '',
                street: this.company.BranchAddress1 == null || this.company.BranchAddress1 == undefined ? '' : this.company.BranchAddress1,
                locality: this.company.BranchCityDesc == null || this.company.BranchCityDesc == undefined ? '' : this.company.BranchCityDesc,
                postalCode: '',
                region: this.company.BranchStateDesc == null || this.company.BranchStateDesc == undefined ? '' : this.company.BranchStateDesc,
                countryName: this.company.BranchCountryDesc == null || this.company.BranchCountryDesc == undefined ? '' : this.company.BranchCountryDesc,
              },
              param: { type: ['work'], pref: 1 },
            }
          ],
          url: 'https://www.cenviro.com',
          note: window.location.href
        };
        this.vCardString = VCardFormatter.getVCardAsString(this.vCard);
    }

      //#region QR
      convertBase64ToBlobData(base64Data: string, contentType: string='image/png', sliceSize=512) {
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
      
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
      
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
      
            const byteArray = new Uint8Array(byteNumbers);
      
            byteArrays.push(byteArray);
          }
      
          const blob = new Blob(byteArrays, { type: contentType });
          return blob;
      }
  
      downloadQR() {
          //let qrVCardUrl = AppConsts.appBaseUrl + '/account/vcard?vcid=' + event.ReferralID + '&nm=' + event.FullName.replace(/[ ]/g, '_');
          let qrVCardUrl = window.location.href;
          let url = ProxyURL.GenerateQRBase64 + 'qrcode=' + qrVCardUrl.replace(/[\/]/g, '%2F').replace(/[?]/g, '%3F').replace(/[=]/g, '%3D').replace(/[ ]/g, '%40').replace(/[&]/g, '%26');
          this._proxy.request(url, RequestType.Get)
          .subscribe((result) => {
              let filename = this.profile.referralID;
              let blobData = this.convertBase64ToBlobData(result);
              if (window.navigator && window.navigator.msSaveOrOpenBlob) { //IE
                window.navigator.msSaveOrOpenBlob(blobData, filename);
              } else { // chrome
                  let url = window.URL.createObjectURL(blobData);
                  let a = document.createElement('a');
                  document.body.appendChild(a);
                  a.setAttribute('style', 'display: none');
                  a.href = url;
                  a.download = filename;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  a.remove();
              }
          });
      }
  
      //#endregion
      // downloadQR()
  
}    