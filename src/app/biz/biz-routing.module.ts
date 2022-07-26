import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BillingRequestComponent } from './accounting/billing/billing-request.component';
import { BillingUploadComponent } from './accounting/billing/upload/billing-upload.component';
import { BillingHistoryComponent } from './accounting/billing/billing-history.component';
import { ManageOrderComponent } from './accounting/po/manage-order.component';
import { HomeBizComponent } from './dashboard/home-biz.component';
import { CompanyProfileComponent } from './profile/company-profile.component';
import { EBiddingComponent } from './profile/ebidding.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'home', component: HomeBizComponent,  data: { permission: 'Pages.Biz' } },
                    { path: 'order', component: ManageOrderComponent, data: { permission: 'Pages.Biz.Accounting.PO' } },
                    { path: 'billing-upload', component: BillingUploadComponent, data: { permission: 'Pages.Biz.Accounting.Billing.Upload' } },
                    { path: 'billing-request', component: BillingRequestComponent, data: { permission: 'Pages.Biz.Accounting.Billing.Request' } },
                    { path: 'billing-history', component: BillingHistoryComponent, data: { permission: 'Pages.Biz.Accounting.Billing.History'} },
                    { path: 'billing-submission', component: BillingRequestComponent, data: { permission: 'Pages.Account.Invoice.Submission' } },
                    { path: 'business-profile', component: CompanyProfileComponent, data: { permission: 'Pages.Biz.Profile' } },
                    { path: 'ebidding', component: EBiddingComponent,  data: { permission: 'Pages.Clobid' } },
                    { path: '', redirectTo: 'home', pathMatch: 'full' },
                    { path: '**', redirectTo: 'home' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class BizRoutingModule {

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
