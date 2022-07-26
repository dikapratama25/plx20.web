import { AfterViewInit, Component, Injector, OnInit, ViewChild,  Pipe, PipeTransform } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import { DomSanitizer, SafeHtml  } from "@angular/platform-browser";

@Component({
    selector: 'previewBillingModal',
    templateUrl: './modal-preview-billing-request.component.html',
    styleUrls: ['./modal-preview-billing-request.component.less'],
    animations: [appModuleAnimation()]
})

export class ModalBillingRequestComponent extends AppComponentBase implements OnInit, AfterViewInit, PipeTransform {
    
    @ViewChild('previewBillingModal', { static: true }) modal: ModalDirective;

    url: any;
    extensionFile: string;

    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }

    ngOnInit(): void {
        
    }

    ngAfterViewInit(): void {
        
    }

    show(data?: any): void {
        this.modal.show();
        this.transform(data);
        this.extensionFile = this.getFileExtension(data.Preview);
    }

    transform(data?: any)  {
        return this.url =  this.sanitizer.bypassSecurityTrustResourceUrl(data.Preview.replace(/\\/g, '/'));
    }

    getFileExtension(fileName: string): string {
        return '.' + fileName.split('.').pop();
    }

    //Need to checked By Rizal if using this method
    // isImage(fileName: string): boolean {
    //     return /^image\//.test(fileName);
    // }

    close(): void {
        this.modal.hide();
    }

}
