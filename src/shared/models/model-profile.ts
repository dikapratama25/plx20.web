import { stringToDate, toISOFormat } from '@shared/helpers/DateTimeHelper';
import { UploadBaseDto, ExcelDataType } from './model-upload';

export class ProfileDTO extends UploadBaseDto implements IProfileDTO {
	firstName: string | undefined;
	lastName: string | undefined;
	emailAddress: string | undefined;
	designation: string | undefined;
	directNo: string | undefined;
	mobileNo: string | undefined;
	referralID: string | undefined;
	referralCode: string | undefined;

    constructor(data?: IProfileDTO) {
        super()
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    static fromJS(data: any): ProfileDTO {
        let result = new ProfileDTO();
        result.init(data);
        return result;
    }

    static fromExcel(data: any[]): ProfileDTO {
        let result = new ProfileDTO();
        if (data) {
            result.firstName = result.assignValue(data, 1, true, ExcelDataType.String, false);
            result.lastName = result.assignValue(data, 2, true, ExcelDataType.String, false);
            result.emailAddress = result.assignValue(data, 3, false, ExcelDataType.String, false);
            result.designation = result.assignValue(data, 4, false, ExcelDataType.String, false);
            result.mobileNo = result.assignValue(data, 5, false, ExcelDataType.Number, false);
            result.directNo = result.assignValue(data, 6, false, ExcelDataType.Number, false);
            result.referralID = result.assignValue(data, 7, false, ExcelDataType.String, false);
            result.referralCode = result.assignValue(data, 8, false, ExcelDataType.String, false);
        }
        return result;
    }

    init(data?: any) {
        if (data) {
            this.firstName = data['FirstName'];
            this.lastName = data['LastName'];
            this.emailAddress = data['EmailAddress'];
            this.designation = data['Designation'];
            this.mobileNo = data['MobileNo'];
            this.directNo = data['DirectNo'];
            this.referralID = data['ReferralID'];
            this.referralCode = data['ReferralCode'];
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['FirstName'] = this.firstName;
        data['LastName'] = this.lastName;
        data['EmailAddress'] = this.emailAddress;
        data['Designation'] = this.designation;
        data['MobileNo'] = this.mobileNo;
        data['DirectNo'] = this.directNo;
        data['ReferralID'] = this.referralID;
        data['ReferralCode'] = this.referralCode;
        return data;
    }
    
	clone() {
        const json = this.toJSON();
        let result = new ProfileDTO();
        result.init(json);
        return result;
    }
}

export interface IProfileDTO {
	firstName: string | undefined;
	lastName: string | undefined;
	emailAddress: string | undefined;
	designation: string | undefined;
	directNo: string | undefined;
	mobileNo: string | undefined;
	referralID: string | undefined;
	referralCode: string | undefined;
}

export class PagedResultDtoOfSKUDto implements IPagedResultDtoOfSKUDto {
    totalCount: number;
    items: ProfileDTO[];

    constructor(data?: IPagedResultDtoOfSKUDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    static fromJS(data: any): PagedResultDtoOfSKUDto {
        let result = new PagedResultDtoOfSKUDto();
        result.init(data);
        return result;
    }

    init(data?: any) {
        if (data) {
            this.totalCount = data['totalCount'];
            if (data['items'] && data['items'].constructor === Array) {
                this.items = [];
                for (let item of data['items']) {
                    this.items.push(ProfileDTO.fromJS(item));
                }
            }
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['totalCount'] = this.totalCount;
        if (this.items && this.items.constructor === Array) {
            data['items'] = [];
            for (let item of this.items) {
                data['items'].push(item.toJSON());
            }
        }
        return data;
    }

    clone() {
        const json = this.toJSON();
        let result = new PagedResultDtoOfSKUDto();
        result.init(json);
        return result;
    }
}

export interface IPagedResultDtoOfSKUDto {
    totalCount: number;
    items: ProfileDTO[];
}
