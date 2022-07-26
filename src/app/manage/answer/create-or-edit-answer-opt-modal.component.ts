import { finalize } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ViewChild, Output, Injector, Component, EventEmitter, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { SaveType } from '@shared/AppEnums';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';

@Component({
  selector: 'createOrEditAnswerOptModal',
  templateUrl: './create-or-edit-answer-opt-modal.component.html',
  animations: [appModuleAnimation()]
})
export class CreateOrEditAnswerOptModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('createOrEditAnswerOptModal', {static: true}) modal: ModalDirective;
    

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    modalTitle = '';
    isBusy = false;

    catgSelectURL = '';
    catgSelectData: any;

    saveState: number;
    branchCode = '';
    GroupID : any;
    active = false;
    saving = false;
    isBranchActive = false;
    showBtnApproval = false;
    isDisable = true;
    selectedAnswer : any="";
    data: any = [];
    answerList: any = [];
    inputHelper: any = {};
    updateNotify = 'UpdateSuccessfully';

    permissionCreate = 'Pages.Manage.AnswerGroup.Create';
    permissionEdit = 'Pages.Manage.AnswerGroup.Edit';

    disableBtnApproval = true;

    constructor(
      injector: Injector,
      private _proxy: GenericServiceProxy,
      private _storage: AppStorage
    ) {
        super(injector);
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
      
    }

    show(data?: any): void {
      this.inputHelper={};
      if(data!==undefined){
         this.inputHelper = data;
      }
      this.modal.show();
    }

    save(): void {
      let url = ProxyURL.CreateAssignAnswerOptGroup;
      let data : any = {};
     this.inputHelper.BizRegID = this._storage.bizRegID;
     this.inputHelper.BizLocID = this._storage.bizLocID;
     this.inputHelper.OptID = this.inputHelper.OptID === undefined ? 'XXX' : this.inputHelper.OptID;

      data.AnswerOpt = this.inputHelper;
      
      this.saving = true;

      if (url !== undefined) {
        this.spinnerService.show();
          this._proxy.request(url, RequestType.Post, data)
          .pipe(finalize(() => {
            this.saving=false;
            this.spinnerService.hide();
          }))
          .subscribe((result) => {
            if (result.success) {
              this.notify.info(this.l('SavedSuccessfully'));
              this.modalSave.emit();
              this.close();
            } else {
              this.notify.info(this.l('FailedToSave'));
            }
          });
      }
    }

    

    close(): void {
      this.modal.hide();
    }
}
