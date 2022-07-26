import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SelectPackageComponent } from './select/select-package.component';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import * as _ from 'lodash';

@Component({
    templateUrl: './package-current.component.html',
    animations: [appModuleAnimation()],
    styleUrls: [
        './package-current.component.less'
    ],
    encapsulation: ViewEncapsulation.None
})

export class PackageCurrentComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('servicepackage', { static: false }) servicepackage: SelectPackageComponent;
    mode: number = 0;
    appId!: number | undefined;
    appName = '';
    subscriptionName = '';
    subscriptionEndDate = '';

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _proxy: GenericServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.appName = this._activatedRoute.snapshot.queryParams['appName'];
        this.subscriptionName = this._activatedRoute.snapshot.queryParams['subscriptionName'];
        this.subscriptionEndDate = moment(new Date(this._activatedRoute.snapshot.queryParams['subscriptionEndDateUtc'])).format('LL');
        this.appId = this._activatedRoute.snapshot.queryParams['appID'];
    }

    ngAfterViewInit(): void {

    }

    onPackageClick(event: any): void {
        this._router.navigate(['/account/upgrade'], { queryParams: { upgradeEditionId: event.edition.id, editionPaymentType: event.payment } });
    }

    startService() {
        let url =  _.filter(AppConsts.svcAppBaseUrl, x=> x.appId == this.appId)[0].url + '/app/biz/home';
        window.location.replace(url);
    }
}