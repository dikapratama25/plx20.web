import { Injectable } from "@angular/core";

export class AppEditionExpireAction {
    static DeactiveTenant = 'DeactiveTenant';
    static AssignToAnotherEdition = 'AssignToAnotherEdition';
}

export enum SaveType {
    Void = 0,
    Delete = -1,
    Insert = 1,
    Update = 2
}

export enum ModalType {
    Create = 1,
    Update = 2,
    View = 3
}

export enum LocationType {
    Country = 1,
    State = 2,
    City = 3,
    Area = 4
}

export enum PaymentMethod {
    PayFPX = 0,
    PayCC = 1,
    PayAG = 2
}

export enum EventStatus {
    Draft = 0,
    PendingApproval = 1,
    Open = 2,
    PendingSelection = 3,
    Closed = 4,
    PendingOpening = 5,
    PendingReview = 6,
    FinalReview = 7,
    Awarding = 8
}

export enum CommiteRoleType {
    Moderator = 17,
    Buyer = 18,
    HSE = 1032
}

@Injectable()
export class TenderCont {
    Items: any[] = [];
}

@Injectable()
export class PaxRegPaxLog {
    PaxRegID: any;
    PaxLocID: any;
}