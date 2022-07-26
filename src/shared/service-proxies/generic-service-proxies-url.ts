import { Subscription } from 'rxjs';
import { OrganizationTreeComponent } from './../../app/admin/organization-units/organization-tree.component';
export class ProxyURL {
    //#region Master Data
    //#region CODEMASTER
    static readonly GetListCodemaster = '/api/General/GetListCodemaster?';
    static readonly GetListCode = '/api/General/GetListCode?';
    static readonly GetCodeMasterCombo = '/api/General/GetCodeMasterCombo?';
    static readonly AddCodeMaster = '/api/General/AddCodeMaster?';
    static readonly AddCodeMaster_A = '/api/General/AddCodeMaster_A?';
    static readonly UpdateCodeMaster = '/api/General/UpdateCodemaster?';
    static readonly UpdateCodeMaster_A = '/api/General/UpdateCodemaster_A?';
    static readonly DeleteCodemaster = '/api/General/DeleteCodemaster?';
    //#endregion
    //#endregion

    //#region LocationManager
    static readonly GetBranch = '/api/Entity/GetCompanyBranch?';
    static readonly CreateOrUpdateBranch = '/api/Entity/CreateOrUpdateCompanyBranch?';
    static readonly GetBranchCombo = '/api/Entity/GetBranchCombo?';
    static readonly GetBranchRelationCombo = '/api/Entity/GetBranchRelationCombo?';


    //#region COUNTRY
    static readonly GetCountry = '/api/Location/GetCountry?';
    static readonly GetCountryCombo = '/api/Location/GetCountryCombo?';
    static readonly CreateOrUpdateCountry = '/api/Location/CreateOrUpdateCountry?';
    //#endregion

    //#region STATE
    static readonly GetState = '/api/Location/GetState?';
    static readonly GetStateList = '/api/Location/GetStateList?';
    static readonly GetStateCombo = '/api/Location/GetStateCombo?';
    static readonly CreateOrUpdateState = '/api/Location/CreateOrUpdateState?';
    //#endregion

    //#region CITY
    static readonly GetCity = '/api/Location/GetCity?';
    static readonly DeleteCity = '/api/Location/DeleteCity?';
    static readonly GetCityCombo = '/api/Location/GetCityCombo?';
    static readonly CreateOrUpdateCity = '/api/Location/CreateOrUpdateCity?';
    //#endregion

    //#region AREA
    static readonly GetArea = '/api/Location/GetArea?';
    static readonly GetAreaList = '/api/Location/GetAreaList?';
    static readonly GetAreaCombo = '/api/Location/GetAreaCombo?';
    static readonly CreateOrUpdateArea = '/api/Location/CreateOrUpdateArea?';
    //#endregion

    //#region Resource
    static readonly GetCompanyDocument = '/api/Entity/GetCompanyDocument?';
    static readonly GetVehicleSchedule = '/api/Contract/GetVehicleSchedule?';
    //#endregion

    //#region Upload
    static readonly FileUpload = '/api/General/FileUpload?';
    static readonly GetCompanyCookies = '/api/Company/GetCompanyCookies?';
    static readonly GetListSyspreft = '/api/General/GetListSyspreft?';
    static readonly GetAllListSyspreft = '/api/General/GetAllListSyspreft?';
    static readonly FileUploads = '/api/General/FileUploads?';
    static readonly PostUploadFile = '/api/General/PostUploadFile?';
    static readonly GetSubmittedFileList = '/api/General/GetSubmittedFileList?';
    static readonly GetSubmittedFilePanel = '/api/General/GetSubmittedFilePanel?';
    static readonly MoveFile = '/api/General/MoveFile?';

    static readonly GetEnvelopeRequiredDocs = '/api/Questionnaire/GetEnvelopeRequiredDocs?';
    static readonly GetEnvelopeRequiredDocsList = '/api/Questionnaire/GetEnvelopeRequiredDocsList?';
    static readonly GetEnvelopeRequiredDocsListTech = '/api/Questionnaire/GetEnvelopeRequiredDocsListTech?';
    static readonly DeleteDocEnvelopeFile = '/api/Event/DeleteDocEnvelopeFile?';

