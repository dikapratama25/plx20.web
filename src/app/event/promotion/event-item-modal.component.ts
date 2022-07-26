import { Table } from 'primeng/table';
import { EventRoutingModule } from '../event-routing.module';
import { SaveType } from '@shared/AppEnums';
import { element } from 'protractor';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Injector, Input, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/public_api';
import { Paginator } from 'primeng/paginator';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { RequestType, GenericServiceProxy } from '@shared/service-proxies/generic-service-proxies';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'eventItemModal',
    templateUrl: './event-item-modal.component.html'
})
export class EventItemModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('dataTable', { read: true, static: false }) dataTable: Table;
    @ViewChild('paginator', { read: true, static: false }) paginator: Paginator;
    @ViewChild('modalRef', { static: false }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    EventMode: number;
    filterText = '';
    isSelectedAll = false;
    selectedAllClass = '';
    script: string;
    viewscript: string;
    item: any = {};
    isBusy = false;
    LineCode: any;
    itemCode: string;
    set: any;
    image: any;
    //Loading: "LOADING IMAGE";


    constructor(
        injector: Injector,
        private __proxy: GenericServiceProxy,
        public _DomSanitizationService: DomSanitizer
    ) {
        super(injector);
    }

    ngOnInit(): void {
        //this.Loading;
        this.primengTableHelper.defaultRecordsCountPerPage = 30;
        this.script = '<!-- CROSSMARQ app Start -->' +
            '|<script type="text/javascript" src="http://10.150.160.88/advertisement/js/crossmarq.js?height=&width=&container=001&type=1&mtype=27id=10" charset="utf-8"></script>' +
            '|<!-- CROSSMARQ app End -->';
    }

    ngAfterViewInit(): void {

    }

    populateData() {
    }

    copytoclipboard(val) {
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        // this.notify.info('Copied to Clipboard', undefined, this.notifyOptions);
    }

    show(data: any, setting: any): void {
        //console.log('data : ' + JSON.stringify(data));
        //console.log('setting : ' + JSON.stringify(setting));
        if (setting != 'preview') {
            this.isBusy = true;
            this.set = setting;
            //console.log('setting : ' + this.set);
            let itemurl = ProxyURL.GetCampaignItemList;
            if (data.CampNo) { itemurl += 'EventNo=' + encodeURIComponent('' + data.CampNo) + '&'; }
            if (data.BizRegID) { itemurl += 'BizRegID=' + encodeURIComponent('' + data.BizRegID) + '&'; }
            if (data.BizLocID) { itemurl += 'BizLocID=' + encodeURIComponent('' + data.BizLocID) + '&'; }
            if (data.ItemCode) { itemurl += 'ItemCode=' + encodeURIComponent('' + data.ItemCode) + '&'; }
            if (data.SeqNo) { itemurl += 'SeqNo=' + data.SeqNo + '&'; }
            if (data.ReqNo) { itemurl += 'ReqNo=' + data.ReqNo + '&' };
            //console.log('url : ' + itemurl);
            this.__proxy.request(itemurl, RequestType.Get)
                .pipe(finalize(() => {
                    // console.log(this._DomSanitizationService.bypassSecurityTrustUrl(this.bannerDoc + this.item.PathRef));
                }))
                .subscribe(result => {
                    this.item = result.items[0];
                    this.viewscript = this.item.ItemDesc_B.replace(/\|/g, "\n");
                    this.isBusy = false;
                });
        } else {
            this.isBusy = true;
            //console.log('Mlebu kene le');
            this.set = setting;
            //console.log('setting : ' + this.set);
            this.image = data.DocPath;
            this.isBusy = false;
            //console.log('data : ' + this.image);
            //let itemurl = ProxyURL.GetEventItemList;
        }
        this.active = true;
        //this.isBusy = false;
        this.modal.show();
    }

    onShown(): void {
        // this.appRootUrl();
    }

    hidediv(): boolean {
        if (this.isGranted('Pages.Event.Channel.Subscribe')) {
            return false;
        } else if (this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
            if (this.item.Status === 0) {
                return true;
            } else if (this.item.Status === 1) {
                return true;
            } else if (this.item.Status === 2) {
                if (this.item.ItemDesc_B !== '') {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    btnHidediv(): boolean {
        if (this.isGranted('Pages.Event.Channel.Create') && this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
            if (this.item.Status === 0) {
                return true;
            } else {
                return false;
            }
        } else if (this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
            if (this.item.Status === 1) {
                return true;
            } else {
                return false;
            }
        }
    }

    setPriceDisabled(): boolean {
        if (this.isGranted('Pages.Event.Channel.Edit.ITEM')) {
            if (this.item.Status === 0) {
                return false;
            } else {
                return true;
            }
        } else {
            if (this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
                if (this.isGranted('Pages.Event.Channel.Create')) {
                    return this.item.Status === 0 || this.item.Status === 2 ? true : false;
                } else {
                    return this.item.Status === 1 || this.item.Status === 2 ? true : false;
                }
            } else {
                return true;
            }
        }
    }

    galleryApprove(status: number): void {
        this.saving = true;
        this.isBusy = true;

        if (status === 99) {
            // Reject Statement
            this.item.Status = status;
        } else {
            // Approve Statement
            if (this.isGranted('Pages.Event.Channel.Create') && this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
                this.item.Status = 1;
            } else if (this.isGranted('Pages.Event.Channel.Gallery.Approve')) {
                this.item.Status = 2;
            }
        }
        this.item.UpdateBy = this.appSession.user.userName;

        this.sendEmail(this.item);

        this.__proxy.request(ProxyURL.UpdateCampaignITEM, RequestType.Post, this.item)
            .pipe(finalize(() => {
                // console.log(this._DomSanitizationService.bypassSecurityTrustUrl(this.bannerDoc + this.item.PathRef));
                // this.modalSave.emit();
                this.saving = false;
                this.isBusy = false;
                this.modalSave.emit();
                this.close();
            }))
            .subscribe(result => {
                if (result) {
                    this.notify.info(this.l('SavedSuccessfully'), undefined);
                } else {
                    this.notify.error(this.l('FailedToSave'), undefined);
                }
            });
    }

    galleryReject(): void {
        this.saving = true;
        this.isBusy = true;
        let data: any[] = [];
        this.item.status = 99;
        this.item.savestate = SaveType.Update;
        this.item.updateby = this.appSession.user.userName;

        data.push(this.item);
        // this._serviceQuote.updItem(data)
        //     .pipe(finalize(() => {
        //         this.saving = false;
        //         this.isBusy = false;
        //     }))
        //     .subscribe((result: boolean) => {
        //         if (result) {
        //             this.notify.info(this.l('SavedSuccessfully'), undefined, this.notifyOptions);
        //             this.modalSave.emit();
        //             this.close();
        //         } else {
        //             this.notify.error(this.l('FailedToSave'), undefined, this.notifyOptions);
        //         }
        //     });
    }

    close(): void {
        this.item = {};
        this.active = false;
        this.modal.hide();
    }

    sendEmail(data) {
        let url = ProxyURL.SubscribeCampaignEmail;

        let emailHelper = {
            MsgID: (data.Status === 1 ? 'Approved-A' : data.Status === 2 ? 'Approved-M' : 'Rejected') + '-' + data.ItemCode,
            EmailAddress: '',
            EventName: data.Banner,
            AffiliateName: data.AffiliatePartner,
            AffiliateBizRegID: data.Status === 2 ? data.BizRegID : '',
            AffiliateBizLocID: data.Status === 2 ? data.BizLocID : '',
            WebsiteName: data.Website,
            Status: data.Status === 1 ? 'Approved by HQ Admin' : data.Status === 2 ? 'Approved by Manager' : 'Rejected',
            Content: data.Status === 99 ? 'A event banner was rejected' : data.Status === 1 ? 'A event banner need manager approval' : 'A event banner has been approved',
            EmailTemplateName : ''
        };

        console.log('Email Helper: ' + JSON.stringify(emailHelper));

        if (url != null) {
            this.__proxy.request(url, RequestType.Post, emailHelper)
                .subscribe(result => { });
        }
    }
}
