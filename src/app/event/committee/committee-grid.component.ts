import { Component, Injector, ViewChild, Input, OnInit,EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { CommiteRoleType } from '@shared/AppEnums';

@Component({
  selector: 'committee-grid',
  templateUrl: './committee-grid.component.html'
})
export class CommitteeGridComponent extends AppComponentBase implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
  @Input() campID = '';
  @Input() reviewerType = 'HSE';//CommiteRoleType.HSE;
  @Input() actionColumn = 'checkbox';
  @Input() customParameter = '';
  @Input() enableFilter = true;
  @Input() detail = false;
  @Output() onDetailClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSelectedChange: EventEmitter<any> = new EventEmitter<any>();


  baseUrl = ProxyURL.GetCommitteeList;
  gridUrl: string;
  checked: any[] = [];

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    let parameter='';
    if(this.customParameter!=''){
      parameter = this.customParameter+'&';
    }

    this.gridUrl = this.baseUrl + 'campid=' + this.campID + '&' + 'reviewerType=' + this.reviewerType + '&'+parameter;
    // this.refresh(this.gridUrl);
    // this.baselist.refresh();
    this.checked = [];
  }

  refresh(url: any) {
    this.gridUrl = url;
    // this.baselist.setURL(this.gridUrl);
    this.baselist.refresh();
    this.baselist.selectedData = [];
    this.checked = [];
  }

  selectAll(): void {
    this.baselist.selectAll();
  }

  check(data: any): void {
    this.checked = data;
    this.onSelectedChange.emit(data);
  }

  detailClick(data: any): void {
    this.onDetailClick.emit(data);
  }

}
