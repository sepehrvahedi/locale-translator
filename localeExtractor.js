const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const XlsxPopulate = require('xlsx-populate');

async function createExcelFile(service) {
  const localeFolder = "/media/tapsi/Secure/backend/tap30/backend/" + service + "/locale";
  const workbook = await XlsxPopulate.fromBlankAsync();
  const sheet = workbook.sheet(0);

  const jsonFiles = ['fa.json', 'en.json', 'ar.json', 'iw.json'];

  for (const jsonFile of jsonFiles) {
    const filePath = `${localeFolder}/${jsonFile}`;
    if (fs.existsSync(filePath)) {
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Add column headers
      sheet.cell(1, jsonFiles.indexOf(jsonFile) + 2).value(jsonFile.split('.')[0]);

      // Iterate over the keys and values
      let row = 2;
      for (const key in jsonData) {
        const value = jsonData[key];
        sheet.cell(row, 1).value(key);
        sheet.cell(row, jsonFiles.indexOf(jsonFile) + 2).value(value);
        row++;
      }
    }
  }

  // Save the Excel file
  const excelFile = `./excels/${service}.xlsx`;
  await workbook.toFileAsync(excelFile);
  console.log(`Excel file "${excelFile}" created successfully.`);
}

// services = ["rating", "direct-debit", "bnpl", "show-up-time", "safety", "ride-preview", "ride-initiator", "garichi", "reward", "active-ride", "ride"];
services = ["server"];
for (const service of services) {
  createExcelFile(service);
}