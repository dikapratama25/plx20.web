import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BillingInformationComponent } from './billing/billing-information.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'billing-information', component: BillingInformationComponent, data: { permission: 'Pages.Biz.Accounting.Billing.Info' } },
                    { path: '', redirectTo: 'hostDashboard', pathMatch: 'full' },
                    { path: '**', redirectTo: 'hostDashboard' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class BizSettingsRoutingModule {

    constructor(
        private router: Router
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scroll(0, 0);
            }
        });
    }
}
