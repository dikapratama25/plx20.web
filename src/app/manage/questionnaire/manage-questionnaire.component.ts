import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';
import { CreateOrEditQuestionhdrModalComponent } from './create-or-edit-questionhdr-modal.component';

@Component({
  templateUrl: './manage-questionnaire.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class ManageQuestionnaireComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('manageQuestionnaireComponent', {static: false}) manageQuestionnaireComponent: BaseListComponent;
  @ViewChild('createOrEditQuestionhdrModal', {static: false}) createOrEditQuestionhdrModal: CreateOrEditQuestionhdrModalComponent;
  
  disableCreate = true;
  disableRefresh = true;
  

  //Filters
  advancedFiltersAreShown = false;
  filterText = '';
  flag = true;
  displayBranch = false;
  typeCombo: any[];
  approvalCombo = 'col-md-6';
  gridUrl = ProxyURL.GetQuestionnaireHeaderList;
  afgComboUrl = ProxyURL.GetCompanyCombo;
  afgSelectData: any;
  selectedCompany: any;
  companyCombo: any = [];
  ApprovalStatus: any;
  cols: any[];
  inputHelper: any = {};
  permissionCreate = 'Pages.Manage.AnswerGroup.Create';
  permissionEdit = 'Pages.Manage.AnswerGroup.Edit';
  permissionDelete = 'Pages.Manage.AnswerGroup.Delete';
  permissionView = 'Pages.Manage.AnswerGroup';
  comboQuiz: any[];
  selectedQuizID: any;
  selectedType: any;

  constructor(
      injector: Injector,
      private _proxy: GenericServiceProxy,
      private _activatedRoute: ActivatedRoute,
      private _storage: AppStorage,
      private _route: Router,
  ) {
      super(injector);
      this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
  }

  ngOnInit(): void {

    this.populateQuizCombo();

  }

  populateData() {
    
  }

   ngAfterViewInit(): void {
   

  }

  refresh(event?: any): void {
    
    this.gridUrl = ProxyURL.GetQuestionnaireHeaderList;
    this.manageQuestionnaireComponent.setURL(this.gridUrl);
    this.manageQuestionnaireComponent.refresh();  
  }

  filterApproval(value: number): void {

  }
  back(){
    this._route.navigate(['/app/manage/questionnaire']);
}
  detailQuestionnaire(data?:any){
    let params ={
      QuizID : data.QuizID,
      rowguid : data.rowguid,        
    };
    this._route.navigate(['/app/manage/questionnaire-editor/'], { queryParams: params, skipLocationChange: true });
  }

  create(): void {
    this.createOrEditQuestionhdrModal.show();
  }

  edit(data?: any): void {
    this.createOrEditQuestionhdrModal.show(data);
  }

  delete(data: any): void {
    this.inputHelper=data;
    this.inputHelper.TID='INIT';
    this.inputHelper.SecNo=0;
    this.message.confirm(
      this.l('DataDeleteWarningMessage', data.QuizID),
      this.l('AreYouSure'),
      (isConfirmed) => {
          if (isConfirmed) {
             this.spinnerService.show();
              this._proxy.request(ProxyURL.DeleteDefaultHDR, RequestType.Post, this.inputHelper)
              .pipe(finalize(() => {
                this.spinnerService.hide();
              }))
              .subscribe(() => {
                this.refresh();
                this.notify.success(this.l('SuccessfullyDeleted'));
              });
          }
      }
    );
  }

  refreshFilter(data?: any): void {
    this.manageQuestionnaireComponent.setURL(this.setUrl());
    this.manageQuestionnaireComponent.refresh();
  }

  setUrl(): string {
    let url = ProxyURL.GetQuestionnaireHeaderList;
    (this.selectedQuizID != null || this.selectedQuizID != undefined) ? url += 'quizID=' + encodeURIComponent(this.selectedQuizID) + '&' : 'quizID=null&';
    (this.selectedType != null || this.selectedType != undefined) ? url += 'quizType=' + encodeURIComponent(this.selectedType) + '&' : 'quizType=null&';
  
    return url;
  }

  populateQuizCombo(): void {
    let url = ProxyURL.GetQUestionCombo;
    this._proxy.request(url, RequestType.Get)
      .subscribe((result) => {
        this.comboQuiz = result;
        
      });
    
  }
}
