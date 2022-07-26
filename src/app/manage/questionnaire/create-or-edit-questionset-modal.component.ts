import { finalize, filter } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewChild, Output, EventEmitter,AfterViewInit } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';


@Component({
  selector: 'createOrEditQuestionsetModal',
  templateUrl: './create-or-edit-questionset-modal.component.html'
})
export class CreateOrEditQuestionsetModalComponent extends AppComponentBase  {
  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
  @ViewChild('answerOptGroupComponent', { static: false }) answerOptGroupComponent: BaseListComponent;
  

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  gridUrl = ProxyURL.GetAnswerOptGroupList;
  active = false;
  saving = false;
  modalTitle: string;
  isDisable = false;
  isDisableSec = false;
  isDisableGrp = false;
  currSecNo = 0;
  currGrpNo = 0;
  saveState: SaveType;
  inputHelper: any = {};
  sectionList: any = [];
  groupList: any = [];
  answerList: any = [];
  roleList: any = [];
  selectedSection: any;
  selectedGroup: any;
  selectedAnswer: any;
  selectedRole: any;
  QuizID:any = '';
  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _config: NgSelectConfig,
    private _route: Router,
  ) {
    super(injector);
    this._config.notFoundText = this.l('NoResult');
  }

  clear() {
    this.inputHelper = {
      BizRegID: '',
      BizLocID: '',
      SecNo: '',
      SecDesc: '',
      GrpNo: '',
      GrpDesc: '',
      QstNo: '',
      ScoreWeight: 0,
      QuizType: '',
      Role: '',
      Question: '',
      OptValue: '',
      OptGroupID: '',
      TID: '',
    };
    this.selectedAnswer = '';
    this.selectedGroup = '';
    this.selectedSection = '';
    this.selectedRole = '';
    this.isDisableGrp=false;
    this.isDisableSec=false;
  }

  show(QuizID: string, questionData?: any): void {
    this.populateDataAnswer();
    this.populateDataSection(QuizID);
    
    this.populateDataRole();
    this.clear();
    this.QuizID = QuizID;
    
    if (questionData === undefined) {
      this.modalTitle = this.l('CreateNewQuestions');
      this.saveState = SaveType.Insert;
      this.inputHelper.QuizID = QuizID;
      this.inputHelper.BizRegID = 'INIT';
      this.inputHelper.BizLocID = 'INIT';
      this.inputHelper.TID = 'INIT';
    } else {
      this.modalTitle = this.l('EditQuestions');
      this.saveState = SaveType.Update;
      
      this.selectedSection = questionData.SecNo;
      this.populateDataGroup(QuizID);
      this.selectedGroup = questionData.GrpNo;
      this.selectedAnswer = questionData.OptGroupID;
      this.selectedRole = questionData.Role !== '' ? parseInt(questionData.Role) : '';
      this.inputHelper = questionData;
      this.isDisableGrp=true;
      this.isDisableSec=true;
    }

    // questionData !== undefined && questionData['SecDesc'] !== undefined ? this.selectedSection = questionData['SecDesc'] : '';
    // questionData !== undefined && questionData['GrpDesc'] !== undefined ? this.selectedGroup = questionData['GrpDesc'] : '';
    // questionData !== undefined && questionData['OptValue'] !== undefined ? this.selectedAnswer = questionData['OptValue'] : '';
    this.active = true;
    this.modal.show();
    this.populateAnswerList(this.selectedAnswer);
  }


  populateDataAnswer() {
    let url = ProxyURL.GetAnswerGroupCombo;
    if (url !== undefined) {
      this.spinnerService.show();
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          this.saving = false;
          this.spinnerService.hide();
        }))
        .subscribe((result) => {
          this.answerList = result;
        });
    }
  }

  populateDataSection(QuizID: string) {
    let url = ProxyURL.GetSectionCombo + "quizID=" + QuizID;
    if (url !== undefined) {
      this.spinnerService.show();
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          this.saving = false;
          this.spinnerService.hide();
        }))
        .subscribe((result) => {
          this.sectionList = result;
        });
    }
  }

  populateDataGroup(QuizID: string) {
    if((this.selectedSection!=='') && (this.selectedSection!=='Auto Generated')){
      let section=this.selectedSection;
      if(this.selectedSection==null){
        section=999999;
      }
      let url = ProxyURL.GetGroupCombo + "quizID=" + QuizID+'&secNo='+section;
      if (url !== undefined) {
        this.spinnerService.show();
        this._proxy.request(url, RequestType.Get)
          .pipe(finalize(() => {
            this.saving = false;
            this.spinnerService.hide();
          }))
          .subscribe((result) => {
            this.groupList = result;
          });
      }
    }
   
  }

  populateDataRole() {
    let url = ProxyURL.GetComboOrganizationUnit;
    if (url !== undefined) {
      this.spinnerService.show();
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          this.spinnerService.hide();
        }))
        .subscribe((result) => {

          this.roleList = result;
        });
    }
  }

  populateAnswerList(data?: any) {
      this.gridUrl = ProxyURL.GetAnswerOptGroupList + 'GroupID=' + data + '&';
      this.answerOptGroupComponent.setURL(this.gridUrl);
      this.answerOptGroupComponent.refresh();
  }

  addAnswer(data) {
    let newData = { 
      Description: data,
      GrpNo: 'Auto Generated',
      OptType: '',
      OptValue: '',
      QuizType: '',
      Remark: '',
      ScoreWeight: 1,
      SecNo: '',
      rowguid: '',
    };
    this.selectedGroup = newData;
    return newData;
  }

  onAnswerChange(data?: any) {
    
    if (data !== undefined) {
      this.inputHelper.OptValue = data.Text;
      this.inputHelper.OptGroupID = data.GroupID;
      this.populateAnswerList(data.GroupID);
    } else {
      this.inputHelper.OptValue = '';
      this.inputHelper.OptGroupID = '';
    }
  }

  addGroup(data) {
    let newData = { 
      Description: data,
      GrpNo: 'Auto Generated',
      OptType: '',
      OptValue: '',
      QuizType: '',
      Remark: '',
      ScoreWeight: 1,
      SecNo: '',
      rowguid: '00000000-0000-0000-0000-000000000000',
    };
    this.selectedGroup = newData;
    return newData;
  }

  onGroupChange(data?: any) {

    if (data !== undefined) {
      if((data.GrpNo !== 'Auto Generated') && (data.GrpNo !== '')){
        this.inputHelper.GrpNo = data.GrpNo;
        this.inputHelper.SecNo = this.selectedSection;
      }
        this.inputHelper.rowguidgrp = data.rowguid;
        this.inputHelper.GrpDesc = data.Description; 
  } else {
    this.inputHelper.GrpNo = '';
    this.inputHelper.GrpDesc = '';
    this.inputHelper.rowguidgrp = '00000000-0000-0000-0000-000000000000';
  }
  }

  addSection(data){
    let newData = { rowguid: '00000000-0000-0000-0000-000000000000', SecNo:'Auto Generated', QuizType: '', Description: data, Remark: '', Role: '', ScoreWeight: null };
    this.selectedSection = newData;
    return newData;
  }

  onSectionChange(data?: any) {
    
    if (data !== undefined) {
      this.inputHelper.GrpNo='';
      this.selectedGroup='';
      if((data.SecNo !== 'Auto Generated') && (data.SecNo !== '')){
        this.inputHelper.SecNo = data.SecNo;
        
      }
      this.inputHelper.rowguiddtl = data.rowguid;
      this.inputHelper.SecDesc = data.Description;
      this.inputHelper.Role = data.Role;
      this.inputHelper.QuizType = data.QuizType;
      this.selectedRole = data.Role !== '' ? parseInt(data.Role) : '';
      
    } else {
      this.inputHelper.rowguiddtl = '';
      this.inputHelper.SecNo = '';
      this.inputHelper.SecDesc = '';
      this.inputHelper.GrpDesc = '';
      this.inputHelper.GrpNo='';
      this.selectedGroup='';
    }
    this.populateDataGroup(this.QuizID);
  }

  onRoleChange(data?: any) {
    
    if (data !== undefined) {
      this.inputHelper.Role = data.code;
      this.inputHelper.QuizType = data.remark;
    } else {
      this.inputHelper.Role = '';
      this.inputHelper.QuizType = '';
    }
  }

  save(): void {
    let url = ProxyURL.CreateAssignQuestion;
    let data: any = {};
    data = this.inputHelper;
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

  resetForm() {
    this.inputHelper = {};
  }

  close(): void {
    this.resetForm();
    this.isDisable = false;
    this.active = false;
    this.modal.hide();
  }

  manageAnswer() {
    this._route.navigate(['/app/manage/answer/'], { skipLocationChange: true });
  }

}
