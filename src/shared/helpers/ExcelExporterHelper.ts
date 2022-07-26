import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
type AOA = any[][];

const EXCEL_TYPE = 'application/octet-stream';
// const EXCEL_TYPE = 'application/vnd.ms-excel';

const EXCEL_EXTENSION = '.xlsx';

export function exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'Sheet1': worksheet }, SheetNames: ['Sheet1'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'array' });
    saveAsExcelFile(excelBuffer, excelFileName);
}

function saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    // const data: Blob = new Blob([this.csvData], { type: 'text/csv;charset=utf-8;' });  
    // FileSaver.saveAs(data, "CSVFile" + new Date().getTime() + '.csv'); 
}
