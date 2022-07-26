import { finalize } from 'rxjs/operators';
import { Component, Injector, ViewChild, EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CommitteeGridComponent } from './committee-grid.component';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { CommiteRoleType } from '@shared/AppEnums';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CommitteeComponent } from 'app/event/committee/committee.component';

@Component({
    selector: 'committeeListModal',
    templateUrl: './committee-listing.component.html'
})
export class CommitteeListModalComponent extends AppComponentBase {
    @ViewChild('committeeModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('requesterBaseList', { static: false }) requesterBaseList: BaseListComponent;
    @ViewChild('commercialBaseList', { static: false }) commercialBaseList: BaseListComponent;
    @ViewChild('technicalBaseList', { static: false }) technicalBaseList: BaseListComponent;
    @ViewChild('mainTabs', { static: false }) mainTabs: TabsetComponent;

    active = false;
    saving = false;
    commercialUrl: string;
    technicalUrl: string;
    requesterUrl: string;
    hseRole = 'HSE';//CommiteRoleType.HSE;
    buyerRole = 'Buyers';//CommiteRoleType.Buyer;
    requesterRole = 'Requester';//CommiteRoleType.Requester;
    campID = '';
    existcampID = '';
    selected: any[] = [];
    selectedRequester: any[] = [];
    selectedTechnical: any[] = [];
    selectedCommercial: any[] = [];
    data: any = {};
    datas: any[] = [];
    isWithHSE = false;
    poNoRequester?='';
    poNoBuyer?='';
    poNoHSE?='';
    poNo?='';
    eventMode?= '';
    bizRegID?= '';
    paxMode?= 0;
    selectedRequesterVendor: any;
    comboRequestedVendor: { Code: string, Remark: string, TransNo: string, PaxMode: number, ModeDesc: string }[] = [];
    selectedBuyerVendor: any;
    comboBuyerVendor: { Code: string, Remark: string, TransNo: string,PaxMode: number, ModeDesc: string }[] = [];
    selectedHSEVendor: any;
    comboHSEVendor: { Code: string, Remark: string, TransNo: string, PaxMode: number, ModeDesc: string }[] = [];
    selectedPaxMode: any;
    
    isVendorSelectDisabled = false;
    comboPaxMode: any = [
        { Code: "1", Remark: "Service Vendor", },
        { Code: "2", Remark: "Supply Vendor" },
        { Code: "3", Remark: "Tender Winner" }
    ]

    constructor(
        injector: Injector,
        private _storage: AppStorage,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    show(eventMode: string, currentId?: string, withHSE?: boolean, vendorID: string = undefined, vendorMode: number = 0,poNo?:string): void {
        this.active = true;
        this.isVendorSelectDisabled = false;
        this.modal.show()
        this.existcampID = currentId;
        this.isWithHSE = withHSE;
        this.eventMode = eventMode;
        this.bizRegID = vendorID;
        this.paxMode = vendorMode;
        if(poNo!=''){
            this.poNo = poNo;
            this.poNoRequester = this.poNo;
            this.poNoBuyer = this.poNo;
            this.poNoHSE = this.poNo;
            
        }
        
        if (vendorMode != 0) {
            this.selectedPaxMode = this.comboPaxMode.filter(x => (x.Code === vendorMode.toString()))[0].Code;
            
            this.isVendorSelectDisabled = true;
        }
        this.getVendorCombo();
        this.init();
    }

    init() {
        if (this.bizRegID !== '') {
            let data:any;
            if(this.poNo!=''){
                data = { Code: this.bizRegID, Remark: '', PaxMode: this.paxMode,TransNo : this.poNo };
            }else{
                data = { Code: this.bizRegID, Remark: '', PaxMode: this.paxMode};
            }
            
            this.requesterRefresh(data);
            this.buyerRefresh(data);
            this.hseRefresh(data);
        }
    }

    getVendorCombo() {
        let url = ProxyURL.GetComboParticipantList + 'CampID=' + encodeURIComponent(this.existcampID) + '&';
        this.spinnerService.show();
        this._proxy.request(url, RequestType.Get)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result) {
                    this.comboRequestedVendor = result;
                    this.comboBuyerVendor = result;
                    this.comboHSEVendor = result;
                    let idx:any;
                    
                    if(this.bizRegID!=''){
                        if(this.poNo!=''){
                            idx = result.filter(x => x.Code == this.bizRegID && x.TransNo == this.poNo)[0].Code;
                        
                        }
                        this.selectedRequesterVendor = idx;
                        this.selectedBuyerVendor = idx;
                        this.selectedHSEVendor = idx;
                    }
                }
            });
    }

    onRequesterVendorChange(data: any): void {
        this.selectedPaxMode = this.comboPaxMode.filter(x => (x.Code === data.PaxMode.toString()))[0].Code;
        this.poNoRequester = data.TransNo;
        this.requesterRefresh(data);
        
        this.requesterBaseList.setURL(this.requesterUrl);
        this.requesterBaseList.refresh();
    }


    onBuyerVendorChange(data: any): void {
        
        this.buyerRefresh(data);
        this.poNoBuyer = data.TransNo;
        
        this.commercialBaseList.setURL(this.commercialUrl);
        this.commercialBaseList.refresh();
    }

    onHSEVendorChange(data: any) {
        
        this.hseRefresh(data);
        this.poNoHSE = data.TransNo;
        
        this.technicalBaseList.setURL(this.technicalUrl);
        this.technicalBaseList.refresh();
    }

    onPaxModeChange(event: any){
    }

    requesterRefresh(data?: any) {
        let url = ProxyURL.GetEmployeeCommitteeList + 'committeeRole=' + this.requesterRole + '&' + 'CampID=' + this.existcampID + '&';
        if (data !== undefined && data !== null) { url += 'TransNo=' + encodeURIComponent('' + data.TransNo) + '&'; } 
        if (data !== undefined && data !== null) { url += 'BizRegID=' + encodeURIComponent('' + data.Code) + '&'; } 
        if (data !== undefined && data !== null) { url += 'PaxMode=' + encodeURIComponent('' + data.PaxMode) + '&'; }
        this.requesterUrl = url;
        this.selectedRequester = [];
    }

    buyerRefresh(data?: any) {
        let url = ProxyURL.GetEmployeeCommitteeList + 'committeeRole=' + this.buyerRole + '&' + 'CampID=' + this.existcampID + '&';
        if (data !== undefined && data !== null) { url += 'TransNo=' + encodeURIComponent('' + data.TransNo) + '&'; } 
        if (data !== undefined && data !== null) { url += 'BizRegID=' + encodeURIComponent('' + data.Code) + '&'; } 
        this.commercialUrl = url;
        this.selectedCommercial = [];
    }

    hseRefresh(data?: any) {
        let url = ProxyURL.GetEmployeeCommitteeList + 'committeeRole=' + this.hseRole + '&' + 'CampID=' + this.existcampID + '&';
        if (data !== undefined && data !== null) { url += 'TransNo=' + encodeURIComponent('' + data.TransNo) + '&'; } 
        if (data !== undefined && data !== null) { url += 'BizRegID=' + encodeURIComponent('' + data.Code) + '&'; } 
        this.technicalUrl = url;
        this.selectedTechnical = [];
    }

    selectRequester(data: any): void {
        this.selectedRequester = data;
    }

    selectCommercial(data: any): void {
        this.selectedCommercial = data;
    }

    selectTechnical(data: any): void {
        this.selectedTechnical = data;
    }

    add() {
        this.datas = [];

        if (this.selectedRequester !== null && this.selectedRequester.length > 0 && this.selectedRequesterVendor != undefined) {
            let combo = this.comboRequestedVendor.filter(x => (x.Code === this.selectedRequesterVendor))[0];
            this.fillData(this.selectedRequester, this.poNoRequester, this.selectedRequesterVendor, combo.ModeDesc);
        }

        if (this.selectedCommercial !== null && this.selectedCommercial.length > 0 && this.selectedBuyerVendor != undefined) {
            let combo = this.comboBuyerVendor.filter(x => (x.Code === this.selectedBuyerVendor))[0];
            this.fillData(this.selectedCommercial, this.poNoBuyer, this.selectedBuyerVendor, "Buyers");
        }

        if (this.selectedTechnical !== null && this.selectedTechnical.length > 0 && this.selectedHSEVendor != undefined) {
            let combo = this.comboHSEVendor.filter(x => (x.Code === this.selectedHSEVendor))[0];
           
            this.fillData(this.selectedTechnical, this.poNoHSE, this.selectedHSEVendor, 'HSE');
        }
    }

    fillData(data, transNo = '',vendorID = '', quizType = '') {        
        if (data !== null && data.length > 0 && quizType != '' && this.datas.filter(x => x.vendorID == vendorID && x.QuizType == 'HSE').length < 2) {
            data.forEach(element => {
                // console.log("element : " + JSON.stringify(element));
                this.data = {};
                this.data.TransNo = transNo;
                this.data.Mode = this.eventMode;
                this.data.vendorID = vendorID;
                this.data.QuizType = quizType;
                this.data.CampID = this.existcampID;
                this.data.BizRegID = element.BizRegID;
                this.data.BizLocID = element.BizLocID;
                this.data.SeqNo = 1;
                this.data.UserID = +element.UserID;
                this.data.IsReq = 0;
                this.data.OTP = '';
                this.data.IsResponse = 0;
                this.data.IsLocked = 0;
                this.data.IsApproved = 0;
                this.data.Remark = '';
                this.data.Status = 0;
                this.data.CreateBy = this.appSession.user.userName;
                this.datas.push(this.data);
            });
        }
    }

    save(): void {
        this.add();
        if (this.datas !== null && this.datas.length > 0 && this.selectedPaxMode != undefined) {
            this.saving = true;
            let url = ProxyURL.InsertCommittee;
            let data = this.datas;
            if (data !== null && data !== undefined && Array.isArray(data) && data.length) {
                this.spinnerService.show();
                this._proxy.request(url, RequestType.Post, data)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                  }))
                    .subscribe(result => {
                        if (result.isSuccess) {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this.close();
                            this.modalSave.emit(data);
                        } else {
                            this.notify.error(this.l('Failed'));
                            this.saving = false;
                        }
                    });
            } else {
                this.notify.warn(this.l('PleaseSelectData'));
                this.saving = false;
            }
        } else {
            this.notify.warn(this.l('PleaseSelectData'));
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
