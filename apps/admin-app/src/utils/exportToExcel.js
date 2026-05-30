import * as XLSX from "xlsx";

/**
 * Download data as a formatted Excel file with multiple sheets.
 * @param {Array<{ name: string, rows: object[] }>} sheets
 * @param {string} filename  e.g. "catalog-export"
 */
export function exportToExcel(sheets, filename = "export") {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, rows }) => {
    if (!rows || rows.length === 0) {
      const ws = XLSX.utils.aoa_to_sheet([["No data available"]]);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-width columns
    const colWidths = {};
    rows.forEach(row => {
      Object.entries(row).forEach(([key, val]) => {
        const len = String(val ?? "").length;
        colWidths[key] = Math.max(colWidths[key] ?? key.length, len, 10);
      });
    });
    ws["!cols"] = Object.values(colWidths).map(w => ({ wch: Math.min(w + 2, 50) }));

    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportSheetToExcel(rows, sheetName, filename) {
  exportToExcel([{ name: sheetName, rows }], filename);
}