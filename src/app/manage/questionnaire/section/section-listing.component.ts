import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { CreateOrEditSectionModalComponent } from './create-or-edit-section-modal.component';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  templateUrl: './section-listing.component.html',
  animations: [appModuleAnimation()]
})
export class SectionlstComponent extends AppComponentBase implements OnInit {
  @ViewChild('sectionList', { static: false }) sectionList: BaseListComponent;
  @ViewChild('createOrEditSectionModal', { static: true }) createOrEditSectionModal: CreateOrEditSectionModalComponent;

  gridUrl = ProxyURL.GetSection;
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
    SecNo: 0,
    Description: '', 
    QuizType: '', 
    Role: '', 
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
        this.questionSet.Role = params.Role;
        this.questionSet.BizRegID = this.appStorage.bizRegID;
        this.questionSet.BizLocID = this.appStorage.bizLocID;
        this.totalWeight = +params.ScoreWeight;
        this.gridUrl = (ProxyURL.GetSection + 'QuizID=' + encodeURIComponent(this.questionSet.QuizID) + '&');
    });
}

  ngOnInit() {
    this.gridUrl;
  }

  refresh() {
    this.sectionList.refresh();
  }

  createSection(): void {
    this.questionSet.Description = '';
    this.questionSet.SecNo = 0;
    this.questionSet.ScoreWeight = 0;
    this.createOrEditSectionModal.show(ModalType.Create, this.questionSet);
  }

  viewSection(event?: any, type?: any): void {
    if (type === 'view') {
      let params ={
        QuizID : event['QuizID'],
        SecNo : event['SecNo'],
        Description : '',
        QuizType : event['QuizType'],
        Role : event['Role'],
        ScoreWeight : event['ScoreWeight'],
        TID : event['TID']
      }
      this._route.navigate(['/app/manage/questions/'], { queryParams: params, skipLocationChange: true });
    } else {
      this.createOrEditSectionModal.show(type === 'view' ? ModalType.View : ModalType.Update, this.questionSet, event);
    }
  }

  deleteSection(event?: any): void {
    let data: any[] = [];
    data.push(event);
    this.message.confirm(
      this.l('SectionDeleteWarningMessage', event.QuestionName),
      this.l('AreYouSure'),
      (isConfirmed) => {
        if (isConfirmed) {
          let url = ProxyURL.DeleteDefaultDTL;
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
