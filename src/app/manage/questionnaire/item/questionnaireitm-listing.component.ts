import { questionerMode } from './../../../shared/form/questionnaire/questionnaire-field.component';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { CreateOrEditQuestionItmModalComponent } from './create-or-edit-questionitm-modal.component';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  templateUrl: './questionnaireitm-listing.component.html',
  animations: [appModuleAnimation()]
})
export class QuestionnaireitmComponent extends AppComponentBase implements OnInit {
  @ViewChild('questionItem', { static: false }) questionItem: BaseListComponent;
  @ViewChild('createOrEditQuestionItmModal', { static: true }) createOrEditQuestionItmModal: CreateOrEditQuestionItmModalComponent;

  gridUrl = ProxyURL.GetQuestions;
  actionFlag = 'action';
  permissionView = 'Pages.Questionnaire.View';
  permissionEdit = 'Pages.Questionnaire.Edit';
  permissionDelete = 'Pages.Questionnaire.Delete';
  currWeight = 0;
  totalWeight = 0;
  questionSet = {
    QuizID: '', 
    BizRegID: '', 
    BizLocID: '',
    TID: '',
    SecNo: 0,
    GrpNo: 0,
    SeqNo: 0,
    QuizType: '', 
    QuizValue: '', 
    OptType: '', 
    OptValue: '', 
    Title: '', 
    Description: '', 
    ScoreWeight: 0
  };

  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _route: Router,
    private _proxy: GenericServiceProxy
  ) {
    super(injector);
    this._activatedRoute.queryParams
    .subscribe(params => {
        this.questionSet.QuizID = params.QuizID;
        this.questionSet.QuizType = params.QuizType;
        this.questionSet.SecNo = params.SecNo;
        this.questionSet.BizRegID = this.appStorage.bizRegID;
        this.questionSet.BizLocID = this.appStorage.bizLocID;
        this.questionSet.TID = params.TID;
        this.totalWeight = +params.ScoreWeight;
        this.gridUrl = (ProxyURL.GetQuestions + 'QuizID=' + encodeURIComponent(params.QuizID) + '&SecNo=' + encodeURIComponent(params.SecNo) + '&');
    });
  }

  ngOnInit() {
    this.gridUrl;
  }

  refresh() {
    this.questionItem.refresh();
  }

  createQuestion(): void {
    this.questionSet.Description = '';
    this.questionSet.GrpNo = 0;
    this.questionSet.ScoreWeight = 0;
    this.createOrEditQuestionItmModal.show(ModalType.Create, this.questionSet);
  }

  viewQuestion(event?: any, type?: any): void {
    this.createOrEditQuestionItmModal.show(type === 'view' ? ModalType.View : ModalType.Update, this.questionSet, event);
  }

  deleteQuestion(event?: any): void {
    let data: any[] = [];
    data.push(event);
    this.message.confirm(
      this.l('QuestionDeleteWarningMessage', event.QuestionName),
      this.l('AreYouSure'),
      (isConfirmed) => {
        if (isConfirmed) {
          let url = ProxyURL.DeleteDefaultHDR;
          this._proxy.request(url, RequestType.Post, data)
            .subscribe(() => {
              this.refresh();
              this.notify.success(this.l('SuccessfullyDeleted'));
            });
        }
      }
    );
  }

}
