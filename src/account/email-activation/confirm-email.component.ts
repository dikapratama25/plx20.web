import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { AccountServiceProxy, ActivateEmailInput, ResolveTenantIdInput } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { DeeplinkService } from '@shared/utils/deeplink.service';
import { AppConsts } from '@shared/AppConsts';

@Component({
    template: `<div class="kt-login__form"><div class="alert alert-success text-center" role="alert"><div class="alert-text">{{waitMessage}}</div></div></div>`
})
export class ConfirmEmailComponent extends AppComponentBase implements OnInit {

    waitMessage: string;

    model: ActivateEmailInput = new ActivateEmailInput();

    constructor(
        injector: Injector,
        private _accountService: AccountServiceProxy,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _proxy: GenericServiceProxy,
        private deeplinkService : DeeplinkService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.waitMessage = this.l('PleaseWaitToConfirmYourEmailMessage');
        this.model.c = this._activatedRoute.snapshot.queryParams['c'];
        this._accountService.resolveTenantId(new ResolveTenantIdInput({ c: this.model.c })).subscribe((tenantId) => {
            let reloadNeeded = this.appSession.changeTenantIfNeeded(
                tenantId
            );

            if (reloadNeeded) {
                return;
            }

            let appUrl =  AppConsts.deepAppLink + "://login";
            let webUrl = AppConsts.appBaseUrl + '/account/login';
            this._accountService.activateEmail(this.model)
            .subscribe(() => {
                this.notify.success(this.l('YourEmailIsConfirmedMessage'), '',
                    {
                        onClose: () => {
                            this.waitMessage = this.l('YourEmailIsConfirmedMessage');
                            // this.deeplinkService.deeplink(appUrl, webUrl);
                            if (AppConsts.deepAppLink) {
                                this.deeplinkService.deeplink(appUrl, webUrl, true);
                            }
                            else {
                                this._router.navigate(['account/login']);
                            }
                        }
                    });
            });
        });
    }

    parseTenantId(tenantIdAsStr?: string): number {
        let tenantId = !tenantIdAsStr ? undefined : parseInt(tenantIdAsStr, 10);
        if (tenantId === NaN) {
            tenantId = undefined;
        }

        return tenantId;
    }
}
