import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { CreateOrEditBranchModalComponent } from './create-or-edit-branch-modal.component';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  templateUrl: './branch.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./branch.component.less'],
  animations: [appModuleAnimation()]
})
export class BranchComponent extends AppComponentBase implements OnInit {
  @ViewChild('branchList', { static: false }) branchList: BaseListComponent;
  @ViewChild('createOrEditBranchModal', { static: true }) createOrEditBranchModal: CreateOrEditBranchModalComponent;

  gridUrl = ProxyURL.GetBranch;
  permissionView = 'Pages.Company.Branch.View';
  permissionEdit = 'Pages.Company.Branch.Edit';
  permissionDelete = 'Pages.Company.Branch.Delete';

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy
  ) {
    super(injector);
  }

  ngOnInit() {
    this.gridUrl += 'bizRegID=' + this.appStorage.bizRegID + '&';
  }

  refresh() {
    this.branchList.refresh();
  }

  createBranch(): void {
    this.createOrEditBranchModal.show(ModalType.Create);
  }

  viewBranch(event?: any, type?: any): void {
    this.createOrEditBranchModal.show(type === 'view' ? ModalType.View : ModalType.Update, event);
  }

  deleteBranch(event?: any): void {
    let data: any[] = [];
    data.push(event);
    this.message.confirm(
      this.l('BranchDeleteWarningMessage', event.BranchName),
      this.l('AreYouSure'),
      (isConfirmed) => {
        if (isConfirmed) {
          let url = ProxyURL.CreateOrUpdateBranch + 'operation=' + SaveType.Delete + '&';
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
