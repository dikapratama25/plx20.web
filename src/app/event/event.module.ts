import { PaxRegPaxLog } from './../../shared/AppEnums';
import { TenderCont } from '@shared/AppEnums';
import { EventSummaryComponent } from './summary/event-summary.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { TableModule } from 'primeng/table';
import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { AppFormModule } from '@app/shared/form/app-form.module';
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { EventRoutingModule } from './event-routing.module';
import { EventPromotionComponent } from './promotion/event-promotion.component';
import { EventCreateEditComponent } from './promotion/event-create-edit.component';
import { EventItemModalComponent } from './promotion/event-item-modal.component';
import { EventGalleryComponent } from './promotion/event-gallery.component';
import { SelectBranchModalComponent } from './promotion/select-branch-modal.component';
import { CreateOrEditEventGalleryModalComponent } from './promotion/create-or-edit-event-gallery.component';
import { EventEditModalComponent } from './promotion/event-edit.component';
import { EventCreateEditModalComponent } from './promotion/event-create-edit-modal.component';
import { EventHistoryComponent } from './promotion/event-history.component';
import { EventEnvelopeComponent } from './envelope/event-envelope.component';
import { ParticipantComponent } from './participant/participant.component';
import { SelectDoctypeModalComponent } from './envelope/select-doctype-modal.component';
import { ParticipantListModalComponent } from './participant/participant-listing.component';
import { ParticipantGridComponent } from './participant/participant-grid.component';
import { DownloadDocListComponent } from './envelope/event-downloaddoc.component';
import { ResponseComponent } from './response/response.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
import { EventDetailComponent } from './promotion/event-detail.component';
import { CreateCampaignOrEventComponent } from './promotion/create-campaign-or-event.component';
import { CalendarModule } from 'primeng/calendar';

import { EnvelopeOpeningComponent } from './evaluation/envelope-opening.component';
import { DetailReviewComponent } from './evaluation/detail-review.component';
import { EventReviewComponent } from './evaluation/event-review.component';
import { PopupMessageModalComponent } from './popup-message/popup-message.component';
import { TechnicalCommercialComponent } from './evaluation/technical-commercial-review.component';
import { CompareParticipantComponent } from './evaluation/compare-participant.component';
import { CommitteeComponent } from './committee/committee.component';
import { CommitteeListModalComponent } from './committee/committee-listing.component';
import { CommitteeGridComponent } from './committee/committee-grid.component';
import { CommitteeInfoDetailModalComponent } from './committee/committee-info-detail.component';

import { FinalAwardComponent } from './evaluation/final-award.component';

import { TenderReviewComponent } from './evaluation/tender-review.component';
import { TenderReviewCardComponent } from './evaluation/tender-review-card.component';
import { EventQuestionnaireComponent } from 'app/evaluation/questionnaire/event-questionnaire.component';
import { EvaluationReviewComponent } from './evaluation/evaluation-review.component';
import { SubmissionComponent } from './submission/submission.component';
import { SubmissionDetailComponent } from './submission/submission-detail.component';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        AppFormModule,
        UtilsModule,
        FileUploadModule,
        PrimeNgFileUploadModule,
        EventRoutingModule,
        CountoModule,
        TableModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        AppBsModalModule,
        CalendarModule
    ],
    declarations: [
        EventPromotionComponent,
        EventCreateEditComponent,
        EventItemModalComponent,
        EventEditModalComponent,
        EventGalleryComponent,
        SelectBranchModalComponent,
        CreateOrEditEventGalleryModalComponent,
        EventCreateEditModalComponent,
        EventHistoryComponent,
        ParticipantComponent,
        ParticipantListModalComponent,
        ParticipantGridComponent,
        EventSummaryComponent,
        EventEnvelopeComponent,
        DownloadDocListComponent,
        SelectDoctypeModalComponent,
        ResponseComponent,
        ComplianceComponent,
        EventDetailComponent,
        CreateCampaignOrEventComponent,

        EnvelopeOpeningComponent,
        DetailReviewComponent,
        TechnicalCommercialComponent,
        EventReviewComponent,
        PopupMessageModalComponent,
        CompareParticipantComponent,
        CommitteeComponent,
        CommitteeListModalComponent,
        CommitteeGridComponent,
        CommitteeInfoDetailModalComponent,
        FinalAwardComponent,
        TenderReviewComponent,
        TenderReviewCardComponent,
        EventQuestionnaireComponent,
        EvaluationReviewComponent,
        SubmissionComponent,
        SubmissionDetailComponent
    ],
    providers: [
        TenderCont,
        PaxRegPaxLog,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class EventModule { }
