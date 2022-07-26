import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from "@shared/common/app-component-base";
import { Component, Injector, Input, OnInit, ViewChild,ViewEncapsulation,AfterViewInit  } from '@angular/core';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
//import { finalize } from 'rxjs/operators';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';
import { Title } from '@angular/platform-browser';
import { GoogleAnalyticsHelper } from '@shared/helpers/GoogleAnalyticsHelper';

@Component({
    templateUrl: './cta.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./cta.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class ctaComponent extends AppComponentBase implements OnInit {

userProfileParams: {
    userID: string,
    tenantID: string
};


constructor (
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _route: ActivatedRoute,
    private _ga: GoogleAnalyticsHelper,
    private _pageTitleServ: Title,
) {
    super(injector);
    this._pageTitleServ.setTitle("IQOS");
}

ngOnInit() {

}

ngAfterViewInit() {
    // document.addEventListener('DOMContentLoaded',function(){
            let curLocation1 = window.location.href,
            itemCode = ["IQOS2PLUS","IQOS3DUO","IQOS3DUO1"];
            let curLocation = curLocation1.split('=');
            let boxIQOS = document.querySelectorAll('[id^="boxIQOS"] > a:first-child');

            for(let i=0;i < boxIQOS.length;i++){
               let curA = boxIQOS[i].getAttribute('href');
               boxIQOS[i].setAttribute('href',curA+'?id='+curLocation[1]+'&itemCode='+itemCode[i]);
            }

            let allImg = document.querySelectorAll('img');
            for(let i=0;i < allImg.length;i++){
            let curSrc = allImg[i].getAttribute('src');
            allImg[i].setAttribute('src',curSrc + '?' + (new Date()).getTime());
            }
        // })
}

iqosAngkasaOnClick() {
    this._ga.Service.event('link_click_IQOS_Angkasa', 'IQOS', 'IQOS Link Angkasa Click');
}

iqosLazadaOnClick() {
    this._ga.Service.event('link_click_IQOS_Lazada', 'IQOS', 'IQOS Link Lazada Click');
}

linkIQOS24QuestilOnClick() {
    this._ga.Service.event('link_click_IQOS24_Questil', 'IQOS_2_4_Plus', 'Link IQOS 2.4 Plus Questil Click')
}

linkIQOS24LazadaOnClick() {
    this._ga.Service.event('link_click_IQOS24_Lazada', 'IQOS_2_4_Plus', 'Link IQOS 2.4 Plus Lazada Click')
}

linkIQOS3DuoQuestilOnClick() {
    this._ga.Service.event('link_click_IQOS3Duo_Questil', 'IQOS_3_Duo', 'Link IQOS 3 Duo Questil Click')
}

linkIQOS3DuoLazadaOnClick() {
    this._ga.Service.event('link_click_IQOS3Duo_Lazada', 'IQOS_3_Duo', 'Link IQOS 3 Duo Lazada Click')
}

linkIQOS3MultiQuestilOnClick() {
    this._ga.Service.event('link_click_IQOS3Multi_Questil', 'IQOS_3_Multi', 'Link IQOS 3 Multi Questil Click')
}

linkIQOS3MultiLazadaOnClick() {
    this._ga.Service.event('link_click_IQOS3Multi_Lazada', 'IQOS_3_Multi', 'Link IQOS 3 Multi Lazada Click')
}


}
