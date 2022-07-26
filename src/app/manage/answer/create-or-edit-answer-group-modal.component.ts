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
  selector: 'createOrEditAnswerGroupModal',
  templateUrl: './create-or-edit-answer-group-modal.component.html',
  animations: [appModuleAnimation()]
})
export class CreateOrEditAnswerGroupModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('createOrEditAnswerGroupModal', {static: true}) modal: ModalDirective;
    @ViewChild('catgCombo', {static: false}) catgCombo: ElementRef;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    modalTitle = '';
    isBusy = false;

    catgSelectURL = '';
    catgSelectData: any;

    saveState: number;
    branchCode = '';

    active = false;
    saving = false;
    isBranchActive = false;
    showBtnApproval = false;

    data: any = [];
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
      this.showBtnApproval = false;
      this.inputHelper={};
      this.inputHelper.Description='';
      this.inputHelper.Text='';
      
      // console.log(JSON.stringify(data));
      
      if (data === undefined) {
        this.saveState = SaveType.Insert;        
        this.active = true;
        this.inputHelper.GroupID="XXX";
        this.modal.show();
      } else {
        this.inputHelper=data;
        this.inputHelper.Text = data.Name;
        this.saveState = SaveType.Update;
        this.active = true;        
        this.modal.show();
        
      }
    }

  

    save(): void {
      let url = ProxyURL.CreateUpdateAnswerGroup;
      
     this.inputHelper.BizRegID = this._storage.bizRegID;
     this.inputHelper.BizLocID = this._storage.bizLocID;
     
      // console.log(JSON.stringify(branchData));
      this.saving = true;

      if (url !== undefined) {
        this.spinnerService.show();
          this._proxy.request(url, RequestType.Post, this.inputHelper)
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
