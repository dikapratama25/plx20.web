import { AfterViewInit, Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { GenericServiceProxy, RequestType } from "@shared/service-proxies/generic-service-proxies";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { ProxyURL } from './../../../shared/service-proxies/generic-service-proxies-url';



@Component({
    selector: 'editVendorCustomerModal',
    templateUrl: './edit-modal-vendor-customer.component.html',
    animations: [appModuleAnimation()]
})

export class EditModalVendorCustomerComponent extends AppComponentBase implements OnInit, AfterViewInit {
    
    @ViewChild('editVendorCustomerModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    title: string;
    titleBanned: string;
    status: boolean;

    inputHelper: any = {};

    constructor(
        injector: Injector,
        private _proxy: GenericServiceProxy
    ) {
        super(injector);
    }
    
    ngOnInit(): void {
        
    }
    
    ngAfterViewInit(): void {
        
    }

    close(): void {
        this.modal.hide();
    }

    show(data: any, type: any): void {
        console.log(data);
        //console.log(type);
        if (type == 1) {
            this.title = this.l("EditVendor");
            this.titleBanned = this.l("BanVendor");
        } else {
            this.title = this.l("EditCustomer");
            this.titleBanned = this.l("BanCustomer");
        }

        if (data.Status == "Banned") {
            this.status = false;
        } else {
            this.status = true;
        }
        this.modal.show();
        this.inputHelper.ID = data.ID;
        this.inputHelper = data;
        this.inputHelper.TypeCode = type;
    }

    save(): void {
        this.spinnerService.show();
        let data: any = {};
        
        data.BizregID = this.appStorage.bizRegID;
        data.PaxRegID = this.inputHelper.ID;
        //parse default PaxUserID first
        data.PaxUserID = 0;
        data.TypeCode = this.inputHelper.TypeCode;

        //console.log(data);
        let url = ProxyURL.EditVendorCustomer;
        this._proxy.request(url, RequestType.Post, data)
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe((result) => {
            console.log(result);
            if(result) {
                this.notify.success(this.l('SavedSuccessfully'));
                this.modalSave.emit();
                this.close()
            } else {
                this.notify.error(this.l('Failed'));
            }
        })
    }
    
}