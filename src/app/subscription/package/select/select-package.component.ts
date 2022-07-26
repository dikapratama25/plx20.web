import { AfterViewInit, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { PackageCardComponent } from './package-card.component';

@Component({
    templateUrl: './select-package.component.html',
    styleUrls: ['./select-package.component.less'],
    selector: 'select-package',
    encapsulation: ViewEncapsulation.None,
    animations: [accountModuleAnimation()]
})
export class SelectPackageComponent extends AppComponentBase implements AfterViewInit {
    @ViewChild('card', { static: false }) card: PackageCardComponent;
    editionsSelectOutput: EditionsSelectOutput = new EditionsSelectOutput();
    editionsWithFeatures: any[];
    @Input() appId!: number | undefined;
    @Input() selectedIndex!: number | undefined;
    @Output() onButtonClick: EventEmitter<any> = new EventEmitter<any>();
    activeState: boolean[] = [];

    constructor(
        injector: Injector,
        private _tenantRegistrationService: TenantRegistrationServiceProxy,
        private _editionHelperService: EditionHelperService,
        private _router: Router
    ) {
        super(injector);
    }

    ngAfterViewInit() {
        this.refresh(this.appId);
    }

    refresh(appID: number): void {
        this._tenantRegistrationService.getEditionsForSelect(appID)
            .subscribe((result) => {
                this.editionsSelectOutput = result;
                this.editionsWithFeatures = _(this.editionsSelectOutput.editionsWithFeatures)
                    .groupBy(e => e.edition.appName)
                    .map((items, app) => ({ app, items }))
                    .value();
                if (!this.editionsSelectOutput.editionsWithFeatures || this.editionsSelectOutput.editionsWithFeatures.length <= 0) {
                    this._router.navigate(['/app/biz/home']);
                }
                if (this.editionsWithFeatures.length > 0) {
                    _.forEach(this.editionsWithFeatures, item => { this.activeState.push(false); });
                }
                if (this.selectedIndex != undefined) {
                    this.toggle(this.selectedIndex);
                }
            });
    }

    onClick(event: any): void {
        this.onButtonClick.emit(event);
    }

    toggle(index: number) {
        this.activeState[index] = !this.activeState[index];
    }
}
