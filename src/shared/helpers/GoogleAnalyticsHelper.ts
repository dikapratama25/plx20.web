import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { AppConsts } from '@shared/AppConsts';
import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class GoogleAnalyticsHelper {
    constructor(
        private _gaService: GoogleAnalyticsService,
    ) {
        _gaService.gtag("js", new Date());
        _gaService.gtag("config", AppConsts.gaTrackingCode);
    }

    get Service() {
        return this._gaService;
    }
}


