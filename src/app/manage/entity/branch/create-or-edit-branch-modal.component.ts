import { finalize } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalType, SaveType } from '@shared/AppEnums';

@Component({
  selector: 'createOrEditBranchModal',
  templateUrl: './create-or-edit-branch-modal.component.html'
})
export class CreateOrEditBranchModalComponent extends AppComponentBase {
  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
  @ViewChild('branchCountryNgSelect', { static: false }) branchCountryNgSelect: NgSelectComponent;
  @ViewChild('branchStateNgSelect', { static: false }) branchStateNgSelect: NgSelectComponent;
  @ViewChild('branchCityNgSelect', { static: false }) branchCityNgSelect: NgSelectComponent;
  @ViewChild('branchAreaNgSelect', { static: false }) branchAreaNgSelect: NgSelectComponent;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  modalTitle: string;
  isView = false;

  saveState: SaveType;

  inputHelper: any = {};

  selectedBranchCountry: any;
  selectedBranchState: any;
  selectedBranchCity: any;
  selectedBranchArea: any;
  countryList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  areaList: any[] = [];

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _config: NgSelectConfig,
  ) {
    super(injector);
    this._config.notFoundText = 'No Result';
  }

  show(type?: any, branchData?: any): void {
    console.log('BranchData: ' + JSON.stringify(branchData));
    if (type === ModalType.Create) {
      this.modalTitle = this.l('CreateNewBranch');
      this.saveState = SaveType.Insert;
    } else if (type === ModalType.Update) {
      this.modalTitle = this.l('EditBranch');
      this.saveState = SaveType.Update;
      this.setData(branchData);
    } else {
      this.modalTitle = this.l('ViewBranch');
      this.setData(branchData);
      this.isView = true;
    }
    this.getCountryCombo();

    this.active = true;
    this.modal.show();
  }

  setData(data: any) {
    if (data !== undefined) {
      this.inputHelper = data;
      this.selectedBranchCountry = data.Country;
      this.getStateCombo(data.Country);
      this.selectedBranchState = data.State;
      this.getCityCombo(data.Country, data.State);
      this.selectedBranchCity = data.City;
      this.getAreaCombo(data.Country, data.State, data.City);
      this.selectedBranchArea = data.Area;
    }
  }

  save(): void {
    let url = ProxyURL.CreateOrUpdateBranch + 'operation=' + this.saveState + '&';
    let data: any[] = [];
    this.inputHelper.BizRegID = this.appStorage.bizRegID;
    this.inputHelper.BizLocID = this.saveState === SaveType.Insert ? 'xxx' : this.inputHelper.BizLocID;
    this.inputHelper.Country = this.selectedBranchCountry;
    this.inputHelper.State = this.selectedBranchState;
    this.inputHelper.City = this.selectedBranchCity;
    this.inputHelper.Area = this.selectedBranchArea;
    data.push(this.inputHelper);

    this._proxy.request(url, RequestType.Post, data)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((result) => {
        if (result.success) {
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
          this.modalSave.emit();
        }
      });
  }

  resetForm() {
    this.inputHelper = {};
    this.selectedBranchCountry = '';
    this.selectedBranchState = '';
    this.selectedBranchCity = '';
    this.selectedBranchArea = '';
  }

  close(): void {
    this.resetForm();
    this.isView = false;
    this.active = false;
    this.modal.hide();
  }

  getCountryCombo() {
    let url = ProxyURL.GetCountryCombo;
    if (url !== undefined) {
      this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
          this.countryList = result;
        });
    }
  }

  getStateCombo(countryCode?: string) {
    let url = ProxyURL.GetStateCombo;
    countryCode !== undefined ? url += 'countryCode=' + countryCode + '&' : '';
    if (url !== undefined) {
      this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
          this.stateList = result;
        });
    }
  }

  getCityCombo(countryCode?: string, stateCode?: string) {
    let url = ProxyURL.GetCityCombo;
    countryCode !== undefined ? url += 'countryCode=' + countryCode + '&' : '';
    stateCode !== undefined ? url += 'stateCode=' + stateCode + '&' : '';
    if (url !== undefined) {
      this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
          this.cityList = result;
        });
    }
  }

  getAreaCombo(countryCode?: string, stateCode?: string, cityCode?: string) {
    let url = ProxyURL.GetAreaCombo;
    countryCode !== undefined ? url += 'countryCode=' + countryCode + '&' : '';
    stateCode !== undefined ? url += 'stateCode=' + stateCode + '&' : '';
    cityCode !== undefined ? url+= 'areaCode=' + cityCode + '&' : '';
    if (url !== undefined) {
      this._proxy.request(url, RequestType.Get)
        .subscribe((result) => {
          this.areaList = result;
        });
    }
  }

  onBranchCountryChanged(): void {
    this.getStateCombo(this.selectedBranchCountry);
  }

  onBranchStateChanged(): void {
    this.getCityCombo(this.selectedBranchCountry, this.selectedBranchState);
  }

  onBranchCityChanged(): void {
    this.getAreaCombo(this.selectedBranchCountry, this.selectedBranchState, this.selectedBranchCity);
  }
}
