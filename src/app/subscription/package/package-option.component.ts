import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    templateUrl: './package-option.component.html',
    animations: [appModuleAnimation()]
})

export class PackageOptionComponent extends AppComponentBase implements OnInit, AfterViewInit {
    mode: number = 0;
    selectedID = '';
    selectedPlan = '';
    selectedAmt: number = 0;
    selectedType = '';

    constructor(
        injector: Injector,
        private _router: Router,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

    }

    selectPlan(id: string, name: string, type: string, amt: number): void {
        this.selectedID = id;
        this.selectedPlan = name;
        this.selectedType = type;
        this.selectedAmt = amt;
        this._router.navigate(['/app/payment/portal'],
        {
            queryParams: {
                topUpCredit: false,
                subscribtionId: this.selectedID,
                subscribtionName: this.selectedPlan,
                subscribtionAmt: this.selectedAmt,
                subscribtionType: this.selectedType
            }
        });
    }

}