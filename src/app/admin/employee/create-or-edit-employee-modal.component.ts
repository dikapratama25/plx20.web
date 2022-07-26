import { ProxyURL } from '@shared/service-proxies/generic-service-proxies-url';
import { AfterViewChecked, Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrUpdateUserInput, OrganizationUnitDto, PasswordComplexitySetting, ProfileServiceProxy, UserEditDto, UserRoleDto, UserProfileServiceProxy, GetUserForEditOutput, ProfileListDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IOrganizationUnitsTreeComponentData, OrganizationUnitsTreeComponent } from '../shared/organization-unit-tree.component';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { GenericServiceProxy, RequestType } from '@shared/service-proxies/generic-service-proxies';
import { isConstructorDeclaration } from 'typescript';

@Component({
    selector: 'createOrEditEmloyeeModal',
    templateUrl: './create-or-edit-employee-modal.component.html',
    styles: [`.employee-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditEmployeeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('organizationUnitTree') organizationUnitTree: OrganizationUnitsTreeComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    canChangeUserName = true;
    isTwoFactorEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled');
    isLockoutEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.UserLockOut.IsEnabled');
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
    branchlistModel: any = [];
    selectedBranch: any;
    profile: ProfileListDto = new ProfileListDto();
    refusr: number;

    user: UserEditDto = new UserEditDto();
    roles: UserRoleDto[];
    sendActivationEmail = true;
    setRandomPassword = true;
    passwordComplexityInfo = '';
    profilePicture: string;

    allOrganizationUnits: OrganizationUnitDto[];
    memberedOrganizationUnits: string[];
    userPasswordRepeat = '';

    constructor(
        injector: Injector,
        private _employeeService: UserProfileServiceProxy,
        private _proxy: GenericServiceProxy,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
    }

    show(userId?: string): void {
        this.active = true;
        this.modal.show();
        this.getUser(userId);
        this.getBranchCombo();
    }

    getUser(userID: any): void {
        this.profile = new ProfileListDto();
        let url = ProxyURL.GetUserProfilebyID;
        if (userID != null && userID != undefined) {
            url += 'upfID=' + userID + '&';
        }

        this._proxy.request(url, RequestType.Get)
            .subscribe(result => {
                if (result && result.totalCount > 0 && result.totalCount == 1) {
                    this.profile.upfID = result.items[0].UPFID;
                    this.profile.refUSR = result.items[0].REFUSR;
                    this.profile.bizRegID = result.items[0].BizRegID;
                    this.profile.bizLocID = result.items[0].BizLocID;
                    this.profile.referralID = result.items[0].ReferralID;
                    this.profile.firstName = result.items[0].FirstName;
                    this.profile.lastName = result.items[0].LastName;
                    this.profile.sex = result.items[0].SexCode == null || result.items[0].SexCode.replace(/\s/g, "") == ''? 'M' : result.items[0].SexCode;
                    this.profile.salutation = result.items[0].Salutation == null || result.items[0].Salutation.replace(/\s/g, "") == ''? 'MR' : result.items[0].Salutation;
                    this.profile.designation = result.items[0].Designation;
                    this.profile.emailAddress = result.items[0].EmailAddress;
                    this.profile.directNo = result.items[0].DirectNo;
                    this.profile.mobileNo = result.items[0].MobileNo;
                    this.profile.socialMedia = result.items[0].socialMedia;
                    this.profile.location = result.items[0].Location;
                    this.selectedBranch = result.items[0].BizLocID;
                    this.getProfilePicture(result.items[0].REFUSR);
                } else {
                    this.profile.sex = 'M';
                    this.profile.salutation = 'MR';
                    this.getProfilePicture(this.refusr);
                }
            });
    }

    getBranchCombo(): void {
        let url = ProxyURL.GetBranchCombo + "mode=0&bizregid=" + this.appStorage.bizRegID + "&";
        this._proxy.request(url, RequestType.Get)
          .subscribe(result => {
                result.result.forEach(item => {
                    if (item.BranchCode !== '') {
                        item.Remark = item.Remark + ' (' + item.BranchCode + ')';
                    }
                });
                this.branchlistModel = result.result;
            });
    }

    branchListChange(event: any): void {
        console.log(event);
        console.log(this.selectedBranch);
    }

    getProfilePicture(userId: number): void {
        if (!userId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            return;
        }

        this._profileService.getProfilePictureByUser(userId).subscribe(result => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            } else {
                this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            }
        });
    }

    onShown(): void {
        // this.organizationUnitTree.data = <IOrganizationUnitsTreeComponentData>{
        //     allOrganizationUnits: this.allOrganizationUnits,
        //     selectedOrganizationUnits: this.memberedOrganizationUnits
        // };

        document.getElementById('FirstName').focus();
        this.getBranchCombo();
    }

    save(): void {
        // let input = new CreateOrUpdateUserInput();

        // input.user = this.user;
        // input.setRandomPassword = this.setRandomPassword;
        // input.sendActivationEmail = this.sendActivationEmail;
        // input.assignedRoleNames =
        //     _.map(
        //         _.filter(this.roles, { isAssigned: true, inheritedFromOrganizationUnit: false }), role => role.roleName
        //     );

        // input.organizationUnits = this.organizationUnitTree.getSelectedOrganizations();

        this.saving = true;
        // this._employeeService.createOrUpdateEmployee(input)
        //     .pipe(finalize(() => { this.saving = false; }))
        //     .subscribe(() => {
        //         this.notify.info(this.l('SavedSuccessfully'));
        //         this.close();
        //         this.modalSave.emit(null);
        //     });
        console.log(this.profile);
        if (this.profile.upfID == null || this.profile.upfID == undefined) {
            this.profile.upfID = 'xxx';
        }
        this.profile.bizRegID = this.appStorage.bizRegID;
        let url = ProxyURL.CreateOrUpdateUserProfile;
        this._proxy.request(url, RequestType.Post, this.profile)
        .pipe(finalize(() => { this.saving = false; }))
        .subscribe(result => {
            if (result.isSuccess) {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            } else {
                this.notify.error(this.l('Failed'));
            }
        });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
