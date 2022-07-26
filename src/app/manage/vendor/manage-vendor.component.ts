import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { finalize } from 'rxjs/operators';
import { ModalVendorManagementComponent } from './add-modal-vendor.component';
import { EditModalVendorCustomerComponent } from './edit-modal-vendor-customer.component';

@Component({
    templateUrl: './manage-vendor.component.html',
    animations: [appModuleAnimation()]
})

export class VendorManagementComponent extends AppComponentBase implements OnInit, AfterViewInit {
    
    @ViewChild('baselistVendor', { static: false }) baselistVendor: BaseListComponent;
    @ViewChild('baselistCustomer', { static: false }) baselistCustomer: BaseListComponent;
    @ViewChild('addVendorModal', { static: false }) addVendorModal: ModalVendorManagementComponent;
    @ViewChild('editVendorCustomerModal', { static: false }) editVendorCustomerModal: EditModalVendorCustomerComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

    gridUrl: string;
    type: string;
    title: string;
    comboVendor: any[];
    comboCountryName: any[];
    selectedVendor: string;
    selectedCountry: string;

    permissionAddVendor = 'Pages.Manage.Vendor.Create';
    permissionEditVendor = 'Pages.Manage.Vendor.Edit';
    permissionDeleteVendor = 'Pages.Manage.Vendor.Delete';
    permissionAddCustomer = 'Pages.Manage.Customer.Create';
    permissionEditCustomer = 'Pages.Manage.Customer.Edit';
    permissionDeleteCustomer = 'Pages.Manage.Vendor.Delete';

    constructor(
        injector: Injector,
        private _activedRoute: ActivatedRoute,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
        if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'manage-vendor').length > 0) {
            this.type = "1";
            this.title = this.l('VendorManagement');
        } else if (this._activedRoute.snapshot.url.map(x => x.path).filter(x => x === 'manage-customer').length > 0) {
            this.type = "2";
            this.title = this.l('CustomerManagement');
        }
        console.log(this.type); 
    }
    
    ngOnInit(): void {
        //console.log(this.appStorage);    
        this.populateData();
    }
    
    ngAfterViewInit(): void {
        this.getVendorCombo();

        this.getCountryCombo();
    }

    populateData(): void {
        this.gridUrl = ProxyURL.GetVendorList + 'bizregid=' + this.appStorage.bizRegID + '&' + 'type=' + this.type + '&';
    }

    update(): void {
        this.addVendorModal.show(this.type);
    }

    refresh(): void {
        this.gridUrl = ProxyURL.GetVendorList + 'bizregid=' + this.appStorage.bizRegID + '&' + 'type=' + this.type + '&';
        this.baselistVendor.gridUrl = this.gridUrl;
    }

    saveItem() {
        this.modalSave.emit();
        this.close();
        if (this.type == "1") {
            this.baselistVendor.refresh();
        } else {
            this.baselistCustomer.refresh();
        }
        //this.refresh();
    }

    close(): void {
        this.modalClose.emit(null);
        this.addVendorModal.close();
    }

    editVendor(data: any): void {
        //console.log(data);
        this.editVendorCustomerModal.show(data, this.type);
    }

    deleteVendor(data: any): void {
        //console.log(data);
        this.spinnerService.show();
        let dataInput: any = {};

        dataInput.BizregID = this.appStorage.bizRegID;
        dataInput.PaxRegID = data.ID;
        //parse default PaxUserID first
        dataInput.PaxUserID = 0;
        dataInput.TypeCode = this.type;

        //console.log(dataInput)
        let url = ProxyURL.EditVendorCustomer + 'type=1&';
        this._proxy.request(url, RequestType.Post, dataInput)
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe((result) => {
            if(result) {
                this.notify.success(this.l('SavedSuccessfully'));
                this.baselistVendor.refresh();
            } else {
                this.notify.error(this.l('Failed'));
            }
        })
    }

    editCustomer(data: any): void {
        //console.log(data);
        this.editVendorCustomerModal.show(data, this.type);
    }

    deleteCustomer(data: any): void {
        this.spinnerService.show();
        let dataInput: any = {};

        dataInput.BizregID = this.appStorage.bizRegID;
        dataInput.PaxRegID = data.ID;
        //parse default PaxUserID first
        dataInput.PaxUserID = 0;
        dataInput.TypeCode = this.type;

        console.log(dataInput)
        let url = ProxyURL.EditVendorCustomer + 'type=1&';
        this._proxy.request(url, RequestType.Post, dataInput)
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe((result) => {
            if(result) {
                this.notify.success(this.l('SavedSuccessfully'));
                this.baselistCustomer.refresh();
            } else {
                this.notify.error(this.l('Failed'));
            }
        })
    }

    reloadItem() {
        this.modalSave.emit();
        if (this.type == "1") {
            this.baselistVendor.refresh();
        } else {
            this.baselistCustomer.refresh();
        }
    }

    refreshFilter(data?: any): void {
        //console.log(data);
        this.baselistVendor.setURL(this.setUrl());
        this.baselistVendor.refresh();
    }

    // refreshFilterCountry(data?: any): void {
    //     console.log(data);
    //     this.baselistVendor.setURL(this.setUrl());
    //     this.baselistVendor.refresh();
    // }

    setUrl(): string {
        let url = this.gridUrl = ProxyURL.GetVendorList + 'bizregid=' + this.appStorage.bizRegID + '&' + 'type=' + this.type + '&';
        (this.selectedVendor != null || this.selectedVendor != undefined) ? url += 'companyCode=' + encodeURIComponent(this.selectedVendor) + '&' : 'companyCode=null&';
        (this.selectedCountry != null || this.selectedCountry != undefined) ? url += 'countryCode=' + encodeURIComponent(this.selectedCountry) + '&' : 'countryCode=null&';
        return url;   
    }

    getVendorCombo(): void {
        let branchURL = ProxyURL.GetBranchRelationCombo;
        this.spinnerService.show();
        this._proxy.request(branchURL + 'relationType=' + this.type + '&', RequestType.Get)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(result => {
                this.comboVendor = result.result;
            });
    }

    getCountryCombo(): void {
        let url = ProxyURL.GetCountryCombo;
        this._proxy.request(url, RequestType.Get, url)
        .subscribe((result) => {
            this.comboCountryName = result;
        });
    }

}