    //#endregion

    //#endregion

    //#region HistoryManager
    static readonly GetHistoryHDR = '/api/History/GetHistoryHDR?';
    static readonly GetHistoryDTL = '/api/History/GetHistoryDTL?';
    static readonly GetHistoryActionCombo = '/api/History/GetHistoryActionCombo?';
    static readonly GetHistoryUserCombo = '/api/History/GetHistoryUserCombo?';
    static readonly GetCompanyHistoryDTL = '/api/Entity/GetCompanyHistoryDTL?';
    //#endregion

    //#region PaymentManager
    static readonly GetPayment = '/api/payment/GetPayment?';
    static readonly AddTender = '/api/payment/AddTender?';
    static readonly AddTransaction = '/api/Accounting/AddTransaction?';

    //#region FPX
    static readonly ValidateFPXStatus = '/api/payment/FPX/GetFPXValidateStatus?';
    static readonly GetFPXBankList = '/api/payment/FPX/GetList?';
    static readonly SaveBankListToJson = '/api/Accounting/SaveBankListToFile?';
    static readonly GetFPXCheckSum = '/api/payment/FPX/GetCheckSum?';
    //#endregion

    //#region CreditCard
    static readonly ValidateMBCCStatus = '/api/payment/MayBankCC/GetValidateStatus?';
    static readonly GetMBCCSignature = '/api/payment/MayBankCC/GetSignature?';
    //#endregion

    //#region Registration
    static readonly UpdateCheckWaste = '/api/Entity/UpdateCheckWaste?';
    static readonly GetAbpUser = '/api/Entity/GetAbpUser?';
    static readonly AcceptBusinessTerm = '/api/Entity/AcceptBusinessTerm?';
    static readonly GetProfileBusiness = '/api/Entity/GetProfileBusiness?';
    static readonly EditCompanyProfileInfo = '/api/Entity/EditCompanyProfileInfo?';
    static readonly EditContactPersonInfo = '/api/Entity/EditContactPersonInfo?';
    static readonly SaveProfileBusiness = '/api/Entity/SaveProfileBusiness?';
    static readonly SaveBizContactPerson = '/api/Entity/SaveBizContactPerson?';
    static readonly PostProfileBusiness = '/api/Entity/PostProfileBusiness?';
    static readonly GetDocumentsBusiness = '/api/Entity/GetDocumentsBusiness?';
    static readonly SaveDocumentsBusiness = '/api/Entity/SaveDocumentsBusiness?';
    //#endregion

    //#region Manage Vendor and Costumer
    static readonly GetVendorList = '/api/Entity/GetVendorList?';
    static readonly GetVendorListAll = '/api/Entity/GetVendorListAll?';
    static readonly AddVendorParticipant = '/api/Entity/AddVendorParticipant?';
    static readonly EditVendorCustomer = '/api/Entity/EditVendorCustomer?';
    //#endregion

    //#region AuctionList
    static readonly GetAuctionList = '/api/Bidding/GetAuctionList?';
    //#endregion

