import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { CreateOrEditAnswerOptGroupModalComponent } from './create-or-edit-answer-opt-group-modal.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';

@Component({
  templateUrl: './manage-answer-opt-group.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class ManageAnswerOptGroupComponent extends AppComponentBase implements OnInit, AfterViewInit {

  @ViewChild('answerOptGroupComponent', {static: false}) answerOptGroupComponent: BaseListComponent;
  @ViewChild('createOrEditAnswerOptGroupModal', {static: false}) createOrEditAnswerOptGroupModal: CreateOrEditAnswerOptGroupModalComponent;
  
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
  GroupID: string;
  Text: string;
  rowguid: string;


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
      this._activatedRoute.queryParams
      .subscribe(params => {
          
          this.GroupID = params.GroupID;
          this.rowguid = params.rowguid;
          this.Text = params.Text;
      });
  }

  ngOnInit(): void {
    this.populateData();
    this.inputHelper.Text = this.Text;
  }


  populateData() {
    this.gridUrl = ProxyURL.GetAnswerOptGroupList+'GroupID='+this.GroupID+'&';
  }

   ngAfterViewInit(): void {
  }

  refresh(event?: any): void {
    // console.log(this.gridUrl);
    this.answerOptGroupComponent.refresh();
  
  }

  filterApproval(value: number): void {

  }

 
  create(data: any): void {
    //let data:any = {};
    data.GroupID = this.GroupID;
    this.createOrEditAnswerOptGroupModal.show(data);
  }

  edit(data?: any): void {    
    this.createOrEditAnswerOptGroupModal.show(data);
  }

  back(){
    this._route.navigate(['/app/manage/answer']);
}

  delete(data: any): void {
    
    this.message.confirm(
      this.l('DataDeleteWarningMessage', data.Name),
      this.l('AreYouSure'),
      (isConfirmed) => {
          if (isConfirmed) {
             this.spinnerService.show();
              this._proxy.request(ProxyURL.DeleteAnswerOpt+'rowguid='+data.rowguid, RequestType.Post, this.inputHelper)
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

 

}
