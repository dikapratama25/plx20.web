import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { CreateOrEditAnswerGroupModalComponent } from './create-or-edit-answer-group-modal.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  templateUrl: './manage-answer.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class ManageAnswerComponent extends AppComponentBase implements OnInit, AfterViewInit {

  @ViewChild('answerGroupComponent', {static: false}) answerGroupComponent: BaseListComponent;
  @ViewChild('createOrEditAnswerGroupModal', {static: false}) createOrEditAnswerGroupModal: CreateOrEditAnswerGroupModalComponent;
  @ViewChild('affiliateCombo', {static: false}) affiliateCombo: ElementRef;
  
  disableCreate = true;
  disableRefresh = true;

  //Filters
  advancedFiltersAreShown = false;
  filterText = '';
  flag = true;
  displayBranch = false;
  typeCombo: any[];

  approvalCombo = 'col-md-6';

  //gridUrl = ProxyURL.GetCompanyLocation + 'approvalstatus=' + -1 + '&';
  afgComboUrl = ProxyURL.GetCompanyCombo;

  afgSelectData: any;
  selectedCompany: any;
  companyCombo: any = [];
  ApprovalStatus: any;
  gridUrl: string;
  selectedAnswer: any;
  comboAnswerName: any[];
  startDate = undefined;
  endDate = undefined;


  permissionCreate = 'Pages.Manage.AnswerGroup.Create';
  permissionEdit = 'Pages.Manage.AnswerGroup.Edit';
  permissionDelete = 'Pages.Manage.AnswerGroup.Delete';
  permissionView = 'Pages.Manage.AnswerGroup';

  cols: any[];

  inputHelper: any = {};

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
   
    this.populateData();

    this.populateAnswerCombo();

  }

  populateData() {
    this.gridUrl = ProxyURL.GetAnswerGroupList;
  }

   ngAfterViewInit(): void {
   

  }

  refresh(event?: any): void {
    // console.log(this.gridUrl);
    this.answerGroupComponent.refresh();
  
  }

  filterApproval(value: number): void {

  }

  detailAnswer(data?:any){
      let params ={
        GroupID : data.GroupID,
        rowguid : data.rowguid,
        Text : data.Name
      };

      if(this.isGranted('Pages.Manage.AnswerGroup.AssignAnswerOpt')){
        this._route.navigate(['/app/manage/answer-opt-group/'], { queryParams: params, skipLocationChange: true });
      }

  }


  create(): void {
    this.createOrEditAnswerGroupModal.show();
  }

  edit(data?: any): void {    
    this.createOrEditAnswerGroupModal.show(data);
  }


  delete(data: any): void {
    this.inputHelper=data;
    this.inputHelper.BizRegID=this._storage.bizRegID;
    this.inputHelper.BizLocID=this._storage.bizLocID;
    
    this.message.confirm(
      this.l('DataDeleteWarningMessage', data.Name),
      this.l('AreYouSure'),
      (isConfirmed) => {
          if (isConfirmed) {
             this.spinnerService.show();
              this._proxy.request(ProxyURL.DeleteAnswerGroup, RequestType.Post, this.inputHelper)
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
    this.answerGroupComponent.setURL(this.setUrl());
    this.answerGroupComponent.refresh();
  }

  setUrl(): string {
    let url = ProxyURL.GetAnswerGroupList;
    (this.selectedAnswer != null || this.selectedAnswer != undefined) ? url += 'id=' + encodeURIComponent(this.selectedAnswer) + '&' : 'id=null&';
    (this.startDate != undefined || this.startDate != null) ? url += 'filterFrom=' + encodeURIComponent(moment(new Date(this.startDate)).format('YYYY-MM-DD')) + '&' : 'filterFrom=null&';
    (this.endDate != undefined || this.endDate != null) ? url += 'filterTo=' + encodeURIComponent(moment(new Date(this.endDate)).format('YYYY-MM-DD')) + '&' : 'filterTo=null&';
    return url;
  }

  populateAnswerCombo(): void {
    let url = ProxyURL.GetAnswerCombo;
        this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
            this.comboAnswerName = result;
        })
  }

}
