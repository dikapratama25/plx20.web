import { Component, Injector, Input, OnInit, AfterViewInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { CountdownComponent } from 'ngx-countdown';

@Component({
    templateUrl: './tender-review-card.component.html',
    styleUrls: ['./tender-review-card.component.less'],
    selector: 'tender-review-card',
    encapsulation: ViewEncapsulation.None
})

export class TenderReviewCardComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

    @Input() item: any;
    @Output() onDetailClick: EventEmitter<any> = new EventEmitter<any>();

    currency = 'RM';
    open: 0;
    defaultBg = '/assets/images/default-image-bg.svg';

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

    onClick(data: any): void {
        this.onDetailClick.emit(data);
    }

    detail(data: any): void {
        this.onDetailClick.emit(data);
    }
}
