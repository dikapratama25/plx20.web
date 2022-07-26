import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AddServiceModalComponent } from './select-service.component';
import { ServiceListModalComponent } from './service-listing.component';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import * as _ from 'lodash';

@Component({
    templateUrl: './package-listing.component.html',
    animations: [appModuleAnimation()]
})

export class PackageListingComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('serviceListModal', { static: true }) serviceListModal: ServiceListModalComponent;
    @ViewChild('addServiceModal', { static: true }) addServiceModal: AddServiceModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('subscriptiongrid', { static: false }) subscriptiongrid: BaseListComponent;

    gridUrl = ProxyURL.GetUserSubcriptions;
    startDate = undefined;
    endDate = undefined;
    totalActive = 0;
    totalExpiry = 0;
    mode: number = 0;

    constructor(
        injector: Injector,
        private _router: Router,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._proxy.request(ProxyURL.GetCountUserSubcriptions, RequestType.Get)
            .pipe().subscribe(result => {
                if (result && result.items.length > 0) {
                    this.totalActive = result.items[0].TotalActive;
                    this.totalExpiry = result.items[0].TotalExpiry;
                }
            });
    }

    ngAfterViewInit(): void {
        this.refresh();
    }

    refresh(): void {
        let url = ProxyURL.GetUserSubcriptions;
        this.subscriptiongrid.setURL(url);
        this.subscriptiongrid.refresh();
    }
    
    viewOptionDetail() {
        this._router.navigate(['/app/subscription/optionpackage']);
    }
    
    viewCurrentDetail(data?: any) {
        console.log(data);
        this._router.navigate(['/app/subscription/currentpackage'], { queryParams: { appID: data.AppId, appName: data.AppName, ServiceID: data.Id, subscriptionName: data.SubscriptionName, subscriptionEndDateUtc: data.SubscriptionEndDateUtc } });
      }
    
    onStartChange(data?:any){
        this.startDate=data;
        this.refreshFilter(1);
    }

    onEndChange(data?:any){
        
        this.endDate=data;
        this.refreshFilter(1);
    }

    refreshFilter(data?: any): void {
        if(this.subscriptiongrid!=undefined){
            this.subscriptiongrid.setURL(this.setUrl());
            this.subscriptiongrid.refresh();
        }
    }

    setUrl(): string {
        let url = ProxyURL.GetUserSubcriptions;
        (this.startDate != undefined || this.startDate != null) ? url += 'From=' + encodeURIComponent(moment(new Date(this.startDate)).format('LL')) + '&' : 'From=null&';
        (this.endDate != undefined || this.endDate != null) ? url += 'To=' + encodeURIComponent(moment(new Date(this.endDate)).format('LL')) + '&' : 'To=null&';
        return url;
    }

    startService(event?:any) {
        let url =  _.filter(AppConsts.svcAppBaseUrl, x=> x.appId == event.data.AppId)[0].url + '/app/biz/home';
        window.location.replace(url);
    }

    browseService(data?:any) {
        this.serviceListModal.show(data);
    }
    
    addService(data?:any) {
        this.addServiceModal.show(data);
    }
    
}