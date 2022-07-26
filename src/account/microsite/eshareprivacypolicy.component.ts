import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from "@shared/common/app-component-base";
import { Component, Injector, Input, OnInit, ViewChild,ViewEncapsulation,AfterViewInit  } from '@angular/core';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { inject } from '@angular/core/testing';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { finalize } from 'rxjs/operators';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';

@Component({
    templateUrl: './eshareprivacypolicy.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./eshareprivacypolicy.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class eshareprivacypolicycomponent extends AppComponentBase implements OnInit {

userProfileParams: {
    userID: string,
    tenantID: string
};


constructor (
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _route: ActivatedRoute
) {
    super(injector);
}

ngOnInit() {
}
ngAfterViewInit() {
}

}
