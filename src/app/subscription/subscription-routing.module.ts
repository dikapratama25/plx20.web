import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { PackageListingComponent } from './package/package-listing.component';
import { PackageCurrentComponent } from './package/package-current.component';
import { PackageOptionComponent } from './package/package-option.component';
import { MySubscriptionComponent } from './package/mysubscription.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'home', component: PackageListingComponent,  data: { permission: 'Pages.UserAccount.MySubscription' } },
                    { path: 'currentpackage', component: PackageCurrentComponent,  data: { permission: 'Pages.UserAccount.MySubscription' } },
                    { path: 'optionpackage', component: PackageOptionComponent,  data: { permission: 'Pages.UserAccount.MySubscription' } },
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
export class SubscriptionRoutingModule {

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
