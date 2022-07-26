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
  selector: 'createOrEditAnswerOptGroupModal',
  templateUrl: './create-or-edit-answer-opt-group-modal.component.html',
  animations: [appModuleAnimation()]
})
export class CreateOrEditAnswerOptGroupModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('createOrEditAnswerOptGroupModal', {static: true}) modal: ModalDirective;
    

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
      
      console.log(data);
      this.inputHelper.Description='';
      this.inputHelper.Text='';
      this.inputHelper.Value=0;
      this.inputHelper.ScoreDefault=0;
      this.inputHelper.OptID='';
      this.GroupID = data.GroupID;
      this.selectedAnswer="";
      // console.log(JSON.stringify(data));
      this.populateDataAnswer();
      this.modal.show();
    }

  
    populateDataAnswer(){
      let url = ProxyURL.GetAnswerOptCombo;
      if (url !== undefined) {
        this.spinnerService.show();
          this._proxy.request(url, RequestType.Get)
          .pipe(finalize(() => {
            this.saving=false;
            this.spinnerService.hide();
          }))
          .subscribe((result) => {
            console.log(result);
            this.answerList = result;
            
          });
      }

    }

    onAnswerChange(data?:any){
      console.log(data);

      let dataTemp = data;
      
      if(data!==undefined){
        if((data.OptID===undefined) || data.OptID===null){
          this.isDisable = false;
          
        }else{
          this.isDisable = true;
        }
        this.inputHelper = data;
      }else{
        this.inputHelper.Description='';
        this.inputHelper.Text='';
        this.inputHelper.Value=0;
        this.inputHelper.ScoreDefault=0;
        this.inputHelper.OptID='';
        this.selectedAnswer='';
      }
      console.log(this.selectedAnswer);
      
      
    }

    save(): void {
      let url = ProxyURL.CreateAssignAnswerOptGroup;
      let data : any = {};
     this.inputHelper.BizRegID = this._storage.bizRegID;
     this.inputHelper.BizLocID = this._storage.bizLocID;
     this.inputHelper.OptID = this.inputHelper.OptID === undefined ? 'XXX' : this.inputHelper.OptID;

      data.AnswerOpt = this.inputHelper;
      data.GroupID = this.GroupID;

      // console.log(JSON.stringify(branchData));
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
