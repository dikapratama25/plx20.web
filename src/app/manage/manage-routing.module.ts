import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { reviewInvoice } from './reviewer/Review-invoice.component';
import { LocationComponent } from './entity/location/location.component';
import { BranchComponent } from './entity/branch/branch.component';
import { ManageAnswerComponent } from './answer/manage-answer.component';
import { ManageAnswerOptGroupComponent } from './answer/manage-answer-opt-group.component';
import { ManageAnswerOptComponent } from './answer/manage-answer-opt.component';
import { ManageQuestionnaireComponent } from './questionnaire/manage-questionnaire.component';
import { QuestionnaireEditorComponent } from './questionnaire/questionnaire-editor.component';
import { VendorManagementComponent } from './vendor/manage-vendor.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'review', component: ProfileComponent, data: { permission: 'Pages.Registration' } },
                    { path: 'branch', component: BranchComponent, data: { permission: 'Pages.Entity.Branch.View' } },
                    { path: 'location/country', component: LocationComponent, data: { permission: 'Pages.Entity.Country.View' } },
                    { path: 'location/state', component: LocationComponent, data: { permission: 'Pages.Entity.State.View' } },
                    { path: 'location/city', component: LocationComponent, data: { permission: 'Pages.Entity.City.View' } },
                    { path: 'location/area', component: LocationComponent, data: { permission: 'Pages.Entity.Area.View' } },
                    { path: 'reviewInvoice', component: reviewInvoice, data: { } },
                    { path: 'questionnaire', component: ManageQuestionnaireComponent, data: { permission: 'Pages.Questionnaire' } },
                    { path: 'questionnaire-editor', component: QuestionnaireEditorComponent, data: { permission: 'Pages.Questionnaire' } },
                    { path: 'answer', component: ManageAnswerComponent, data: {  } },
                    { path: 'answer-opt-group', component: ManageAnswerOptGroupComponent, data: {  } },
                    { path: 'answer-opt', component: ManageAnswerOptComponent, data: {  } },
                    { path: '', redirectTo: 'hostDashboard', pathMatch: 'full' },
                    { path: '**', redirectTo: 'hostDashboard' },
                    { path: 'manage-vendor', component: VendorManagementComponent, data: { permission: 'Pages.Manage.Vendor' } },
                    { path: 'manage-customer', component: VendorManagementComponent, data: { permission: 'Pages.Manage.Customer' } }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ManageRoutingModule {

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
