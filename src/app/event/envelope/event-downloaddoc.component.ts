import { AppConsts } from 'shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, ViewEncapsulation,OnInit, AfterViewInit, Injector, ViewChild, Input } from '@angular/core';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { TenderCont } from '@shared/AppEnums';
import { CountdownComponent } from 'ngx-countdown';

@Component({
    selector: 'downloadDocList',
    templateUrl: './event-downloaddoc.component.html',
    animations: [appModuleAnimation()]
})

export class DownloadDocListComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('documentList', { static: false }) documentList: BaseListComponent;
    @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
    @Input() campID = '';

    bizRegID: string;
    bizLocID: string;
    documentListUrl: any;
    condition: string;
    physicalPath: string;
    selectedType: any = 'ALL';
    typeCombo: any = {};
    documentNo = '';
    companyName = '';
    customerID = '';
    eventID : string;
    eventName :string;

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private location: Location,
        private _tenderCont: TenderCont,
        private _storage: AppStorage
    ) {
        super(injector);
        //this.campID = '20200520142HVUAE';
        // this._activatedRoute.params.subscribe(params => {
        //     this.bizRegID = ((params['bizregid'] != undefined || params['bizregid'] != null)? params['bizregid'] : _storage.bizRegID);
        // });
    }

    ngOnInit(): void {
        this.campID = AppConsts.parentId;
        this.eventID = this._tenderCont.Items['CampID'];
        this.eventName = this._tenderCont.Items['Name'];

        if (this.campID != null) {
            // this.customerID = (this.bizRegID.length < 8? this.bizRegID : 'TBA');
            this.condition = 'accept';
            this.getCompanyName();
            this.getTypeCombo();
            this.initializeUrl();
        } else {
            this.condition = 'reject';
        }
    }

    ngAfterViewInit(): void {
    }

    goBack() {
        this.location.back();
    }

    getCompanyName() {
        let url = ProxyURL.GetCompanyCombo + 'BizRegID=' + encodeURIComponent(this.bizRegID) + '&';
        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                this.companyName = (result.length > 0 ? result[0].Remark : '');
            });
    }

    getTypeCombo() {
        // let codeUrl = ProxyURL.GetCodeMaster + 'code=DTL&';
        // this._proxy.request(codeUrl, RequestType.Get)
        // .subscribe(result => {
        //     this.typeCombo = result;
        //     this.typeCombo.unshift({'CodeType':'INV','Code':'ALL','CodeDesc':'All','CodeRemark':'ALL', 'CodeSeq':0, 'CodeRef':'','CodeVal1':'','CodeVal2':'','CodeVal3':''});
        //     this.selectedType = (this.selectedType != '' ? this.selectedType : 'ALL');
        //     //console.log(this.typeCombo);
        // });
    }

    initializeUrl() {
        this.documentListUrl = ProxyURL.GetTechCommDoc;
        // this.documentListUrl += (this.selectedType != 'ALL'? ('type=' + encodeURIComponent(this.selectedType) + '&') : '');
        // this.documentListUrl += (this.documentNo != ''? ('filter=' + encodeURIComponent(this.documentNo) + '&') : '');
    }

    getDocumentList() {
        this.initializeUrl();
        //console.log(this.documentList);
        this.documentList.setURL(this.documentListUrl);
        this.documentList.refresh();
    }

    clearDocumentFilter() {
        this.documentListUrl = ProxyURL.DownloadDocEnvelope + 'campID=' + encodeURIComponent(this.campID) + '&';
        this.selectedType = 'ALL';
        this.documentNo = '';
        //console.log(this.documentList);
        this.documentList.setURL(this.documentListUrl);
        this.documentList.refresh();
    }

    downloadDocument(data: any): void {
        //console.log(data);
        let tempPathRef = data.pathRef;
        let tempServerRef = data.serverRef;

        if (tempPathRef == null || tempPathRef === '') {
            this.notify.error(this.l('DocumentUnavaliable'));
        } else {
            let str = tempPathRef;
            str = str.replace(/C:\\/g, '');
            let tempStr = str;
            tempStr = tempStr.replace(/\\/g, '/');
            let url = tempServerRef + tempStr;
            // let url =  AppConsts.appBaseUrl + tempStr;
            console.log('url : ' + url);
            window.open(url, '_blank');
            //window.close();
        }
    }
}
