import { finalize } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  selector: 'createOrEditQuestionItmModal',
  templateUrl: './create-or-edit-questionitm-modal.component.html'
})
export class CreateOrEditQuestionItmModalComponent extends AppComponentBase {
  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  modalTitle: string;
  isView = false;
  isDisable = true;

  saveState: SaveType;
  inputHelper: any = {};

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _config: NgSelectConfig,
  ) {
    super(injector);
    this._config.notFoundText = 'No Result';
  }

  show(type?: any, setData?: any, questionData?: any): void {
    if (type === ModalType.Create) {
      this.modalTitle = this.l('CreateNewQuestion');
      this.saveState = SaveType.Insert;
      this.setCreate(setData);
    } else if (type === ModalType.Update) {
      this.modalTitle = this.l('EditQuestion');
      this.saveState = SaveType.Update;
      this.setData(questionData);
    } else {
      this.modalTitle = this.l('ViewQuestion');
      this.setData(questionData);
      this.isView = true;
    }

    this.active = true;
    this.modal.show();
  }

  setCreate(data: any) {
    if (data !== undefined) {
      this.inputHelper = data;
    }
  }

  setData(data: any) {
    if (data !== undefined) {
      this.inputHelper = data;
    }
  }

  save(): void {
    let url = ProxyURL.CreateUpdateDefaultQuestion;
    let data: any[] = [];
    data.push(this.inputHelper);

    this._proxy.request(url, RequestType.Post, data)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((result) => {
        if (result.success) {
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
          this.modalSave.emit();
        }
      });
  }

  resetForm() {
    this.inputHelper = {};
  }

  close(): void {
    this.resetForm();
    this.isView = false;
    this.active = false;
    this.modal.hide();
  }

}