    //#region Questionnaire
    //#region QuestionManager
    static readonly CreateAssignQuestion = '/api/Questionnaire/CreateAssignQuestion?';
    static readonly CreateUpdateDefaultHDR = '/api/Questionnaire/CreateUpdateDefaultHDR?';
    static readonly CreateUpdateDefaultDTL = '/api/Questionnaire/CreateUpdateDefaultDTL?';
    static readonly CreateUpdateDefaultQuestion = '/api/Questionnaire/CreateUpdateDefaultQuestion?';
    static readonly DeleteDefaultHDR = '/api/Questionnaire/DeleteDefaultHDR?';
    static readonly DeleteDefaultDTL = '/api/Questionnaire/DeleteDefaultDTL?';
    static readonly DeleteDefaultQuestion = '/api/Questionnaire/DeleteDefaultQuestion?';
    static readonly DeleteQuestionItem = '/api/Questionnaire/DeleteQuestionItem?';
    static readonly GetQuestionSet = '/api/Questionnaire/GetQuestionSet?';
    static readonly GetSection = '/api/Questionnaire/GetSection?';
    static readonly GetQuestions = '/api/Questionnaire/GetQuestions?';
    static readonly GetSectionCombo = '/api/Questionnaire/GetSectionCombo?';
    static readonly GetGroupCombo = '/api/Questionnaire/GetGroupCombo?';
    static readonly GetQuestionDTL = '/api/Questionnaire/GetQuestionDTL?';
    static readonly GetQUestionCombo = '/api/Questionnaire/GetQUestionCombo?';
    static readonly GetAnswerCombo = '/api/Questionnaire/GetAnswerCombo?';
    //#endregion
    static readonly GetQuestionnaireList = '/api/Questionnaire/GetQuestionnaireList?';
    static readonly GetQuestionnaireSection = '/api/Questionnaire/GetQuestionnaireSection?';
    static readonly GetQuestionnaire = '/api/Questionnaire/GetQuestionnaire?';
    static readonly CreateUpdateQuestionHDR = '/api/Questionnaire/CreateUpdateQuestionHDR?';
    static readonly CreateUpdateQuestion = '/api/Questionnaire/CreateUpdateQuestion?';
    static readonly CreateUpdateQuestionnaireAnswerEvaluator = '/api/Questionnaire/CreateUpdateQuestionnaireAnswerEvaluator?';
    static readonly DeleteQuestion = '/api/Questionnaire/DeleteQuestion?';
    //#endregion
    // region answer
    static readonly GetAnswerGroupList = '/api/Questionnaire/GetAnswerGroupList?';
    static readonly CreateUpdateAnswerGroup = '/api/Questionnaire/CreateUpdateAnswerGroup?';
    static readonly DeleteAnswerGroup = '/api/Questionnaire/DeleteAnswerGroup?';
    static readonly GetAnswerOptGroupList = '/api/Questionnaire/GetAnswerOptGroupList?';
    static readonly GetAnswerOptCombo = '/api/Questionnaire/GetAnswerOptCombo?';
    static readonly UnassignAnswerOptGroup = '/api/Questionnaire/UnassignAnswerOptGroup?';
    static readonly CreateAssignAnswerOptGroup = '/api/Questionnaire/CreateAssignAnswerOptGroup?';
    static readonly GetAnswerOptList = '/api/Questionnaire/GetAnswerOptList?';
    static readonly DeleteAnswerOpt = '/api/Questionnaire/DeleteAnswerOpt?';
    static readonly GetQuestionnaireHeaderList = '/api/Questionnaire/GetQuestionnaireHeaderList?';
    static readonly SaveReview = '/api/Questionnaire/SaveReview?';
    static readonly GetAnswerGroupCombo = '/api/Questionnaire/GetAnswerGroupCombo?';
    // endregion

    //#region CompanyManager
    //#region BIZENTITY (COMPANY)
    static readonly GetCompanyCombo = '/api/Entity/GetCompanyCombo?';
    //#endregeion
    //#endregion

    //#endregion
    static readonly GetAssignedPOCombo = '/api/Accounting/GetAssignedPOCombo?';
    static readonly InvoiceUpload = '/api/Accounting/InvoiceUpload?';
    static readonly PostUploadInvoice = '/api/Accounting/PostUploadInvoice?';
    static readonly GetSubmittedInvoiceList = '/api/Accounting/GetSubmittedInvoiceList?';
    static readonly GetAssignedPOList = '/api/Accounting/GetAssignedPOList?';
    static readonly GetSubmittedInvoicePanel = '/api/Accounting/GetSubmittedInvoicePanel?';
    static readonly GetAssignedPOPanel = '/api/Accounting/GetAssignedPOPanel?';

