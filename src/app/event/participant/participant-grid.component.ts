import { Component, Injector, ViewChild, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';

@Component({
    selector: 'participant-grid',
    templateUrl: './participant-grid.component.html'
})
export class ParticipantGridComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('baselist', { static: false }) baselist: BaseListComponent;
    @Input() campID = '';
    @Input() detail = false;
    @Input() actionColumn = 'checkbox';
    @Input() enableFilter = true;
    @Output() onDetailClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelectedChange: EventEmitter<any> = new EventEmitter<any>();

    baseUrl = ProxyURL.GetParticipantList;
    gridUrl: string;
    model: any;
    checked: any[] = [];
    included: any[] = [];

    set(data: any) {
        let input = [];
        data.forEach(element => {
            if (!this.baselist.model.records.some(e => e.BizRegID === element.BizRegID)) {
                input.push(element);
            }
        });
        this.baselist.model.records.push(...input);
        this.baselist.model.totalRecordsCount = this.baselist.model.records.length;
    }

    get(){
        return this.baselist.model.records;
    }

    // remove() {
    //   this.checked.forEach(row => {
    //     this.baselist.model.records = this.baselist.model.records.filter(x => x.BizRegID !== row.BizRegID && x.PONo !== row.PONo);
    //   });
    //   this.baselist.model.totalRecordsCount = this.baselist.model.records.length;
    // }

    change() {
        this.checked.forEach(item => {
            this.baselist.model.records.filter(x => x.BizRegID === item.BizRegID).forEach(row => {
                row.IsReq = row.IsReq === 1 ? 0 : 1;
                row.Incumbent = row.Incumbent === 'Yes' ? 'No' : 'Yes';
            });
        });
        this.baselist.model.totalRecordsCount = this.baselist.model.records.length;
    }

    detailClick(data: any): void {
        this.onDetailClick.emit(data);
    }

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.gridUrl = ProxyURL.GetParticipantList + 'campid=' + this.campID + '&';
        const self = this;
    }

    refresh(url: any) {
        this.gridUrl = url;
        this.baselist.setURL(url);
        this.baselist.refresh();
    }

    check(data: any): void {
        this.checked = data;
    }

    onRowSelect(event: any) {
        this.onSelectedChange.emit(event);
    }

}
