import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';

export enum ExcelDataType {
    String,
    Number,
    Date
}

export enum ExcelType {
    Unknown,
    PNU
}

export class UploadBaseDto {
    public hasError = false;
    public mandatoryColumns: any[] = [];
    public errorColumns: any[] = [];
    public originalValue: any[] = [];
    public numberColumns: any[] = [];
    public dateColumns: any[] = [];
    public primaryColumns: any[] = [];
    public primaryKey: string;
    public tooltipMsg: string[] = [];
    public errorMsgg: string;

    public generatePrimaryKey(data: any, cols: UploadGridDto[], idx: number) {
        if (idx < this.primaryColumns.length) {
            return data[cols[this.primaryColumns[idx]].field] + (+idx + 1 < this.primaryColumns.length ? '|' : '') + this.generatePrimaryKey(data, cols, idx + 1);
        } else {
            return '';
        }
    }
    protected assignValue(data: any[], idx: number, isMandatory: boolean, excelDataType: ExcelDataType, setAsPrimary: boolean) {
        this.tooltipMsg[idx] = '';
        excelDataType = !excelDataType ? ExcelDataType.String : excelDataType;
        switch (excelDataType) {
            case ExcelDataType.Number:
                this.tooltipMsg[idx] += this.tooltipMsg[idx] ? ', number' : 'Number';
                this.numberColumns.push(idx);
                break;
            case ExcelDataType.Date:
                this.tooltipMsg[idx] += this.tooltipMsg[idx] ? ', date' : 'Date';
                this.dateColumns.push(idx);
                break;
            default:
                break;
        }
        if (setAsPrimary) {
            let key = data[idx] ? data[idx] : '';
            this.primaryKey = this.primaryKey ? this.primaryKey + '|' + key : key;
            this.primaryColumns.push(idx);
        }

        if (excelDataType === ExcelDataType.String ? !isNaN(this.isNumber(data[idx], idx, true)) || data[idx] : data[idx]) {
            return excelDataType === ExcelDataType.Number ? this.isNumber(data[idx], idx) :
                   excelDataType === ExcelDataType.Date ? this.isDate(data[idx], idx) : data[idx];
        } else {
            return isMandatory ? this.isMandatory(idx) : undefined;
        }
    }

    protected isMandatory(index: number) {
        this.hasError = true;
        this.errorColumns.push(index);
        this.mandatoryColumns.push(index);
        this.tooltipMsg[index] += this.tooltipMsg[index] ? ', mandatory' : 'Mandatory';
        return undefined;
    }

    protected isNumber(value: any, index: number, justCheck?: boolean): number {
        if (!justCheck) {
            // this.numberColumns.push(index);
            // this.tooltipMsg[index] += this.tooltipMsg[index] ? ', number' : 'Number';
        }
        if (!isNaN(value)) {
            return Number(value);
        } else {
            if (!justCheck) {
                this.hasError = true;
                this.errorColumns.push(index);
                this.originalValue.push({
                    idx: index,
                    val: value
                });
            }
            return undefined;
        }
    }

    protected isDate(value: any, index: number, justCheck?: boolean): Date {
        // if (!justCheck) {
        //     // this.dateColumns.push(index);
        //     // this.tooltipMsg[index] += this.tooltipMsg[index] ? ', date' : 'Date';
        // }
        // // if (Date.parse(value)) {
        // //     return new Date(Date.parse(value));
        // // }
        // if (moment(value, AppConsts.dateFormatUpload).isValid()) {
        //     return moment(value, AppConsts.dateFormatUpload).toDate();
        // } else {
        //     if (!justCheck) {
        //         this.hasError = true;
        //         this.errorColumns.push(index);
        //         this.originalValue.push({
        //             idx: index,
        //             val: value
        //         });
        //     }
        //     return null;
        // }
        return null;
    }

    public checkError(colIndex: number, val: any) {
        const errIndex = this.errorColumns.indexOf(colIndex);
        if (errIndex >= 0) {
            if (this.numberColumns.indexOf(colIndex) >= 0) {
                if (!isNaN(this.isNumber(val, colIndex, true))) {
                    this.errorColumns.splice(errIndex, 1);
                }
            } else if (this.dateColumns.indexOf(colIndex) >= 0) {
                if (this.isDate(val, colIndex, true)) {
                    this.errorColumns.splice(errIndex, 1);
                }
            } else {
                if (!isNaN(this.isNumber(val, colIndex, true)) || val) {
                    this.errorColumns.splice(errIndex, 1);
                }
            }
        }
        if (this.errorColumns.length <= 0) {
            this.hasError = false;
        }
    }
}