    //#region CLOBID
    static readonly GetSupplierList = '/api/Event/GetSupplierList?';
    static readonly GetEventHDR = '/api/Event/GetEventHDR?';
    static readonly SubscribeResponse = '/api/Event/SubscribeResponse?';
    static readonly GetParticipantList = '/api/Event/GetParticipantList?';
    static readonly GetComboParticipantList = '/api/Event/GetComboParticipantList?';
    static readonly GetParticipantSubmissionList = '/api/Event/GetParticipantSubmissionList?';
    static readonly GetCounterSubmissionList = '/api/Event/GetCounterSubmissionList?';
    static readonly GetParticipantByVendorAssigned = '/api/Event/GetParticipantByVendorAssigned?';
    static readonly UpdateParticipant = '/api/Event/UpdateParticipant?';
    static readonly GetCompanybyType = '/api/Entity/GetCompanybyType?';
    static readonly UploadDocEnvelopeFile = '/api/Event/UploadDocEnvelopeFile?';
    static readonly UploadDocEnvelope = '/api/Event/UploadDocEnvelope?';
    static readonly DownloadDocEnvelope = '/api/Event/GetEnvelopDocList?';
    static readonly GetBQList = '/api/Event/GetBQList?';
    static readonly GetBQListby = '/api/Event/GetBQListby?';
    static readonly DownloadBQListby = '/api/Event/DownloadBQListby?';
    static readonly GetBQTemplate = '/api/Event/GetBQTempFile?';
    static readonly DeleteBQ = '/api/Event/DeleteBQ?';
    static readonly InsertParticipant = '/api/Event/InsertParticipant?';
    static readonly DeleteParticipant = '/api/Event/DeleteParticipant?';
    static readonly GetQuestionnaireAnswer = '/api/Questionnaire/GetQuestionnaireAnswer?';
    static readonly GetBaseDonwload = '/api/Event/GetBaseDonwload?';
    static readonly GetEvaluation = '/api/Event/GetEvaluation?';
    static readonly InsertCommittee = '/api/Event/InsertCommittee?';
    static readonly DeleteCommittee = '/api/Event/DeleteCommittee?';
    static readonly DeleteCommitteeAssigned = '/api/Event/DeleteCommitteeAssigned?';
    static readonly GetCommitteeList = '/api/Event/GetCommitteeList?';
    static readonly GetEmployeeCommitteeList = '/api/Entity/GetEmployeeCommitteeList?';
    static readonly SendInvitationCommittee = '/api/Event/SendInvitationCommittee?';
    static readonly SendOtpCode = '/api/Event/SendOtpCode?';
    static readonly SendCheckInOtp = '/api/Event/SendCheckInOtp?';
    static readonly GetParticipantSubmissionListDetail = '/api/Event/GetParticipantSubmissionListDetail?';
    //#region Envelope
    static readonly GetEventItems = '/api/Event/GetEventItems?';
    static readonly GetParticipantEvaluation = '/api/Event/GetParticipantEvaluation?';
    static readonly GetPreviousEvents = '/api/Event/GetPreviousEvents?';
    static readonly GetReviewerEvaluation = '/api/Event/GetReviewerEvaluation?';
    static readonly GetParticipantSubmitted = '/api/Event/GetParticipantSubmitted?';
    static readonly GetReviewerEvaluationByUser = '/api/Event/GetReviewerEvaluationByUser?';
    static readonly GetReviewList = '/api/Event/GetReviewList?';
    static readonly GetReviewCommitteeList = '/api/Event/GetReviewCommitteeList?';
    static readonly GetDetailReview = '/api/Event/GetDetailReview?';
    static readonly GetParticipantCombo = '/api/Event/GetParticipantCombo?';
    static readonly GetParticipantCompList = '/api/Event/GetParticipantCompList?';
    static readonly GetParticipantTenderReview = '/api/Event/GetParticipantTenderReview?';
    static readonly getEventHdrByCampID = '/api/Event/getEventHdrByCampID?';
    static readonly GetParticipantTenderReviewDtl = '/api/Event/GetParticipantTenderReviewDtl?';
    static readonly GetParticipantTenderReviewDtlLine = '/api/Event/GetParticipantTenderReviewDtlLine?';
    static readonly GetParticipantFinalAwardDtl = '/api/Event/GetParticipantFinalAwardDtl?';
    static readonly GetEvaluationScore = '/api/Event/GetEvaluationScore?';
    //#endregion
    //#region Event
    // #region event
    static readonly GetDetail = '/api/Event/GetDetail?';
    static readonly GetTenderEventList = '/api/Event/GetTenderEventList?';
    static readonly GetCampaignList = '/api/Event/GetEventList?';
    static readonly GetItemBidList = '/api/Event/GetItemBidList?';
    static readonly GetItemsList = '/api/Event/GetItemsList?';
    static readonly GetCampaignSubscribedAffiliate = '/api/Campaign/GetCampaignSubscribedAffiliate?';
    static readonly GetCampaignDetail = '/api/Campaign/GetCampaignDetail?';
    static readonly CheckUpdateDoc = '/api/Campaign/CheckUpdateDoc?';
    static readonly DeleteCampaignDoc = '/api/Campaign/DeleteCampaignDoc?';
    static readonly AddCampaignHDR = '/api/Campaign/AddCampaignHDR?';
    static readonly AddListCampaignHDR = '/api/Campaign/AddListCampaignHDR?';
    static readonly UpdateCampaignHDR = '/api/Campaign/UpdateCampaignHDR?';
    static readonly UpdateListCampaignHDR = '/api/Campaign/UpdateListCampaignHDR?';
    static readonly GetCampaignDTLList = '/api/Campaign/GetCampaignDTLList?';
    static readonly GetCampaignDTLCombo = '/api/Campaign/GetCampaignDTLCombo?';
    static readonly AddListCampaignDTL_A = '/api/Campaign/AddListCampaignDTL_A?';
    static readonly UpdateCampaignDTL = '/api/Campaign/UpdateCampaignDTL?';
    static readonly GetCampaignItemList = '/api/Campaign/GetCampaignItemList?';
    static readonly SubscribeCampaign = '/api/Campaign/SubscribeCampaign?';
    static readonly AddListCampaignITEM_A = '/api/Campaign/AddListCampaignITEM_A?';
    static readonly UpdateCampaignITEM = '/api/Campaign/UpdateCampaignITEM?';
    static readonly GetCampaignRanking = '/api/Campaign/GetCampaignRanking?';
    static readonly GetTopCampaign = '/api/Campaign/GetTopCampaign?';
    static readonly GetTopCampaignQ = '/api/Campaign/GetTopCampaignQ?';
    static readonly GetSubscribedPercentage = '/api/Campaign/GetSubscribedPercentage?';
    static readonly GetPeriodicallyRate = '/api/Campaign/GetPeriodicallyRate?';
    static readonly CountImpression = '/api/Campaign/CountImpression?';
    static readonly GetBannerCombo = '/api/Campaign/GetBannerCombo?';
    static readonly GetCampaignCombo = '/api/Campaign/GetCampaignCombo?';
    static readonly SubscribeCampaignEmail = '/api/Campaign/SubscribeCampaignNotification?';
    static readonly CreateEvent = '/api/Event/CreateEvent?';
    static readonly UpdateEventRule = '/api/Event/UpdateEventRule?';
    static readonly GetUpdatedEvent = '/api/Event/GetUpdatedEvent?';
    static readonly GetEventStatus = '/api/Event/GetEventStatus?';
    static readonly GetTechCommDoc = '/api/Event/GetTechCommDoc?';
    static readonly GetCounterTechReviewList = '/api/Event/GetCounterTechReviewList?';
    static readonly GetCounterCommReviewList = '/api/Event/GetCounterCommReviewList?';
    static readonly GetCounterCommitteeReviewList = '/api/Event/GetCounterCommitteeReviewList?';
    static readonly GetSupportDocList = '/api/Event/GetSupportDocList?';
    static readonly CreateUpdateSupportDoc = '/api/Event/CreateUpdateSupportDoc?';
    static readonly UpdateSupportDoc = '/api/Event/UpdateSupportDoc?';
    static readonly DeclineInvitedEvent = '/api/Event/DeclineInvitedEvent?';
    static readonly GetCountEventByStatus = '/api/Event/GetCountEventByStatus?';
    static readonly GetCountEventByStatusPeruser = '/api/Event/GetCountEventByStatusPeruser?';
    static readonly GetEvaluationReviewScore = '/api/Event/GetEvaluationReviewScore?';
    static readonly GetVendorCombo = '/api/Event/GetVendorCombo?';
    static readonly GetVendorDetail = '/api/Event/GetVendorDetail?';
    static readonly ChangePaxMode = '/api/Event/ChangePaxMode?';

