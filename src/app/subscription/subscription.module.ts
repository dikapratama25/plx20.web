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
import { AccordionModule } from 'primeng/accordion';
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
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { PackageListingComponent } from './package/package-listing.component';
import { PackageCurrentComponent } from './package/package-current.component';
import { PackageOptionComponent } from './package/package-option.component';
import { MySubscriptionComponent } from './package/mysubscription.component';
import { AddServiceModalComponent } from './package/select-service.component';
import { ServiceListModalComponent } from './package/service-listing.component';
import { SelectPackageComponent } from './package/select/select-package.component';
import { PackageCardComponent } from './package/select/package-card.component';

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
        AccordionModule,
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
        SubscriptionRoutingModule
    ],
    declarations: [
        PackageListingComponent,
        PackageCurrentComponent,
        PackageOptionComponent,
        AddServiceModalComponent,
        ServiceListModalComponent,
        MySubscriptionComponent,
        SelectPackageComponent,
        PackageCardComponent
    ],
    exports: [
        SelectPackageComponent,
        PackageCardComponent
    ],
    providers: [
        TreeDragDropService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }
    ]
})
export class SubscriptionModule { }
