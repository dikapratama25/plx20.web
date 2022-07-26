import { AbpSessionService } from 'abp-ng2-module';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionServiceProxy, UpdateUserSignInTokenOutput } from '@shared/service-proxies/service-proxies';
import { UrlHelper } from 'shared/helpers/UrlHelper';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { AppConsts } from '@shared/AppConsts';
import { VCard } from 'ngx-vcard';
import { VCardEncoding } from 'ngx-vcard';
import { VCardFormatter } from 'ngx-vcard';

@Component({
    templateUrl: './vcard-detail.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./vcard-detail.component.less']
})
export class VCardDetailComponent extends AppComponentBase implements OnInit {

    vCardEncoding: typeof VCardEncoding = VCardEncoding;
    vCard: VCard;
    vCardString;

    constructor(
        injector: Injector,
        private _router: Router,
        private _sessionService: AbpSessionService,
        private _sessionAppService: SessionServiceProxy,
        private _reCaptchaV3Service: ReCaptchaV3Service
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.vCard = { name: { firstNames: 'John', lastNames: 'Doe' } };
        this.vCardString = VCardFormatter.getVCardAsString(this.vCard);
    }
}
