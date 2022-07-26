import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { CreateOrEditAnswerOptGroupModalComponent } from './create-or-edit-answer-opt-group-modal.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { finalize } from 'rxjs/operators';

@Component({
  templateUrl: './manage-answer-opt.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class ManageAnswerOptComponent extends AppComponentBase implements OnInit, AfterViewInit {

  @ViewChild('answerOptComponent', {static: false}) answerOptComponent: BaseListComponent;
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
    this.gridUrl = ProxyURL.GetAnswerOptList;
  }

   ngAfterViewInit(): void {
  }

  refresh(event?: any): void {
    // console.log(this.gridUrl);
    this.answerOptComponent.refresh();
  
  }

  filterApproval(value: number): void {

  }


  edit(data?: any): void {    
    this.createOrEditAnswerOptGroupModal.show(data);
  }

 
  create(data: any): void {
    //console.log(data);
  }

  delete(data: any): void {
    
    this.message.confirm(
      this.l('DataDeleteWarningMessage', data.Name),
      this.l('AreYouSure'),
      (isConfirmed) => {
          if (isConfirmed) {
             this.spinnerService.show();
              this._proxy.request(ProxyURL.UnassignAnswerOptGroup+'rowguid='+data.rowguid, RequestType.Post, this.inputHelper)
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