export class UploadGridDto {
    field: string;
    header: string;
    sortable: boolean;
    editable: boolean;
    width: number;

    constructor(field: string, header: string, sortable?: boolean, editable?: boolean, width?: number) {
        this.field = field;
        this.header = header;
        if (sortable) {
            this.sortable = sortable;
        } else {
            this.sortable = false;
        }
        if (editable) {
            this.editable = editable;
        } else {
            this.editable = false;
        }
        if (width) {
            this.width = width;
        } else {
            this.width = 100;
        }
    }
}

export class UploadDataDto {
    excelType: ExcelType;
    createBy: string;
    data: any[];

    constructor(excelType: ExcelType, createBy: string, data: any[]) {
        this.excelType = excelType;
        this.createBy = createBy;
        this.data = data;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['excelType'] = this.excelType;
        data['createBy'] = this.createBy;
        data['data'] = this.data;
        return data;
    }
}

export interface IUploadDto {
    name: string;
    size: string;
    file: File;
    excel: any;
    isUploaded: boolean;
}

export class UploadDto implements IUploadDto {
    name: string;
    size: string;
    file: File;
    excel: any;
    isUploaded: boolean;

    static fromJS(data: any): UploadDto {
        let result = new UploadDto();
        result.init(data);
        return result;
    }

