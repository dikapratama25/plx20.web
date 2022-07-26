import { Component, OnInit, AfterViewInit, EventEmitter, Injector, Output, ElementRef, ViewChild, ViewEncapsulation, Type } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';

@Component({
    selector: 'terms-and-conditions',
    templateUrl: './terms-and-conditions.component.html',
    styleUrls: ['./profile.component.less'],
    animations: [appModuleAnimation()]
})

export class TermsAndConditionsComponent extends AppComponentBase {
   
    constructor(
        injector: Injector,
    ) {
        super(injector);
    }

    
}