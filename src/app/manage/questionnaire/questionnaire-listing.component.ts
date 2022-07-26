import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { CreateOrEditQuestionhdrModalComponent } from './create-or-edit-questionhdr-modal.component';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  templateUrl: './questionnaire-listing.component.html',
//   encapsulation: ViewEncapsulation.None,
//   styleUrls: ['./question.component.less'],
  animations: [appModuleAnimation()]
})
export class QuestionnairelstComponent extends AppComponentBase implements OnInit {
  @ViewChild('questionList', { static: false }) questionList: BaseListComponent;
  @ViewChild('createOrEditQuestionhdrModal', { static: true }) createOrEditQuestionhdrModal: CreateOrEditQuestionhdrModalComponent;

  gridUrl = ProxyURL.GetQuestionSet;
  actionFlag = 'action';
  permissionView = 'Pages.Questionnaire.View';
  permissionEdit = 'Pages.Questionnaire.Edit';
  permissionDelete = 'Pages.Questionnaire.Delete';

  constructor(
    injector: Injector,
    private _route: Router,
    private _proxy: GenericServiceProxy
  ) {
    super(injector);
  }

  ngOnInit() {
    this.gridUrl;
  }

  refresh() {
    this.questionList.refresh();
  }

  createQuestion(): void {
    this.createOrEditQuestionhdrModal.show(ModalType.Create);
  }

  viewQuestion(event?: any, type?: any): void {
    if (type === 'view') {
      let params ={
        QuizID : event['QuizID'],
        Description : '',
        QuizType : event['QuizType'],
        Role : event['Role'],
        ScoreWeight : event['ScoreWeight']
      }
      this._route.navigate(['/app/manage/section/'], { queryParams: params, skipLocationChange: true });
    } else {
      this.createOrEditQuestionhdrModal.show(type === 'view' ? ModalType.View : ModalType.Update, event);
    }
  }

  deleteQuestion(event?: any): void {
    let data: any[] = [];
    data.push(event);
    this.message.confirm(
      this.l('QuestionsDeleteWarningMessage', event.QuestionName),
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
