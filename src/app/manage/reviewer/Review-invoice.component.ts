import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, AfterContentChecked, ChangeDetectorRef, Input, ElementRef, Inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    templateUrl: './Review-invoice.component.html',
    styleUrls: ['./Review-invoice.component.less'],
    encapsulation: ViewEncapsulation.None
  })

  export class reviewInvoice extends AppComponentBase implements OnInit, AfterViewInit {
    constructor(injector: Injector) {
        super(injector);
    }
    ngOnInit(): void {
    }
    ngAfterViewInit(): void {
    }
  }