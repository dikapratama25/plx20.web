import { NgSelectConfig } from '@ng-select/ng-select';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { ActivatedRoute } from '@angular/router';
import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { BaseListComponent } from '@app/shared/form/list/base-list.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { CreateOrEditLocationModalComponent } from './create-or-edit-location.component';
import { LocationType, ModalType, SaveType } from '@shared/AppEnums';

@Component({
  templateUrl: './location.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./location.component.less'],
  animations: [appModuleAnimation()]
})
export class LocationComponent extends AppComponentBase implements OnInit {
  @ViewChild('locationList', { static: false }) locationList: BaseListComponent;
  @ViewChild('createOrEditLocationModal', { static: true }) createOrEditLocationModal: CreateOrEditLocationModalComponent;

  gridUrl: string;
  deleteUrl: string;
  permissionView = 'Pages.Location.View';
  permissionEdit = 'Pages.Location.Edit';
  permissionDelete = 'Pages.Location.Delete';

  locationType: number;
  locTypeEnum = LocationType;

  selectedCountry: any;
  selectedState: any;
  selectedCity: any;
  selectedArea: any;
  countryList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  areaList: any[] = [];

  modelHelper: {} = {};

  constructor(
    injector: Injector,
    private _proxy: GenericServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private _config: NgSelectConfig
  ) {
    super(injector);
    if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'country').length > 0) {
      this.locationType = LocationType.Country;
      this.gridUrl = ProxyURL.GetCountry;
      this.deleteUrl = ProxyURL.CreateOrUpdateCountry;
    } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'state').length > 0) {
      this.locationType = LocationType.State;
      this.deleteUrl = ProxyURL.CreateOrUpdateState;
    } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'city').length > 0) {
      this.locationType = LocationType.City;
      this.deleteUrl = ProxyURL.CreateOrUpdateCity;
    } else if (this._activatedRoute.snapshot.url.map(x => x.path).filter(x => x === 'area').length > 0) {
      this.locationType = LocationType.Area;
      this.deleteUrl = ProxyURL.CreateOrUpdateArea;
    }
    this._config.notFoundText = 'No Result';
   }

  ngOnInit() {
    this.getCountryCombo();
  }

  refresh() {
    this.locationList.refresh();
  }

  createLocation(): void {
    this.createOrEditLocationModal.show(this.locationType, ModalType.Create, this.selectedCountry, this.selectedState, this.selectedCity);
  }

  viewLocation(event?: any, type?: any): void {
    this.createOrEditLocationModal.show(this.locationType, type === 'view' ? ModalType.View : ModalType.Update, this.selectedCountry, this.selectedState, this.selectedCity, event);
  }

  deleteLocation(event?: any): void {
    let data: any[] = [];
    data.push(event);
    this.message.confirm(
      this.l('LocationDeleteWarningMessage'),
      this.l('AreYouSure'),
      (isConfirmed) => {
        if (isConfirmed) {
          this.deleteUrl += 'operation=' + SaveType.Delete + '&';
          this._proxy.request(this.deleteUrl, RequestType.Post, data)
            .subscribe(() => {
              this.refresh();
              this.notify.success(this.l('SuccessfullyDeleted'));
            });
        }
      }
    );
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
    if (this.locationType === LocationType.State) {
      this.gridUrl = ProxyURL.GetStateList + 'countryCode=' + this.selectedCountry + '&';
      setTimeout(() => {
        this.locationList.refresh();
      }, 30);
    } else {
      this.getStateCombo(this.selectedCountry);
    }
  }

  onStateChanged() {
    if (this.locationType === LocationType.City) {
      this.gridUrl = ProxyURL.GetCity + 'countryCode=' + this.selectedCountry + '&' + 'stateCode=' + this.selectedState + '&';
      setTimeout(() => {
        this.locationList.refresh();
      }, 30);
    } else {
      this.getCityCombo(this.selectedCountry, this.selectedState);
    }
  }

  onCityChanged() {
    if (this.locationType === LocationType.Area) {
      this.gridUrl = ProxyURL.GetAreaList + 'countryCode=' + this.selectedCountry + '&' + 'stateCode=' + this.selectedState + '&' + 'cityCode=' + this.selectedCity + '&';
      setTimeout(() => {
        this.locationList.refresh();
      }, 30);
    }
  }

}
