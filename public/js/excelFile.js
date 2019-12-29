function makeExcelFile (tableName, fileName, sheetName) {
    TableToExcel.convert(document.getElementById(tableName), {
        name: fileName,
        sheet: {
            name: sheetName
        }
    });
};