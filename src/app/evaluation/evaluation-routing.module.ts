import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
// import { EventQuestionnaireComponent } from './questionnaire/event-questionnaire.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // { path: 'questionnaire', component: EventQuestionnaireComponent, data: { } },
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
export class EvaluationRoutingModule {

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
