import { Component, Injector, OnInit,AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    EditionSelectDto,
    EditionWithFeaturesDto,
    EditionsSelectOutput,
    FlatFeatureSelectDto,
    TenantRegistrationServiceProxy,
    EditionPaymentType,
    SubscriptionStartType
} from '@shared/service-proxies/service-proxies';
import * as _ from 'lodash';
import { EditionHelperService } from '@account/payment/edition-helper.service';

@Component({
    templateUrl: './vendor-registration.component.html',
    styleUrls: ['./vendor-registration.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [accountModuleAnimation()]
})
export class vendorRegistrationComponent extends AppComponentBase implements OnInit, AfterViewInit {
    constructor(
        injector: Injector,
        private _tenantRegistrationService: TenantRegistrationServiceProxy,
        private _editionHelperService: EditionHelperService,
        private _router: Router
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }
    ngAfterViewInit(): void {
        let options = {
            startStep: 1,
            clickableSteps: true
        };
        let wizard = new KTWizard('kt_wizard',options);

    }
}