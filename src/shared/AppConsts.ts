export class AppConsts {

    static readonly tenancyNamePlaceHolderInUrl = '{TENANCY_NAME}';

    static remoteServiceBaseUrl: string;
    static remoteServiceBaseUrlFormat: string;
    static appBaseUrl: string;
    static appBaseHref: string; // returns angular's base-href parameter value if used during the publish
    static appBaseUrlFormat: string;
    static recaptchaSiteKey: string;
    static subscriptionExpireNootifyDayCount: number;
    static appCurrency: any = {};

    static localeMappings: any = [];

    static Stimulsoft: any;
    static DefaultTID: string;
    static FPX: any;
    static CreditCard: any;
    static DesFileUpload: any;
    static svcAppBaseUrl: any = [];
    static qrVCardLink: string;
    static deepAppLink: string;
    //default tracking code (will disabled at first) for generating <script> only
    static gaTrackingCode: string = 'G-PEB6X3R80D';

    //#region Add Validation Side Menu (By Irvan, 2020-11-19)
    static isAdmin: any;
    //#endregion

    static parentId: string;

    static readonly userManagement = {
        defaultAdminUserName: 'admin'
    };

    static readonly localization = {
        defaultLocalizationSourceName: 'Plexform'
    };

    static readonly authorization = {
        encrptedAuthTokenName: 'enc_auth_token'
    };

    static readonly grid = {
        defaultPageSize: 10
    };

    static readonly MinimumUpgradePaymentAmount = 1;

    /// <summary>
    /// Gets current version of the application.
    /// It's also shown in the web page.
    /// </summary>
    static readonly WebAppGuiVersion = '8.9.2.0';
}