    //static readonly GetCodeMasterCombo = '/api/Campaign/GetCodeMasterCombo?';
    // #endregion
    //#endregion
    //#endregion

    //#region CompanyManager
    //#region BIZENTITY (COMPANY)
    static readonly GetAllCompany = '/api/Entity/GetAllCompany?';
    static readonly GetCompany = '/api/Entity/GetCompany?';
    static readonly GetCompanyDetail = '/api/Entity/GetCompanyDetail?';
    static readonly GetCompanyList = '/api/Entity/GetCompanyList?';
    static readonly AddCompany = '/api/Entity/AddCompany?';
    static readonly AddCompany_A = '/api/Entity/AddCompany_A?';
    static readonly UpdateCompany = '/api/Entity/UpdateCompany?';
    static readonly UpdateCompany_A = '/api/Entity/UpdateCompany_A?';
    static readonly RegisterAffiliate = '/api/Entity/RegisterCompany?';
    static readonly RegisterAffiliateEmail = '/api/Entity/RegisterCompanyNotification?';
    //#endregeion

    //#region BIZLOCATE (WEBSITE)
    static readonly GetCompanyLocation = '/api/Entity/GetCompanyLocation?';
    static readonly AddCompanyLocation = '/api/Entity/AddCompanyLocation?';
    static readonly AddCompanyLocation_A = '/api/Entity/AddCompanyLocation_A?';
    static readonly UpdateCompanyLocation = '/api/Entity/UpdateCompanyLocation?';
    static readonly UpdateCompanyLocation_A = '/api/Entity/UpdateCompanyLocation_A?';
    //#endregion

