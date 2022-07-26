import { Component, Injector, ViewChild, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { finalize } from 'rxjs/operators';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
import { AppConsts } from '@shared/AppConsts';
import { HttpClient } from '@angular/common/http';
import { SelectSupportdocModalComponent } from '../select-supportdoc/select-supportdoc.component';

@Component({
  selector: 'supportDocumentModal',
  templateUrl: './support-document.component.html',
  styleUrls: ['./support-document.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class SupportDocumentModalComponent extends AppComponentBase {
  @ViewChild('selectSupportdocModal', { static: true }) selectSupportdocModal: SelectSupportdocModalComponent;
  @ViewChild('supportDocsModal', { static: true }) modal: ModalDirective;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('baselistTab', { static: false }) baselistTab: BaseListComponent;

  active = false;
  saving = false;
  flag: number = 0;
  totalData = 0;
  totalDataFilled = 0;
  uploadedAll = false;
  urlSupportingDocs: string;
  permissionDelete = 'Pages.Biz.Profile';
  downloadFlag = 'false';
  actionFlag = 'action';
  accept = 'image/*, .csv, .xls, .xlsx, .doc, .docx, .pdf, .zip';
  DropZone = this.l('DropZone');
  uploadUrl = ProxyURL.SaveDocumentsBusiness;

  constructor(
      injector: Injector,
      private _storage: AppStorage,
      private _httpClient: HttpClient,
      private _proxy: GenericServiceProxy
  ) {
      super(injector);
  }

  show(): void {
    this.active = true;
    this.modal.show()
    this.init();
  }

  init() {
    this.populateDocList();
    this.populateDocrequired();
  }

  populateDocList() {
    var quizId = this.setting.get('App.Entity.VendorManagement.RegisterSupportingDoc');
    this.urlSupportingDocs = ProxyURL.GetDocumentsBusiness + '&bizreg=' + this.appStorage.bizRegID + '&bizloc=' + this.appStorage.bizLocID + '&quizid=20210406XVXUM7&';// + quizId + '&';
    this.baselistTab.setURL(this.urlSupportingDocs);
    this.baselistTab.refresh();
  }

  populateDocrequired() {
    let url = ProxyURL.GetDocumentsBusiness + 'bizreg=' + this.appStorage.bizRegID + '&bizloc=' + this.appStorage.bizLocID + '&isList=0';

    this.totalDataFilled = 0;
    let data: any = [];
    if (url != null) {
      this._proxy.request(url, RequestType.Get)
        .pipe(finalize(() => {
          //    this.spinnerService.hide();
        }))
        .subscribe(result => {
          if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
              if (result[i].DocNo != null) {
                this.totalDataFilled++;
              }
            }
            this.totalData = result.length;
            if (this.totalData === this.totalDataFilled) {
              this.uploadedAll = true;
            } else {
              this.uploadedAll = false;
            }
          }
        });
    }
  }

  onDownloadClick(data: any): void {
    if (data.PathRef === null || data.PathRef === '' || data.Status === 'Not Uploaded') {
      this.notify.error(this.l('DocumentUnavailable'));
    } else {
      let url = data.PathRef;
      url = url.replace(/\\/g, '/');
      window.open(url, '_blank');
    }
  }

  delete(data: any, mode: any = 0): void {
    if (data != null) {
      if (data.DocNo != null) {
        this.message.confirm(
          this.l('DataDeleteWarningMessage', data.Description),
          this.l('AreYouSure'),
          isConfirmed => {
            if (isConfirmed) {
              let url = ProxyURL.DeleteDocEnvelopeFile + 'docNo=' + data.DocNo;
              this._proxy.request(url, RequestType.Get)
                .pipe(finalize(() => {
                  this.populateDocList();
                }))
                .subscribe(result => {
                  if (result) {
                    this.notify.success(this.l('SuccessfullyDeleted'));
                  } else {
                    this.notify.error(this.l('FailedToDeleted'));
                  }
                });
            }
          }
        );
      } else {
        this.notify.error(this.l('NoFileToDeleted'));
        this.populateDocList();
      }
    }
  }

  uploadHandlers(choosen?: any): void {
    this.spinnerService.show();
    const formData: FormData = new FormData();
    const file = choosen.fileRaw[0];
    let filename = formData.append('file', file, file.name);
    formData.append('data', choosen.data.id);
    formData.append('bizregid', this.appStorage.bizRegID);
    formData.append('bizlocid', this.appStorage.bizLocID);

    this.uploadUrl = AppConsts.remoteServiceBaseUrl + ProxyURL.SaveDocumentsBusiness;
    this._httpClient
      .post<any>(this.uploadUrl, formData)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(response => {
        if (response.success) {
          this.notify.success(this.l('UploadSuccess'));
        } else if (response.error != null) {
          this.notify.error(this.l('UploadFail'));
        }
      });
  }

  onUploadError(): void {
    this.notify.error(this.l('UploadFail'));
  }

  dealWithFiles(data?: any) {
    if (data.length > 0) {
      this.selectSupportdocModal.show(data, this.appStorage.bizRegID, this.appStorage.bizLocID);
    }
  }

  close(): void {
    this.active = false;
    this.modal.hide();
  }
}
