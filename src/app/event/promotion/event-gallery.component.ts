import { getDate } from 'ngx-bootstrap/chronos/utils/date-getters';
import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { LazyLoadEvent } from 'primeng/public_api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GalleryComponent, selectMode } from '@app/shared/form/gallery/gallery.component';
import { SelectBranchModalComponent } from './select-branch-modal.component';
import { CreateOrEditEventGalleryModalComponent } from './create-or-edit-event-gallery.component'
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ThemeSelectionPanelComponent } from '@app/shared/layout/theme-selection/theme-selection-panel.component';
import { AppStorage } from '@app/shared/form/storage/app-storage.component';
// import { UploaderComponent } from '@app/shared/form/uploader/uploader.component';

@Component({
    templateUrl: './event-gallery.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class EventGalleryComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('gallery', { static: false }) gallery: GalleryComponent;
    // @ViewChild('uploader', { static: false }) uploader: UploaderComponent;
    @ViewChild('uploader', { static: true }) uploader: FileUpload;
    @ViewChild('selectBranchModal', { static: false }) selectBranchModal: SelectBranchModalComponent;
    @ViewChild('createOrEditEventGalleryModal', { static: false }) CreateOrEditEventGalleryModal: CreateOrEditEventGalleryModalComponent;
    @ViewChild('baseList', { static: false }) baseList: BaseListComponent;

    galleryUrl: string;
    APIUrl = ProxyURL.DocumentFileUpload + 'ACS\\Images\\Banner\\';
    eventNo: string;
    uploadFormAreShown = false;
    type: number;
    option: string;
    dimension: string;
    dimensionType: string;
    dimensionTypeFilter: string;
    maxSize: string;
    maxSizeByte: number;
    dataDimensionList: any[] = [];
    dataDimensionListFiltered: any[] = [];
    dataDimensionType: any[] = [];
    dataDimensionTypeFilter: any[] = [];
    galleryType: number;
    isBusy = false;
    accept = 'image/*';
    CodeDesc: any;

    expiryDate: Date;
    thisDate: Date;
    expired: boolean;
    listStyle: string;
    gridStyle: string;
    listType = 1;
    permissionEdit = 'Pages.Event.Channel.Gallery.Upload';
    permissionDelete = 'Pages.Event.Channel.Gallery.Upload';
    selectMode = selectMode.none;

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _route: Router,
        private __proxy: GenericServiceProxy,
        private _storage: AppStorage
    ) {
        //super(injector, _cdref, _proxy, _fileDownloadService, _activatedRoute, _httpClient);
        super(injector);
        if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'event').length > 0) {
            this._activatedRoute.params.subscribe(params => {
                const code = params['id'];
                this.eventNo = code;
            });
            this.type = 1;
        } else {
            this.type = 0;
        }
    }

    ngOnInit(): void {
        this._activatedRoute.queryParams
            .subscribe(params => {
                this.selectMode = params.selectedMode;
            })

        //console.log('mode : ' + this.selectMode)

        setTimeout(() => {
            this.thisDate = new Date();
            this.expired = false;
            this.listType = 1;
            this.setListButtonStyle(this.listType);
            this.populateSelect();
            this.dimensionTypeFilter = 'All';
        }, 100);
    }

    ngAfterViewInit(): void {
        //console.log('campno : ' + this.eventNo);
        if (this.eventNo) {
            let hdrurl = ProxyURL.GetCampaignList + 'EventNo=' + this.eventNo + '&';
            this.__proxy.request(hdrurl, RequestType.Get)
                .pipe(finalize(() => {
                    //console.log('url : ' + this.galleryUrl);
                    this.gallery.refresh(this.galleryUrl);
                }))
                .subscribe(result => {
                    this.expiryDate = result.items[0].ExpiryDate;
                    this.galleryType = result.items[0].CampType;
                    this.galleryUrl = ProxyURL.GetCompanyDocument + 'campno=' + this.eventNo + '&' + 'category=' + this.galleryType + '&' + 'mode=1' + '&';
                    let dateNow = new Date();
                    if (dateNow >= new Date(result.items[0].ExpiryDate)) {
                        this.expired = true;
                    } else {
                        this.expired = false;
                    }
                });
        } else {
            // setTimeout(() => {
            //     this.galleryUrl = ProxyURL.GetCompanyDocument;
            //     this.gallery.refresh(this.galleryUrl);
            // }, 50);
            //this.selectMode;
            // setTimeout(() => {
            //     this.galleryUrl = ProxyURL.GetCompanyDocument;
            //     this.__proxy.request(this.galleryUrl, RequestType.Get)
            //     .subscribe(result => {
            //         console.log('result : ' + JSON.stringify(result));
            //     })
            // }, 50);
        }
    }

    setListButtonStyle(type: number): void {
        this.listType = type;

        //console.log('number : ' + this.listType);
        if (this.listType === 0) {
            this.listStyle = "btn-success";
            this.gridStyle = "btn-outline-success";
        } else {
            this.listStyle = "btn-outline-success";
            this.gridStyle = "btn-success";
            if (this.isGranted('Pages.Event.Channel.Gallery.Upload')) {
                setTimeout(() => {
                    this.galleryUrl = ProxyURL.GetCompanyDocument;
                    this.gallery.refresh(this.galleryUrl);
                }, 50);
            }
        }
    }

    setListButtonStyleA(): void {
        this.gridStyle = "btn-success";
    }

    private populateSelect(): void {
        let url = ProxyURL.GetCodeMasterCombo + 'code=BND';
        this.__proxy.request(url, RequestType.Get)
            .pipe(finalize(() => {
                this.isBusy = false;
                // this.refresh();
            }))
            .subscribe(result => {
                this.dataDimensionList = result;
                this.dataDimensionType = this.dataDimensionList.map(item => item.CodeRef).filter((value, index, self) => self.indexOf(value) === index);
                this.dataDimensionTypeFilter = this.dataDimensionList.map(item => item.CodeRef).filter((value, index, self) => self.indexOf(value) === index);
                this.dataDimensionTypeFilter.unshift('All');
                this.CodeDesc = result.CodeDesc;
            });
    }

    refresh(): void {
        if (this.dimensionTypeFilter !== 'All') {
            this.galleryUrl = ProxyURL.GetCompanyDocument + 'category=' + this.galleryType + '&type=' + this.dimensionTypeFilter + '&';
        } else {
            this.galleryUrl = ProxyURL.GetCompanyDocument + 'category=' + this.galleryType + '&';
        }
        this.baseList.gridUrl = this.galleryUrl;
        this.baseList.refresh();
    }

    onDimensionTypeChanged(): void {
        this.dataDimensionListFiltered = this.dataDimensionList.filter(x => x.CodeRef === this.dimensionType).sort((a, b) => {
            if (a.CodeSeq < b.CodeSeq) {
                return -1;
            } else if (a.CodeSeq > b.CodeSeq) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    onDimensionChanged(): void {
        this.maxSize = this.dataDimensionList.filter(x => x.Code === this.dimension).map(y => y.CodeVal3).toString();
        this.maxSizeByte = +this.maxSize * 1000;
    }

    back(): void {
        if (this.type === 0) {
            this._route.navigate(['/app/event/create/']);
        } else {
            this._route.navigate(['/app/event/subscribe/' + this.eventNo]);
        }
    }

    selectWebsite(event: any): void {
        //console.log('Expired:' + this.isGranted('Pages.Event.Channel.Subscribe').toString());
        //console.log('Expired:' + this.expired.toString());
        if (this.isGranted('Pages.Event.Channel.Subscribe') && this.expired === false) {
            this.selectBranchModal.show(this.eventNo, event);
        }
    }

    uploadData(event: any): void {
        // console.log(event);
        // let uploadedData: any = [];
        // event.forEach(data => {
        //     let x: any = {};
        //     x.DocCode = 'xxx';
        //     x.BizRegID = '242659-T';
        //     x.DocType = 'BND';
        //     x.Description = data.file.name.split('.')[0];
        //     x.PathRef = AppConsts.imageRoute + data.file.name;
        //     uploadedData.push(x);
        // });
        // console.log(JSON.stringify(uploadedData));
    }

    uploadAll(event: any): void {
        let uploadedData: any = [];
        event.forEach(data => {
            let x: any = {};
            x.DocCode = data.id;
            x.BizRegID = this._storage.bizRegID;
            x.DocType = 'BND';
            x.DocMode = this.dimension;
            x.Description = data.name.split('.')[0];
            // x.PathRef = AppConsts.imageRoute + data.id + '_' + data.name.split(' ').join('_');
            x.CreateBy = this.appSession.user.name;
            x.Status = 1;
            x.DocNo = this.dimensionType = 'Rectangle' ? '2' : '1';
            uploadedData.push(x);
        });
        this.__proxy.request(ProxyURL.AddDocument_A, RequestType.Post, uploadedData)
            .pipe(finalize(() => {
                this.isBusy = false;
                this._route.navigate(['/app/event/gallery/']);
            }))
            .subscribe(result => {
                this.notify.success(this.l('SuccessfullySaved'));
            });
    }

    edit(data: any): void {
        this.CreateOrEditEventGalleryModal.show(data);
    }

    delete(data: any): void {
        let obj: any = [];
        data.Active = 0;
        data.Flag = 0;
        data.DocNo = this.dimensionType = 'Rectangle' ? '2' : '1';
        //console.log(JSON.stringify(data));
        obj.push(data);
        this.message.confirm(
            this.l('DataDeleteWarningMessage', data.Description),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this.__proxy.request(ProxyURL.DeleteDocument_A, RequestType.Post, obj)
                        .subscribe(() => {
                            this.refresh();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }
}
