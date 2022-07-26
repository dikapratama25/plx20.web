import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppUrlService } from '@shared/common/nav/app-url.service';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { AccountServiceProxy, IsTenantAvailableInput, IsTenantAvailableOutput, SendPasswordResetCodeInput, TenantAvailabilityState } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';

@Component({
    templateUrl: './forgot-password.component.html',
    animations: [accountModuleAnimation()]
})
export class ForgotPasswordComponent extends AppComponentBase {

    model: SendPasswordResetCodeInput = new SendPasswordResetCodeInput();

    saving = false;

    constructor (
        injector: Injector,
        private _accountService: AccountServiceProxy,
        private _appUrlService: AppUrlService,
        private _proxy: GenericServiceProxy,
        private _router: Router
        ) {
        super(injector);
    }

    save(): void {
        this.saving = true;
        let url = ProxyURL.GetTenantInfo;
        this._proxy.request(url, RequestType.Post, this.model)
        .subscribe(result => {
            if (result) {
                this.setTenant(result.tenancyName);
            }
        });
    }

    sendEmailCode(): void {
        this._accountService.sendPasswordResetCode(this.model)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.message.success(this.l('PasswordResetMailSentMessage'), this.l('MailSent')).then(() => {
                    this._router.navigate(['account/login']);
                });
            });
    }

    setTenant(tenantName: string): void {
        let input = new IsTenantAvailableInput();
        input.tenancyName = tenantName;

        this._accountService.isTenantAvailable(input)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe((result: IsTenantAvailableOutput) => {
                switch (result.state) {
                    case TenantAvailabilityState.Available:
                        abp.multiTenancy.setTenantIdCookie(result.tenantId);
                        this.sendEmailCode();
                        return;
                    case TenantAvailabilityState.InActive:
                        this.message.warn(this.l('TenantIsNotActive', tenantName));
                        break;
                    case TenantAvailabilityState.NotFound: //NotFound
                        this.message.warn(this.l('ThereIsNoTenantDefinedWithName{0}', tenantName));
                        break;
                }
            });

    }
}
