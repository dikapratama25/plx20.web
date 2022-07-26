import { finalize } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  selector: 'createOrEditQuestionhdrModal',
  templateUrl: './create-or-edit-questionhdr-modal.component.html'
})
export class CreateOrEditQuestionhdrModalComponent extends AppComponentBase {
  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  modalTitle: string;
  isDisable = false;

  saveState: SaveType;
  inputHelper: any = {
    
    QuizID : '',
    BizRegID : '',
    BizLocID : '',
    QuizType : '',
    Role : '',
    ScoreWeight : 0,
    Description : ''
  };

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _config: NgSelectConfig,
  ) {
    super(injector);
    this._config.notFoundText = this.l('NoResult');
  }

  clear(): void {
    this.inputHelper = {
      QuizID : '',
      BizRegID : '',
      BizLocID : '',
      QuizType : '',
      Role : '',
      ScoreWeight : 0,
      Description : ''
    };
  }

  show(questionData?: any): void {
    this.clear();
    
    if (questionData === undefined) {
      this.modalTitle = this.l('CreateNewQuestions');
      this.inputHelper.QuizID = 'INIT';
      this.inputHelper.BizLocID = 'INIT';
      this.inputHelper.BizRegID = 'INIT';
    } else {
      this.modalTitle = this.l('EditQuestions');
      this.inputHelper = questionData;
    }

    this.active = true;
    this.modal.show();
  }

  save(): void {
    let url = ProxyURL.CreateUpdateDefaultHDR;
    let data: any[] = [];
    // this.inputHelper.QuizID = this.inputHelper.QuizID !== undefined ? this.inputHelper.QuizID : 'xxx';
    data.push(this.inputHelper);
    this.spinnerService.show();
    this._proxy.request(url, RequestType.Post, data)
      .pipe(finalize(() => {
        this.saving = false;
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        if (result.success) {
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
          this.modalSave.emit();
        }
      });
  }

  close(): void {
    this.clear();
    this.isDisable = false;
    this.active = false;
    this.modal.hide();
  }

}
