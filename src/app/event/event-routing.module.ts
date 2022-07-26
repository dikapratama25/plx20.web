import { EventSummaryComponent } from './summary/event-summary.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPromotionComponent } from './promotion/event-promotion.component';
import { EventCreateEditComponent } from './promotion/event-create-edit.component';
import { EventEnvelopeComponent } from './envelope/event-envelope.component';
import { ParticipantComponent } from './participant/participant.component';
import { ResponseComponent } from './response/response.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { EventDetailComponent } from './promotion/event-detail.component';
import { CreateCampaignOrEventComponent } from './promotion/create-campaign-or-event.component';
import { EnvelopeOpeningComponent } from './evaluation/envelope-opening.component';
import { EventReviewComponent } from './evaluation/event-review.component';
import { TechnicalCommercialComponent } from './evaluation/technical-commercial-review.component';
import { CompareParticipantComponent } from './evaluation/compare-participant.component';
import { DetailReviewComponent } from './evaluation/detail-review.component';
import { CommitteeComponent } from './committee/committee.component';
import { FinalAwardComponent } from './evaluation/final-award.component';
import { TenderReviewComponent } from './evaluation/tender-review.component';
import { EventQuestionnaireComponent } from 'app/evaluation/questionnaire/event-questionnaire.component';
import { EvaluationReviewComponent } from './evaluation/evaluation-review.component';
import { SubmissionComponent } from './submission/submission.component';
import { SubmissionDetailComponent } from './submission/submission-detail.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: '', component: EventPromotionComponent, data: { permission: ('Pages.Manage') } },
                    { path: 'create-evaluation', component: CreateCampaignOrEventComponent, data: { permissions: ('Pages.Manage') } },
                    { path: 'edit-evaluation', component: CreateCampaignOrEventComponent, data: { permissions: ('Pages.Manage') } },
                    { path: 'edit-event', component: CreateCampaignOrEventComponent, data: { permissions: ('Pages.Tender.Create') } },
                    { path: 'edit/:id', component: EventCreateEditComponent, data: {} },
                    { path: 'delete/:id', component: EventCreateEditComponent, data: {} },
                    { path: 'subscribe', component: EventCreateEditComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'subscribe/:id', component: EventCreateEditComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'summary', component: EventSummaryComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'vendor', component: ParticipantComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'vendor/vendor-detail/:paxregid/:paxlocid', component: CommitteeComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'vendor/vendor-detail/:paxregid/:paxlocid/:pono', component: CommitteeComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'submission', component: SubmissionComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'submission/submission-detail', component: SubmissionDetailComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'response', component: ResponseComponent, data: { permissions: ['Pages.Tender.Create, Pages.Tender.Subscribe, Pages.Event.Evaluation'] } },
                    { path: 'event-detail/:id', component: EventDetailComponent, data: {} },
                    { path: 'event-review', component: EventReviewComponent, data: { permissions: ['Pages.Event.Evaluation.Role'] } },
                    { path: 'technical-review', component: TechnicalCommercialComponent, data: { permission: ['Pages.Event.Evaluation.Role.Technical'] } },
                    { path: 'commercial-review', component: TechnicalCommercialComponent, data: { permission: ['Pages.Event.Evaluation.Role.Commercial'] } },
                    { path: 'requester-review', component: TechnicalCommercialComponent, data: { permission: ['Pages.Event.Evaluation.Role.Technical'] } },
                    { path: 'evaluation-score', component: CompareParticipantComponent, data: { permissions: ['Pages.Event.Evaluation.Role.Review'] } },
                    { path: 'detail-review', component: DetailReviewComponent, data: {}},
                    { path: 'evaluator', component: CommitteeComponent, data: { permissions: ['Pages.Manage'] } },
                    { path: 'final-review', component: FinalAwardComponent, data: {} },
                    { path: 'final-review/:campid', component: FinalAwardComponent, data: {} },
                    { path: 'tender-review/:campid', component: TenderReviewComponent, data: {} },
                    { path: 'tender-review', component: TenderReviewComponent, data: {} },
                    { path: 'questionnaire', component: EventQuestionnaireComponent, data: { } },
                    { path: 'envelope-opening', component: EnvelopeOpeningComponent, data: { permissions: ['Pages.Event.Evaluation.Role'] } },
                    { path: 'evaluation-review', component: EvaluationReviewComponent, data: { permissions: ['Pages.Event.Evaluation.Role.Review'] } }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class EventRoutingModule { }
