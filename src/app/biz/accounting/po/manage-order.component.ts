import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';;

@Component({
    templateUrl: './manage-order.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./manage-order.component.less'],
    animations: [appModuleAnimation()]
})
export class ManageOrderComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('baseList', { static: false }) baseList: BaseListComponent;

    panel: any = {}
    panelUrl = ProxyURL.GetAssignedPOPanel;
    gridUrl = ProxyURL.GetAssignedPOList;
    hostTID = null;
    hostID = '';
    type = 1;
    selectedStatus: any;
    comboStatusModel: any = [];
    startDate = undefined; //moment(new Date()).format('YYYY-MM-DD');
    endDate = undefined; //moment(new Date()).format('YYYY-MM-DD');

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
        this.hostTID = 2; //temporary KA-DEMO
        this.hostID = '070000'; //temporary KA-DEMO
    }

    ngOnInit() {
        this.panelUrl += 'hostTID=' + this.hostTID + '&hostID=' + this.hostID + '&type=' + this.type + '&';
        this.gridUrl += 'hostTID=' + this.hostTID + '&hostID=' + this.hostID + '&type=' + this.type + '&';

        this.spinnerService.show();
        this._proxy.request(this.panelUrl, RequestType.Get)
            .pipe(finalize(() => { this.spinnerService.hide(); }))
            .subscribe(result => {
                if (result) {
                    this.panel = result;
                }
            });

        this.comboStatusModel.unshift({ 'Code': '1', 'Status': 'Complete' });
        this.comboStatusModel.unshift({ 'Code': '0', 'Status': 'Pending Submitted' });
        this.comboStatusModel.unshift({ 'Code': '', 'Status': 'All' });
        this.selectedStatus = this.comboStatusModel[0].Code;
    }

    ngAfterViewInit(): void {
    }

    refresh() {
        this.gridUrl += 'hostTID=' + this.hostTID + '&hostID=' + this.hostID + '&type=' + this.type + '&';
        this.baseList.refresh();
    }

    refreshFilter(event?: any): void {
        if (event !== null && event !== undefined) {
            this.baseList.setURL(this.setUrl());
            this.baseList.refresh();
        }
    }

    setUrl(): string {
        let url = this.gridUrl;
        if (this.selectedStatus !== undefined) { url += 'filterStatus=' + encodeURIComponent(this.selectedStatus) + '&'; }
        if (this.startDate !== undefined) { url += 'filterFrom=' + encodeURIComponent(moment(new Date(this.startDate)).format('YYYY-MM-DD')) + '&'; }
        if (this.endDate !== undefined) { url += 'filterTo=' + encodeURIComponent(moment(new Date(this.endDate)).format('YYYY-MM-DD')) + '&'; }
        return url;
    }

}
