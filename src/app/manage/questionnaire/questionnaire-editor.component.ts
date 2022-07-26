import { Component, Injector, Input, OnInit, AfterViewInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { CountdownComponent } from 'ngx-countdown';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { CardListComponent } from '@app/shared/form/card/card-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { ActivatedRoute,Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CreateOrEditQuestionsetModalComponent } from './create-or-edit-questionset-modal.component';

@Component({
    templateUrl: './questionnaire-editor.component.html',
    styleUrls: ['./questionnaire-editor.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class QuestionnaireEditorComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @ViewChild('questionnaireListComponents', { static: false }) questionnaireListComponents: BaseListComponent;
    @ViewChild('createOrEditQuestionsetModal', {static: false}) createOrEditQuestionsetModal: CreateOrEditQuestionsetModalComponent;

    id = '20190425000VMZ4X';
    data: any;
    gridUrl = ProxyURL.GetAuctionList;
    questionnaireListUrl = '';
    eventID: string;
    secNo: string;
    grpNo: string;
    campID: string = '2020051916RKSLOE';
    QuizID:string;

    permissionCreate = 'Pages.Manage.AnswerGroup.Create';
    permissionEdit = 'Pages.Manage.AnswerGroup.Edit';
    permissionDelete = 'Pages.Manage.AnswerGroup.Delete';
    permissionView = 'Pages.Manage.AnswerGroup';
  
    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer,
        private _proxy: GenericServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _route: Router,
    ) {
        super(injector);
        this._activatedRoute.queryParams
        .subscribe(params => {
            this.QuizID = params.QuizID;
        });
    }

    ngOnInit(): void {
        this.questionnaireListUrl = (ProxyURL.GetQuestionnaireList + 'QuizID=' + encodeURIComponent(this.QuizID) + '&');
    }

    ngAfterViewInit(): void {
        this.refresh();
    }

    updateQuestionnaireList(): void{
        let url = this.questionnaireListUrl;
        url += ((this.secNo != undefined && this.secNo != '')? ('secNo=' + encodeURIComponent(this.secNo) + '&') : '');
        url += ((this.grpNo != undefined && this.grpNo != '')? ('grpNo=' + encodeURIComponent(this.grpNo) + '&') : '');
        
        this.questionnaireListComponents.setURL(url);
        this.questionnaireListComponents.refresh();
    }

    clearQuestionnaireFilter(): void{
        
        this.secNo = '';
        this.grpNo = '';
        this.updateQuestionnaireList();
    }

    refresh(event?: any): void {
        
        this.gridUrl = this.questionnaireListUrl;
        this.questionnaireListComponents.setURL(this.gridUrl);
        this.questionnaireListComponents.refresh();  
    }
        
    onClick(data: any): void {
    }

    onDownloadDoc(): void {
    }

    create(): void {
        this.createOrEditQuestionsetModal.show(this.QuizID);
    }

    edit(data?: any): void {
        this.createOrEditQuestionsetModal.show(this.QuizID, data);
    }

    delete(data: any): void {
        
        let dataSend: any = [];
        dataSend.push(data);
        this.message.confirm(
            this.l('DataDeleteWarningMessage', data.Question),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    this._proxy.request(ProxyURL.DeleteQuestionItem, RequestType.Post, dataSend)
                    .pipe(finalize(() => {
                    this.spinnerService.hide();
                    }))
                    .subscribe(() => {
                    this.refresh();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }

    back(){
        this._route.navigate(['/app/manage/questionnaire']);
    }
}
