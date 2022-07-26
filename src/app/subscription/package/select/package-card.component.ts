import { AfterViewInit, Component, EventEmitter, Injector, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
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
    templateUrl: './package-card.component.html',
    styleUrls: ['./package-card.component.less'],
    selector: 'package-card',
    encapsulation: ViewEncapsulation.None,
    animations: [accountModuleAnimation()]
})
export class PackageCardComponent extends AppComponentBase implements AfterViewInit {

    @Input() item: EditionWithFeaturesDto = new EditionWithFeaturesDto();
    @Input() features: FlatFeatureSelectDto[];
    @Output() onButtonClick: EventEmitter<any> = new EventEmitter<any>();
    isUserLoggedIn = false;
    isSetted = false;
    editionPaymentType: typeof EditionPaymentType = EditionPaymentType;
    subscriptionStartType: typeof SubscriptionStartType = SubscriptionStartType;
    /*you can change your edition icons order within editionIcons variable */
    editionIcons: string[] = ['flaticon-open-box', 'flaticon-rocket', 'flaticon-gift', 'flaticon-confetti', 'flaticon-cogwheel-2', 'flaticon-app', 'flaticon-coins', 'flaticon-piggy-bank', 'flaticon-bag', 'flaticon-lifebuoy', 'flaticon-technology-1', 'flaticon-cogwheel-1', 'flaticon-infinity', 'flaticon-interface-5', 'flaticon-squares-3', 'flaticon-interface-6', 'flaticon-mark', 'flaticon-business', 'flaticon-interface-7', 'flaticon-list-2', 'flaticon-bell', 'flaticon-technology', 'flaticon-squares-2', 'flaticon-notes', 'flaticon-profile', 'flaticon-layers', 'flaticon-interface-4', 'flaticon-signs', 'flaticon-menu-1', 'flaticon-symbol'];
    
    constructor(
        injector: Injector,
        private _tenantRegistrationService: TenantRegistrationServiceProxy,
        private _editionHelperService: EditionHelperService,
        private _router: Router
    ) {
        super(injector);
    }

    ngAfterViewInit() {
        this.isUserLoggedIn = abp.session.userId > 0;
    }

    isFree(edition: EditionSelectDto): boolean {
        return this._editionHelperService.isEditionFree(edition);
    }

    isTrueFalseFeature(feature: FlatFeatureSelectDto): boolean {
        return feature.inputType.name === 'CHECKBOX';
    }

    featureEnabledForEdition(feature: FlatFeatureSelectDto, edition: EditionWithFeaturesDto, isBoolean: boolean): boolean {
        const featureValues = _.filter(edition.featureValues, { name: feature.name });
        if (!featureValues || featureValues.length <= 0) {
            return false;
        }

        const featureValue = featureValues[0];

        if (isBoolean) {
            return featureValue.value.toLowerCase() === 'true';
        } else {
            if (featureValue.value == 'Unlimited') {
                return true;
            } else if (featureValue.value.includes(' TB')) {
                return +featureValue.value.replace(' TB', '') > 0;
            } else if (featureValue.value.includes(' GB')) {
                return +featureValue.value.replace(' GB', '') > 0;
            } else if (featureValue.value.includes(' MB')) {
                return +featureValue.value.replace(' MB', '') > 0;
            } else  {
                return +featureValue.value > 0;
            }
            
        }
    }

    getFeatureValueForEdition(feature: FlatFeatureSelectDto, edition: EditionWithFeaturesDto): string {
        const featureValues = _.filter(edition.featureValues, { name: feature.name });
        if (!featureValues || featureValues.length <= 0) {
            return '';
        }

        const featureValue = featureValues[0];
        return featureValue.value;
    }

    // upgrade(upgradeEdition: EditionSelectDto, editionPaymentType: EditionPaymentType): void {
    //     this._router.navigate(['/account/upgrade'], { queryParams: { upgradeEditionId: upgradeEdition.id, editionPaymentType: editionPaymentType } });
    // }
    onClick(upgradeEdition: EditionSelectDto, editionPaymentType: EditionPaymentType): void {
        this.onButtonClick.emit({
            edition: upgradeEdition,
            payment: editionPaymentType
        });
    }
}
