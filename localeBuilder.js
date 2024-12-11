const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function updateJSONFiles(localeFolder, excelFile) {
  const workbook = XLSX.readFile(excelFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const jsonFiles = ['fa.json', 'en.json', 'ar.json', 'iw.json'];
  for (const jsonFile of jsonFiles) {
    const filePath = path.join(localeFolder, jsonFile);
    if (fs.existsSync(filePath)) {
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const columnIdx = jsonFiles.indexOf(jsonFile) + 1;

      for (let row = 2; sheet[`A${row}`]; row++) {
        const key = sheet[`A${row}`].v;
        const value = sheet[`${String.fromCharCode(65 + columnIdx)}${row}`]?.v;

        if (key in jsonData) {
          jsonData[key] = value;
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4));
    }
  }

  console.log('JSON files updated successfully.');
}

// Specify the directory where the locale folder is located
const localeDirectory = './locale';

// Specify the path to the Excel file
const excelFilePath = './locale.xlsx';

// Call the function to update the JSON files
updateJSONFiles(localeDirectory, excelFilePath);
