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
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { DragDropModule } from 'primeng/dragdrop';
import { TreeDragDropService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CountoModule } from 'angular2-counto';
import { TextMaskModule } from 'angular2-text-mask';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { DropdownModule } from 'primeng/dropdown';
import { AppFormModule } from '@app/shared/form/app-form.module';
// Metronic
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
import { BizRoutingModule } from './biz-routing.module';
import { HomeBizComponent } from './dashboard/home-biz.component';
import { BillingRequestComponent } from './accounting/billing/billing-request.component';
import { BillingUploadComponent } from './accounting/billing/upload/billing-upload.component';
import { BillingHistoryComponent } from './accounting/billing/billing-history.component';
import { ManageOrderComponent } from './accounting/po/manage-order.component';
import { CompanyProfileComponent } from './profile/company-profile.component';
import { EditCompanyProfileModalComponent } from './profile/edit-company-profile.component';
import { ModalBillingRequestComponent } from './accounting/billing/modal-preview-billing-request.component';
import { SupportDocumentModalComponent } from './profile/support-document/support-document.component';
import { SelectSupportdocModalComponent } from './profile/select-supportdoc/select-supportdoc.component';
import { ManageModule } from '@app/manage/manage.module';
import { TermsAndConditionModalComponent } from './profile/terms-condition/terms-and-condition-modal.component'
import { EBiddingComponent } from './profile/ebidding.component';
import { NgxSpinnerModule } from "ngx-spinner";

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
        InputNumberModule,
        NgxChartsModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        DropdownModule,
        AppBsModalModule,
        AppFormModule,
        BizRoutingModule,
        NgxSpinnerModule,
        ManageModule,
    ],
    declarations: [
        HomeBizComponent,
        ManageOrderComponent,
        BillingRequestComponent,
        BillingUploadComponent,
        BillingHistoryComponent,
        CompanyProfileComponent,
        EditCompanyProfileModalComponent,
        SupportDocumentModalComponent,
        SelectSupportdocModalComponent,
        TermsAndConditionModalComponent,
        EBiddingComponent,
        ModalBillingRequestComponent
    ],
    exports: [
    ],
    providers: [
        TreeDragDropService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }
    ]
})
export class BizModule { }
