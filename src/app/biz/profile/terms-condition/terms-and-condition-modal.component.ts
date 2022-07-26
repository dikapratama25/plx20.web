import { Component, Injector, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
//import { TermsAndConditionsComponent } from '@app/manage/profile/terms-and-conditions.components'

@Component({
    selector: 'termsAndConditionModal',
    templateUrl: './terms-and-condition-modal.component.html'
})

export class TermsAndConditionModalComponent extends AppComponentBase {

    @ViewChild('tncmodal', { static: true }) termsAndConditionModal: ModalDirective;

    active: boolean = false;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    show(): void {
        this.active = true;
        this.termsAndConditionModal.show();
      }

    hide(): void {
        this.active = false;
        this.termsAndConditionModal.hide();
    }

}
