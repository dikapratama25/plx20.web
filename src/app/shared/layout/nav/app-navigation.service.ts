import { PermissionCheckerService } from 'abp-ng2-module';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';
import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class AppNavigationService {

    constructor(
        private _permissionCheckerService: PermissionCheckerService,
        private _appSessionService: AppSessionService
    ) {
    }

    getMenu(): AppMenu {
        return new AppMenu('MainMenu', 'MainMenu', [
            new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'flaticon-line-graph', '/app/admin/hostDashboard'),
            new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),
            new AppMenuItem('Home', 'Pages.Biz', 'flaticon-home-2', '/app/biz/home'),
            new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),
            new AppMenuItem('BizProfile', 'Pages.Biz.Profile', 'flaticon-profile', '/app/biz/business-profile'),
            new AppMenuItem('MyWorkspace', 'Pages.Registration', 'flaticon-list', '/app/manage/review'),
            new AppMenuItem('MySubscription', 'Pages.UserAccount.MySubscription', 'flaticon-notes', '/app/subscription/home'),
            new AppMenuItem('EBidding', 'Pages.Clobid', 'flaticon-medal', '/app/biz/ebidding'),
            new AppMenuItem('Administration', '', 'flaticon-interface-8', '', [], [
                new AppMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'flaticon-map', '/app/admin/organization-units'),
                new AppMenuItem('Roles', 'Pages.Administration.Roles', 'flaticon-suitcase', '/app/admin/roles'),
                new AppMenuItem('Users', 'Pages.Administration.Users', 'flaticon-users', '/app/admin/users'),
                new AppMenuItem('Employees', 'Pages.Administration.Employees', 'flaticon-users', '/app/admin/employees'),
                new AppMenuItem('Languages', 'Pages.Administration.Languages', 'flaticon-tabs', '/app/admin/languages', ['/app/admin/languages/{name}/texts']),
                new AppMenuItem('AuditLogs', 'Pages.Administration.AuditLogs', 'flaticon-folder-1', '/app/admin/auditLogs'),
                new AppMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'flaticon-lock', '/app/admin/maintenance'),
                new AppMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement', 'flaticon-refresh', '/app/admin/subscription-management'),
                new AppMenuItem('VisualSettings', 'Pages.Administration.UiCustomization', 'flaticon-medical', '/app/admin/ui-customization'),
                new AppMenuItem('WebhookSubscriptions', 'Pages.Administration.WebhookSubscription', 'flaticon2-world', '/app/admin/webhook-subscriptions'),
                new AppMenuItem('DynamicParameters', '', 'flaticon-interface-8', '', [], [
                    new AppMenuItem('Definitions', 'Pages.Administration.DynamicParameters', '', '/app/admin/dynamic-parameter'),
                    new AppMenuItem('EntityDynamicParameters', 'Pages.Administration.EntityDynamicParameters', '', '/app/admin/entity-dynamic-parameter'),
                ]),
                new AppMenuItem('Settings', 'Pages.Administration.Host.Settings', 'flaticon-settings', '/app/admin/hostSettings'),
                new AppMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'flaticon-settings', '/app/admin/tenantSettings')
            ]),
            // new AppMenuItem('Manage', 'Pages.Manage', 'flaticon-settings-1', '', [], [
            //     new AppMenuItem('Vendor', 'Pages.Manage.Vendor', '', '/app/manage/manage-vendor'),
            //     new AppMenuItem('Customer', 'Pages.Manage.Customer', '', '/app/manage/manage-customer'),
            //     new AppMenuItem('Event', 'Pages.Event', 'flaticon-clock-2', '/app/event/'),
            //     new AppMenuItem('Questionnaire', 'Pages.Questionnaire', '', '/app/manage/questionnaire'),
            //     new AppMenuItem('Answer', 'Pages.Questionnaire', '', '/app/manage/answer'),
            // ]),
            new AppMenuItem('DemoUiComponents', 'Pages.DemoUiComponents', 'flaticon-shapes', '/app/admin/demo-ui-components'),
            new AppMenuItem('Form', 'Pages.DemoUiComponents', 'flaticon-browser', '/app/admin/form'),
            new AppMenuItem('EntityManagement', 'Pages.Entity', 'flaticon-clipboard', '', [], [
                new AppMenuItem('Branch', 'Pages.Entity.Branch.View', 'flaticon-map', '/app/manage/branch'),
                new AppMenuItem('Country', 'Pages.Entity.Country.View', 'flaticon-placeholder-2', '/app/manage/location/country'),
                new AppMenuItem('State', 'Pages.Entity.State.View', 'flaticon-placeholder-2', '/app/manage/location/state'),
                new AppMenuItem('City', 'Pages.Entity.City.View', 'flaticon-placeholder-2', '/app/manage/location/city'),
                new AppMenuItem('Area', 'Pages.Entity.Area.View', 'flaticon-placeholder-2', '/app/manage/location/area')
            ]),
            new AppMenuItem('ResourceManagement', 'Pages.Entity', 'flaticon-folder-2', '', [], [
                new AppMenuItem('Employee', 'Pages.EmployeeList', 'flaticon-user', '/app/manage/employee'),
                new AppMenuItem('Vehicle', 'Pages.VehicleList', 'flaticon-truck', '/app/manage/vehicle')
            ]),
            new AppMenuItem('Order', 'Pages.Biz.Accounting.PO', 'flaticon-open-box', '', [], [
                new AppMenuItem('ViewOrder', 'Pages.Biz.Accounting.PO', 'flaticon-list-2', '/app/biz/order')
            ]),
            new AppMenuItem('Billing', 'Pages.Biz.Accounting.Billing', 'flaticon2-copy', '', [], [
                new AppMenuItem('BillingInformation', 'Pages.Biz.Accounting.Billing.Info', 'flaticon-file-1', '/app/bizsettings/billing-information'),
                new AppMenuItem('BillingHistory', 'Pages.Biz.Accounting.Billing.History', 'flaticon-file-1', '/app/biz/billing-history')
            ]),
            new AppMenuItem('Invoice', 'Pages.Biz.Accounting.Billing', 'flaticon2-copy', '', [], [
                new AppMenuItem('CreateInvoice', 'Pages.Biz.Accounting.Billing.Upload', 'flaticon-file-1', '/app/biz/billing-upload'),
                new AppMenuItem('InvoiceHistory', 'Pages.Biz.Accounting.Billing.Request', 'flaticon-file-1', '/app/biz/billing-request'),
            ]),
            new AppMenuItem('Invoice', 'Pages.Account.Invoice', 'flaticon2-copy', '', [], [
                new AppMenuItem('InvoiceHistory', 'Pages.Account.Invoice.Submission', 'flaticon-file-1', '/app/biz/billing-submission')
            ]),
            // new AppMenuItem('Payment', 'Pages', 'flaticon2-copy', '', [], [
            //     new AppMenuItem('Portal', 'Pages', 'flaticon-file-1', '/app/payment/portal')
            // ]),
            //#region Side Menu when Event Details clicked
            // new AppMenuItem('Event Details', 'Pages.Manage', 'flaticon-list-2', '', [], [
            //     new AppMenuItem('Event Summary', 'Pages.Manage', '', '/app/event/subscribe'),
            //     new AppMenuItem('Vendor', 'Pages.Manage', '', '/app/event/vendor'),
            //     new AppMenuItem('Questionaire', 'Pages.Manage', '', '/app/event/questionnaire'),
            //     new AppMenuItem('Evaluator', 'Pages.Manage', '', '/app/event/evaluator'),
            //     new AppMenuItem('EventSubmission', 'Pages.Manage', '', '/app/event/submission')
            // ], undefined, undefined, () => {
            //     return AppConsts.isAdmin === 'true';
            // }),
            //#endregion
            // new AppMenuItem('Event List', 'Pages.Event.Evaluation.Role.Technical', 'flaticon-list', '/app/event/event-review'),
            // new AppMenuItem('Event List', 'Pages.Event.Evaluation.Role.Commercial', 'flaticon-list', '/app/event/event-review')
            //new AppMenuItem('Evaluation Review', 'Pages.Event.Evaluation.Role.Review', 'flaticon-file-1', '/app/event/evaluation-review'),
        ]);
    }

    checkChildMenuItemPermission(menuItem): boolean {

        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName === '' || subMenuItem.permissionName === null) {
                if (subMenuItem.route) {
                    return true;
                }
            } else if (this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                return true;
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                let isAnyChildItemActive = this.checkChildMenuItemPermission(subMenuItem);
                if (isAnyChildItemActive) {
                    return true;
                }
            }
        }
        return false;
    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' && this._appSessionService.tenant && !this._appSessionService.tenant.edition) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (this._appSessionService.tenant || !abp.multiTenancy.ignoreFeatureCheckForHostUsers) {
            if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
                hideMenuItem = true;
            }
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }

    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach(menuItem => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach(subMenu => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}
