import { BizUser, BizEmpLoc } from './bizuser';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import * as localForage from 'localforage';
import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class AppStorageKey {
    static readonly bizUser = 'biz_user';
}

@Injectable()
export class AppStorage {
    private static _biz: BizUser = new BizUser();

    get email(): string {
        return AppStorage._biz.email;
    }
    get bizRegID(): string {
        return AppStorage._biz.bizRegID;
    }
    get bizLocID(): string {
        return AppStorage._biz.bizLocID;
    }
    get companyName(): string {
        return AppStorage._biz.companyName;
    }
    get companyType(): string {
        return AppStorage._biz.companyType;
    }
    get isHost(): number {
        return AppStorage._biz.isHost;
    }
    get branchName(): string {
        return AppStorage._biz.branchName;
    }
    get employeeID(): string {
        return AppStorage._biz.employeeID;
    }
    get employeeLoc(): Observable<BizEmpLoc> {
        return AppStorage._biz.employeeLoc;
    }

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        if (AppStorage._biz) {
            let value = await localForage.getItem<any>(AppStorageKey.bizUser);
            AppStorage._biz = value ? BizUser.fromJS(JSON.parse(value.biz)) : new BizUser();
        }
    }

    public async set(biz: BizUser) {
        let token = await localForage.getItem<any>(AppConsts.authorization.encrptedAuthTokenName);
        if (biz && token) {
            localForage.setItem(AppStorageKey.bizUser,
            {
                biz: JSON.stringify(biz),
                expireDate: token.tokenExpireDate
            }, async function () {
                AppStorage._biz = biz;
            });
        }
    }
}
