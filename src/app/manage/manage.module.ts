import { CreateOrEditLocationModalComponent } from './entity/location/create-or-edit-location.component';
import { LocationComponent } from './entity/location/location.component';
import { CreateOrEditBranchModalComponent } from './entity/branch/create-or-edit-branch-modal.component';
import { BranchComponent } from './entity/branch/branch.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { FileUploadModule } from 'ng2-file-upload';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { DragDropModule } from 'primeng/dragdrop';
import { TreeDragDropService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ManageRoutingModule } from './manage-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CountoModule } from 'angular2-counto';
import { TextMaskModule } from 'angular2-text-mask';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { DropdownModule } from 'primeng/dropdown';
import { AppFormModule } from '@app/shared/form/app-form.module';
import { SelectDoctypeModalComponent } from '@app/manage/profile/select-doctype-modal.component';
import { reviewInvoice } from './reviewer/Review-invoice.component';
// Metronic
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
import { TermsAndConditionsComponent } from '@app/manage/profile/terms-and-conditions.components';
import { ProfileComponent } from '@app/manage/profile/profile.component';
import { ManageAnswerComponent } from './answer/manage-answer.component';
import { CreateOrEditAnswerGroupModalComponent } from './answer/create-or-edit-answer-group-modal.component';
import { CreateOrEditAnswerOptGroupModalComponent } from './answer/create-or-edit-answer-opt-group-modal.component';
import { CreateOrEditAnswerOptModalComponent } from './answer/create-or-edit-answer-opt-modal.component';
import { ManageAnswerOptGroupComponent } from './answer/manage-answer-opt-group.component';
import { ManageAnswerOptComponent } from './answer/manage-answer-opt.component';
import { ManageQuestionnaireComponent } from './questionnaire/manage-questionnaire.component';
import { CreateOrEditQuestionhdrModalComponent } from './questionnaire/create-or-edit-questionhdr-modal.component';
import { QuestionnaireEditorComponent } from './questionnaire/questionnaire-editor.component';
import { CreateOrEditQuestionsetModalComponent } from './questionnaire/create-or-edit-questionset-modal.component';
import { VendorManagementComponent } from './vendor/manage-vendor.component';
import { ModalVendorManagementComponent } from './vendor/add-modal-vendor.component';
import { EditModalVendorCustomerComponent } from './vendor/edit-modal-vendor-customer.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    // suppressScrollX: true
};

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        FileUploadModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        ManageRoutingModule,
        UtilsModule,
        AppCommonModule,
        TableModule,
        TreeModule,
        DragDropModule,
        ContextMenuModule,
        PaginatorModule,
        PrimeNgFileUploadModule,
        AutoCompleteModule,
        EditorModule,
        InputMaskModule,
        NgxChartsModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        DropdownModule,
        AppBsModalModule,
        AppFormModule,
    ],
    declarations: [
        ProfileComponent,
        TermsAndConditionsComponent,
        BranchComponent,
        CreateOrEditBranchModalComponent,
        LocationComponent,
        CreateOrEditLocationModalComponent,
        SelectDoctypeModalComponent,
        reviewInvoice,
        ManageAnswerComponent,
        CreateOrEditAnswerGroupModalComponent,
        CreateOrEditAnswerOptGroupModalComponent,
        ManageAnswerOptGroupComponent,
        ManageAnswerOptComponent,
        CreateOrEditAnswerOptModalComponent,
        ManageQuestionnaireComponent,
        CreateOrEditQuestionhdrModalComponent,
        QuestionnaireEditorComponent,
        CreateOrEditQuestionsetModalComponent,
        VendorManagementComponent,
        ModalVendorManagementComponent,
        EditModalVendorCustomerComponent
    ],
    exports: [
        TermsAndConditionsComponent
    ],
    providers: [
        TreeDragDropService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }
    ]
})
export class ManageModule { }