    constructor(data?: IUploadDto) {
        if (data) {
            for (let property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.name = data['name'];
            this.size = data['size'];
            this.file = data['file'];
            this.excel = data['excel'];
            this.isUploaded = data['isUploaded'];
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['name'] = this.name;
        data['size'] = this.size;
        data['file'] = this.file;
        data['excel'] = this.excel;
        data['isUploaded'] = this.isUploaded;
        return data;
    }

    clone() {
        const json = this.toJSON();
        let result = new UploadDto();
        result.init(json);
        return result;
    }
}

export class UploadPendingRecvDto {
    hasError = false;
    errorColumns: any[] = [];

    column0: string;
    column1: string;
    column2: string;
    column3: string;
    column4: string;
    column5: number;
    column6: number;
    column7: number;
    column8: Date;
    column9: Date;
    column10: string;
    column11: string;
    column12: string;

    static fromJS(data: any): UploadPendingRecvDto {
        let result = new UploadPendingRecvDto();
        result.init(data);
        return result;
    }

    constructor(data?: any[]) {
        if (data) {
            if (data[0]) {
                this.column0 = data[0];
            }

            if (data[1]) {
                this.column1 = data[1];
            } else {
                this.isMandatory(1);
            }

            if (data[2]) {
                this.column2 = data[2];
            }

            if (data[3]) {
                this.column3 = data[3];
            } else {
                this.isMandatory(3);
            }

            if (data[4]) {
                this.column4 = data[4];
            }

            if (data[5]) {
                this.column5 = this.isNumber(data[5], 5);
            } else {
                this.isMandatory(5);
            }

            if (data[6]) {
                this.column6 = this.isNumber(data[6], 6);
            } else {
                this.isMandatory(6);
            }

            if (data[7]) {
                this.column7 = this.isNumber(data[7], 7);
            }

            if (data[8]) {
                this.column8 = this.isDate(data[8], 8);
            } else {
                this.isMandatory(8);
            }

            if (data[9]) {
                this.column9 = this.isDate(data[9], 9);
            }

            if (data[10]) {
                this.column10 = data[10];
            }

            if (data[11]) {
                this.column11 = data[11];
            } else {
                this.isMandatory(11);
            }

            if (data[12]) {
                this.column12 = data[12];
            } else {
                this.isMandatory(12);
            }
        }
    }

    isMandatory(index?: number) {
        this.hasError = true;
        this.errorColumns.push(index);
    }

    isNumber(value?: any, index?: number): number {
        if (Number(value)) {
            return Number(value);
        } else {
            this.hasError = true;
            this.errorColumns.push(index);
            return null;
        }
    }

    isDate(value?: any, index?: number): Date {
        if (Date.parse(value)) {
            return new Date(Date.parse(value));
        }  else {
            this.hasError = true;
            this.errorColumns.push(index);
            return null;
        }
    }

    init(data?: any) {
        if (data) {
            this.hasError = false;
            this.errorColumns = [];

            this.column0 = '';
            this.column1 = '';
            this.column2 = '';
            this.column3 = '';
            this.column4 = '';
            this.column5 = null;
            this.column6 = null;
            this.column7 = null;
            this.column8 = null;
            this.column9 = null;
            this.column10 = '';
            this.column11 = '';
            this.column12 = '';
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['hasError'] = this.hasError;
        data['errorList'] = this.errorColumns;

        data['column0'] = this.column0;
        data['column1'] = this.column1;
        data['column2'] = this.column2;
        data['column3'] = this.column3;
        data['column4'] = this.column4;
        data['column5'] = this.column5;
        data['column6'] = this.column6;
        data['column7'] = this.column7;
        data['column8'] = this.column8;
        data['column9'] = this.column9;
        data['column10'] = this.column10;
        data['column11'] = this.column11;
        data['column12'] = this.column12;
        return data;
    }

    clone() {
        const json = this.toJSON();
        let result = new UploadPendingRecvDto();
        result.init(json);
        return result;
    }
}

export class UploadFlightTimeDto {
    hasError = false;
    errorColumns: any[] = [];

    ftGroupCode: string;
    startTime: string;
    endTime: string;
    syncCreate: string;
    syncLastUpd: string;
    createDate: string;
    updateDate: string;
    lastSyncBy: string;
    createBy: string;
    updateBy: string;
    active: number;

    static fromJS(data: any): UploadFlightTimeDto {
        let result = new UploadFlightTimeDto();
        result.init(data);
        return result;
    }

    constructor(data?: any[]) {
        if (data) {
            if (data[0]) {
                this.ftGroupCode = data[0];
            } else {
                this.isMandatory(1);
            }

            if (data[1]) {
                this.startTime = data[1];
            } else {
                this.isMandatory(1);
            }

            if (data[2]) {
                this.endTime = data[2];
            } else {
                this.isMandatory(1);
            }
            this.syncCreate = '';
            this.syncLastUpd = '';
            this.createDate = '';
            this.updateDate = '';
            this.lastSyncBy = '';
            this.createBy = '';
            this.updateBy = '';
            this.active = 1;
        }
    }

    isMandatory(index?: number) {
        this.hasError = true;
        this.errorColumns.push(index);
    }

    isNumber(value?: any, index?: number): number {
        if (Number(value)) {
            return Number(value);
        } else {
            this.hasError = true;
            this.errorColumns.push(index);
            return null;
        }
    }

    isDate(value?: any, index?: number): Date {
        if (Date.parse(value)) {
            return new Date(Date.parse(value));
        }  else {
            this.hasError = true;
            this.errorColumns.push(index);
            return null;
        }
    }

    init(data?: any) {
        if (data) {
            this.hasError = false;
            this.errorColumns = [];

            this.ftGroupCode = '';
            this.startTime = '';
            this.endTime = '';
            this.syncCreate = '';
            this.syncLastUpd = '';
            this.createDate = '';
            this.updateDate = '';
            this.lastSyncBy = '';
            this.createBy = '';
            this.updateBy = '';
            this.active = 0;
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['hasError'] = this.hasError;
        data['errorList'] = this.errorColumns;
        data['endTime'] = this.endTime;
        data['syncCreate'] = this.syncCreate;
        data['syncLastUpd'] = this.syncLastUpd;
        data['createDate'] = this.createDate;
        data['updateDate'] = this.updateDate;
        data['lastSyncBy'] = this.lastSyncBy;
        data['createBy'] = this.createBy;
        data['updateBy'] = this.updateBy;
        data['active'] = this.active;
        return data;
    }

    clone() {
        const json = this.toJSON();
        let result = new UploadFlightTimeDto();
        result.init(json);
        return result;
    }
}

export class UploadAgentTierDto {
    hasError = false;
    errorColumns: any[] = [];

    marketCode: string;
    inTier: string;
    inSubTier: string;
    outTier: string;
    outSubTier: string;
    inAgentID: string;
    outAgentID: string;
    status: number;
    inuse: number;
    syncCreate: string;
    syncLastUpd: string;
    lastSyncBy: string;
    createDate: string;
    createBy: string;
    updateDate: string;
    updateBy: string;
    active: number;

    static fromJS(data: any): UploadFlightTimeDto {
        let result = new UploadFlightTimeDto();
        result.init(data);
        return result;
    }

    constructor(data?: any[]) {
        if (data) {
            this.marketCode = '';
            this.inTier = '';
            this.inSubTier = '';
            this.outTier = '';
            this.outSubTier = '';
            this.inAgentID = '';
            this.outAgentID = '';
            this.status = 0;
            this.inuse = 0;
            this.syncCreate = '';
            this.syncLastUpd = '';
            this.lastSyncBy = '';
            this.createDate = '';
            this.createBy = '';
            this.updateDate = '';
            this.updateBy = '';
            this.active = 1;
        }
    }

    isMandatory(index?: number) {
        this.hasError = true;
        this.errorColumns.push(index);
    }

    isNumber(value?: any, index?: number): number {
        if (Number(value)) {
            return Number(value);
        } else {
            this.hasError = true;
            this.errorColumns.push(index);
            return null;
        }
    }

    isDate(value?: any, index?: number): Date {
        if (Date.parse(value)) {
            return new Date(Date.parse(value));
        }  else {
            this.hasError = true;
            this.errorColumns.push(index);
            return null;
        }
    }

    init(data?: any) {
        if (data) {
            this.hasError = false;
            this.errorColumns = [];

            this.marketCode = '';
            this.inTier = '';
            this.inSubTier = '';
            this.outTier = '';
            this.outSubTier = '';
            this.inAgentID = '';
            this.outAgentID = '';
            this.status = 0;
            this.inuse = 0;
            this.syncCreate = '';
            this.syncLastUpd = '';
            this.lastSyncBy = '';
            this.createDate = '';
            this.createBy = '';
            this.updateDate = '';
            this.updateBy = '';
            this.active = 0;
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['hasError'] = this.hasError;
        data['errorList'] = this.errorColumns;

        data['marketCode'] = this.marketCode;
        data['inTier'] = this.inTier;
        data['inSubTier'] = this.inSubTier;
        data['outTier'] = this.outTier;
        data['outSubTier'] = this.outSubTier;
        data['inAgentID'] = this.inAgentID;
        data['outAgentID'] = this.outAgentID;
        data['status'] = this.status;
        data['inuse'] = this.inuse;
        data['syncCreate'] = this.syncCreate;
        data['syncLastUpd'] = this.syncLastUpd;
        data['lastSyncBy'] = this.lastSyncBy;
        data['createDate'] = this.createDate;
        data['createBy'] = this.createBy;
        data['updateDate'] = this.updateDate;
        data['updateBy'] = this.updateBy;
        data['active'] = this.active;
        return data;
    }

    clone() {
        const json = this.toJSON();
        let result = new UploadFlightTimeDto();
        result.init(json);
        return result;
    }
}

export interface IUploadResultDto {
    originalFileName: string[];
    uploadedFullPath: string[];
    errorMsg: string[];
    status: boolean;
}

export class UploadResultDto implements IUploadResultDto {
    originalFileName: string[];
    uploadedFullPath: string[];
    errorMsg: string[];
    status: boolean;

    static fromJS(data: any): UploadResultDto {
        let result = new UploadResultDto();
        result.init(data);
        return result;
    }

    constructor(data?: IUploadResultDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.originalFileName = data['originalFileName'];
            this.uploadedFullPath = data['uploadedFullPath'];
            this.errorMsg = data['errorMsg'];
            this.status = data['status'];
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['originalFileName'] = this.originalFileName;
        data['uploadedFullPath'] = this.uploadedFullPath;
        data['errorMsg'] = this.errorMsg;
        data['status'] = this.status;
        return data;
    }

    clone() {
        const json = this.toJSON();
        let result = new UploadResultDto();
        result.init(json);
        return result;
    }
}