    //#region BIZDOCUMENT
    static readonly DocumentFileUpload = '/api/Entity/DocumentFileUpload?';
    static readonly AddDocument_A = '/api/Entity/AddDocument_A?';
    static readonly UpdateDocument_A = '/api/Entity/UpdateDocument_A?';
    static readonly DeleteDocument_A = '/api/Entity/DeleteDocument_A?';
    //#endregion

    //#region EMPLOYEE
    static readonly GetEmployee = '/api/Entity/GetEmployee?';
    static readonly GetEmployeeByOrganizationUnit = '/api/Entity/GetEmployeeByOrganizationUnit?';
    ////#endregion

    //#region AbpUserProfile
    static readonly UploadUserProfile = '/api/Entity/UploadUserProfile?';
    static readonly GetUserProfile = '/api/Entity/GetUserProfile?';
    static readonly GetUserProfileToExcel = '/api/Entity/GetUserProfileToExcel?';
    static readonly GetUserProfilebyID = '/api/Entity/GetUserProfilebyID?';
    static readonly GetUserProfilebyRefIDName = '/api/Entity/GetUserProfilebyRefIDName?';
    static readonly CreateOrUpdateUserProfile = '/api/Entity/CreateOrUpdateUserProfile?';
    static readonly DeleteUserProfile = '/api/Entity/DeleteUserProfile?';
    static readonly GetTenantInfo = '/api/TokenAuth/GetTenantInfo?';
    //#endregion

