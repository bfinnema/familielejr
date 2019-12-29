function makeExcelFile (tableName) {
    TableToExcel.convert(document.getElementById(tableName), {
        name: "table1.xlsx",
        sheet: {
            name: "deltagerliste"
        }
    });
}
