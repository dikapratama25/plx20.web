import { finalize } from 'rxjs/operators';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ModalType, LocationType, SaveType } from '@shared/AppEnums';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'createOrEditLocationModal',
  templateUrl: './create-or-edit-location.component.html'
})
export class CreateOrEditLocationModalComponent extends AppComponentBase {
  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  modalTitle: string;
  modalSubTitle: string;
  isView = false;

  locationType: number;
  locTypeEnum = LocationType;
  saveState: SaveType;

  addOrEditUrl: string;

  inputHelper: any = {};

  selectedCountry: any;
  selectedState: any;
  selectedCity: any;
  selectedArea: any;
  countryList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  areaList: any[] = [];

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy
  ) {
    super(injector);
  }

  show(locType?: any, modalType?: any, countryCode?: string, stateCode?: string, cityCode?: string, locData?: any): void {
    this.locationType = locType;

    if (modalType === ModalType.Create) {
      this.modalTitle = this.l('CreateNewLocation');
      this.saveState = SaveType.Insert;
    } else if (modalType === ModalType.Update) {
      this.modalTitle = this.l('EditLocation');
      this.saveState = SaveType.Update;
      this.inputHelper = locData;
    } else {
      this.modalTitle = this.l('ViewLocation');
      this.isView = true;
      this.inputHelper = locData;
    }

    if (this.locationType === LocationType.Country) {
      this.modalSubTitle = 'Country';
      this.addOrEditUrl = ProxyURL.CreateOrUpdateCountry;
    } else if (this.locationType === LocationType.State) {
      this.modalSubTitle = 'State';
      this.addOrEditUrl = ProxyURL.CreateOrUpdateState;
    } else if (this.locationType === LocationType.City) {
      this.modalSubTitle = 'City';
      this.addOrEditUrl = ProxyURL.CreateOrUpdateCity;
    } else {
      this.modalSubTitle = 'Area';
      this.addOrEditUrl = ProxyURL.CreateOrUpdateArea;
    }

    this.getCountryCombo();
    countryCode !== undefined ? this.getStateCombo(countryCode) : '';
    stateCode !== undefined ? this.getCityCombo(countryCode, stateCode) : '';

    countryCode !== undefined ? this.selectedCountry = countryCode : '';
    stateCode !== undefined ? this.selectedState = stateCode : '';
    cityCode !== undefined ? this.selectedCity = cityCode : '';

    this.active = true;
    this.modal.show();
  }

  save(): void {
    let url = this.addOrEditUrl + 'operation=' + this.saveState + '&';

    let data: any[] = [];
    this.locationType !== LocationType.Country ? this.inputHelper.CountryCode = this.selectedCountry : '';
    this.locationType !== LocationType.Country && this.locationType !== LocationType.State ? this.inputHelper.StateCode = this.selectedState : '';
    this.locationType !== LocationType.Country && this.locationType !== LocationType.State && this.locationType !== LocationType.City ? this.inputHelper.CityCode = this.selectedCity : '';
    this.inputHelper.Active = 1;
    this.inputHelper.Flag = 1;
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

  close(): void {
    this.active = false;
    this.isView = false;
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

  onCountryChanged() {
    this.getStateCombo(this.selectedCountry);
  }

  onStateChanged() {
    this.getCityCombo(this.selectedCountry, this.selectedState);
  }

  onCityChanged() {
  }

}
