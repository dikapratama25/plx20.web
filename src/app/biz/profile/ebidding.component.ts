import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { Router } from '@angular/router';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    templateUrl: './ebidding.component.html',
    animations: [appModuleAnimation()]
})

export class EBiddingComponent extends AppComponentBase implements OnInit, AfterViewInit {
    mode: number = 0;

    constructor(
        injector: Injector,
        private _route: Router,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        let url =  _.filter(AppConsts.svcAppBaseUrl, x=> x.appId == 393130)[0].url + '/app/biz/home';
        window.location.replace(url);
    }

    ngAfterViewInit(): void {

    }

}