import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    templateUrl: './mysubscription.component.html',
    animations: [appModuleAnimation()]
})

export class MySubscriptionComponent extends AppComponentBase implements OnInit, AfterViewInit {
    mode: number = 0;

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

    }

}