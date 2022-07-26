import { Component, Injector, Input, OnInit, AfterViewInit, Output, EventEmitter, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';

@Component({
    selector: 'file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class FileUploadComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('fileUpload', { static: true }) fileUpload: FileUpload;
    uploadUrl: string;
    @Input() uploadedFiles: any[] = [];
    @Input() nameParam: string;
    selectedFiles: any[] = [];
    @Input() APIUrl = ProxyURL.FileUpload;
    @Input() pathurl = '';
    @Input() accept = 'image/*, .csv, .xls, .xlsx, .doc, .docx, .pdf, .zip';
    @Input() auto = false;
    @Input() customUpload = false;
    @Input() multiple = true;
    @Input() maxFileSize = 1000000;
    @Input() preview = false;
    @Input() showUploaded = true;
    @Input() showUploadButton = true;
    @Input() uploadIcon = 'la la-upload';
    @Input() showCancelButton = false;
    @Input() cancelIcon = 'la la-times';
    @Input() showChoosenUpload = true;
    @Input() chooseIcon = '';
    @Input() chooseLabel = 'ChoseFileOrDrag';
    @Input() contentTemplate: TemplateRef<any>;
    labelText = this.l(this.chooseLabel);
    @Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUploadHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() downloadError: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRemove: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + this.APIUrl;
    }

    ngAfterViewInit(): void {
    }

    setURL() {
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + this.APIUrl + this.pathurl;
    }
    // upload completed event
    onUploadComplete(event): void {
        this.uploadedFiles = [];
        let responseBody = event.originalEvent.body.result;
        let status = event.originalEvent.status;
        let files = event.files;
        if (status === 200) {
            for (const file of responseBody) {
                if (file.type.indexOf('image/') > -1) {
                    (<any>file).objectURL = files.filter(item => item.name === file.name).map(select => select.objectURL)[0];
                }
                this.uploadedFiles.push(file);
            }
        }
        this.onUpload.emit(this.uploadedFiles);
    }

    onBeforeSend(event): void {
        event.xhr.setRequestHeader('Authorization', 'Bearer ' + abp.auth.getToken());
    }

    onSelected(event: any): void {
        if (this.preview) {
            let lastIndex = event.currentFiles.length - 1;
            let file = event.currentFiles[lastIndex];
            (<any>file).objectURL = this.sanitizer.bypassSecurityTrustResourceUrl((window.URL.createObjectURL(event.currentFiles[lastIndex])));

            if (file.type !== 'application/pdf' && !this.fileUpload.isImage(file)) {
                let extension = file.name.split('.')[file.name.split('.').length - 1];
                let name = file.name.replace(extension, '');
                (<any>file)._name = name + '.temp.' + this.appSession.userId + '.' + Date.now().toString() + '.' + extension;
            }
        }

        this.onSelect.emit(this.fileUpload.files);
    }

    remove(event, file) {
        let fileIndex = this.fileUpload.files.indexOf(file);
        this.fileUpload.remove(event, fileIndex);
        this.onSelect.emit(this.fileUpload.files);
    }

    uploadHandler(event?: any) {
        if (event === undefined) { this.startUpload(); }
        this.onUploadHandler.emit();
    }

    startUpload() {
        this.fileUpload.upload();
    }

    clearUpload() {
        this.fileUpload.clear();
    }

    DownloadError(): void {
        this.downloadError.emit();
    }

    removeAll(event?: any) {
        if (event === undefined) { this.fileUpload.clear(); }
        this.onRemove.emit();
    }
}
