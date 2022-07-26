import { PaymentModule } from './payment/payment.module';
import { Subscription } from 'rxjs';
import { NgModule } from '@angular/core';
import { NavigationEnd, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRouteGuard } from './shared/common/auth/auth-route-guard';
import { NotificationsComponent } from './shared/layout/notifications/notifications.component';
import { NgxSpinnerService } from 'ngx-spinner';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'app',
                component: AppComponent,
                canActivate: [AppRouteGuard],
                canActivateChild: [AppRouteGuard],
                children: [
                    {
                        path: '',
                        children: [
                            { path: 'notifications', component: NotificationsComponent },
                            { path: '', redirectTo: '/app/main/dashboard', pathMatch: 'full' }
                        ]
                    },
                    {
                        path: 'main',
                        loadChildren: () => import('app/main/main.module').then(m => m.MainModule), //Lazy load main module
                        data: { preload: true }
                    },
                    {
                        path: 'admin',
                        loadChildren: () => import('app/admin/admin.module').then(m => m.AdminModule), //Lazy load admin module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'manage',
                        loadChildren: () => import('app/manage/manage.module').then(m => m.ManageModule), //Lazy load manage module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'biz',
                        loadChildren: () => import('@app/biz/biz.module').then(m => m.BizModule), //Lazy load manage module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'bizsettings',
                        loadChildren: () => import('@app/bizsettings/bizsettings.module').then(m => m.BizSettingsModule), //Lazy load manage module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'evaluation',
                        loadChildren: () => import('app/evaluation/evaluation.module').then(m => m.EvaluationModule), //Lazy load event module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'event',
                        loadChildren: () => import('app/event/event.module').then(m => m.EventModule), //Lazy load manage module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'subscription',
                        loadChildren: () => import('@app/subscription/subscription.module').then(m => m.SubscriptionModule), //Lazy load manage module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'payment',
                        loadChildren: () => import('@app/payment/payment.module').then(m => m.PaymentModule), //Lazy load manage module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: '**', redirectTo: 'notifications'
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {
    constructor(
        private router: Router,
        private spinnerService: NgxSpinnerService
    ) {
        router.events.subscribe((event) => {

            if (event instanceof RouteConfigLoadStart) {
                spinnerService.show();
            }

            if (event instanceof RouteConfigLoadEnd) {
                spinnerService.hide();
            }

            if (event instanceof NavigationEnd) {
                document.querySelector('meta[property=og\\:url').setAttribute('content', window.location.href);
            }
        });
    }
}