    //#endregion
    //#region AuctionList
    static readonly GetLotDetails = '/api/Bidding/GetLotDetails?';
    static readonly GetEventHeader = '/api/Bidding/GetEventHeader?';
    static readonly GetPriceHistory = '/api/Bidding/GetPriceHistory?';
    static readonly GetBidHistory = '/api/Bidding/GetBidHistory?';
    static readonly SubmitBid = '/api/Bidding/SubmitBid?';
    //#endregion
    //#region RealTime
    static readonly RealTimeJoinGroupSample = '/api/Sample/RealTimeJoinGroup?';
    static readonly RealTimeLeaveGroupSample = '/api/Sample/RealTimeLeaveGroup?';
    //#endregion

    //#region INVENTORY
    static readonly GetInventory = '/api/Inventory/GetInventory?';
    static readonly GetInventoryDetail = '/api/Inventory/GetInventoryDetail?';
    static readonly AddInventoryHDR = '/api/Inventory/AddInventoryHDR?';
    static readonly AddInventoryDTL = '/api/Inventory/AddInventoryDTL?';
    static readonly UpdateInventory = '/api/Inventory/UpdateInventory?';
    static readonly DeleteInventory = '/api/Inventory/DeleteInventory?';
    static readonly GetItemCombo = '/api/Inventory/GetItemCombo?';
    static readonly GetItemStock = '/api/Inventory/GetItemStock?';
    static readonly GetItemPriceDetail = '/api/Inventory/GetItemPriceDetail?';
    //#endregion

    //#region OrganizationTreeComponent
    static readonly GetComboOrganizationUnit = '/api/Entity/GetComboOrganizationUnit?';
    //#endregion

    //#region Subscription
    static readonly GetUserSubcriptions = '/api/Subscription/GetUserSubcriptions?';
    static readonly GetCountUserSubcriptions = '/api/Subscription/GetCountUserSubcriptions?';
    //#endregion

    //#region BillingInfo
    static readonly GetBizBillingInfo = '/api/Accounting/GetBizBillingInfo?';
    static readonly UpdateBizBillingInfo = '/api/Accounting/UpdateBizBillingInfo?';
    //#endregion

    //#region BillingHistory
    static readonly GetBillingHistory = '/api/Accounting/GetBillingHistory?';
    //#endregion

    //#region Credit
    static readonly CheckCreditBalance = '/api/Credit/CheckCreditBalance';
    //#endregion

    //#region VCard
    static readonly GenerateQRBase64 = '/api/Vcard/GenerateQRBase64?';
    static readonly GenerateVCardBase64 = '/api/Vcard/GenerateVCardBase64?';
    //#endregion

    //#region Edition
    static readonly GetAppMasterCombo = "/api/General/GetAppMasterCombo?";
    //#endregion

    //#region Koperasi
    static readonly GetKoperasiUserProfile = '/api/Entity/GetKoperasiUserProfile?';
    static readonly GetKoperasiCompany = '/api/Entity/GetKoperasiCompany?';
    //#endregion

    //#region Installment
    static readonly PostInstallment = '/api/Accounting/PostInstallment?';
    static readonly GetInstallment = '/api/Accounting/GetInstallment?';
    //#endregion

    //#region MemberActivation
    static readonly MemberActivation = '/api/Entity/MemberActivation?';
    //#endregion

    //#region ReloadRequest
    static readonly GetAllToopReloadProducts = '/api/Campaign/GetAllToopReloadProducts?';
    static readonly GetReloadVoucherByID = '/api/Campaign/GetReloadVoucherByID?';
    static readonly SaveReloadRequest = '/api/Campaign/SaveReloadRequest?';
    //#endregion

    static readonly GetUserProfileById = "/api/Entity/GetUserProfilebyID?";
}
