const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
const he = require('he');

class EasyGoogleTranslate {
  constructor(sourceLanguage = 'auto', targetLanguage = 'tr', timeout = 5) {
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.timeout = timeout;
  }

  async makeRequest(targetLanguage, sourceLanguage, text, timeout) {
    const escapedText = querystring.escape(text);
    const url = `https://translate.google.com/m?tl=${targetLanguage}&sl=${sourceLanguage}&q=${escapedText}`;

    try {
      const response = await axios.get(url, { timeout });
      const result = response.data.match(/class="(?:t0|result-container)">([\s\S]*?)</);
      if (!result) {
        console.error('\nError: Unknown error.');
        console.log(response.data);
        process.exit(0);
      }
      return he.decode(result[1]);
    } catch (error) {
      console.error('\nError:', error.message);
      process.exit(0);
    }
  }

  async translate(text, targetLanguage = '', sourceLanguage = '', timeout = '') {
    if (!targetLanguage) {
      targetLanguage = this.targetLanguage;
    }
    if (!sourceLanguage) {
      sourceLanguage = this.sourceLanguage;
    }
    if (!timeout) {
      timeout = this.timeout;
    }
    if (text.length > 5000) {
      console.error(`\nError: It can only detect 5000 characters at once. (${text.length} characters found.)`);
      process.exit(0);
    }
    if (Array.isArray(targetLanguage)) {
      const promises = targetLanguage.map(target =>
        this.makeRequest(target, sourceLanguage, text, timeout));
      return Promise.all(promises);
    }
    return this.makeRequest(targetLanguage, sourceLanguage, text, timeout);
  }

  async translateFile(filePath, targetLanguage = '', sourceLanguage = '', timeout = '') {
    try {
      const fileData = await fs.promises.readFile(filePath, 'utf-8');
      return this.translate(fileData, targetLanguage, sourceLanguage, timeout);
    } catch (error) {
      console.error('\nError:', error.message);
      process.exit(0);
    }
  }
}

const translator = new EasyGoogleTranslate('fa', 'en', 300000);

async function translateText(text, targetLang) {
  var tl = targetLang;
  if (targetLang === 'iw') {
    tl = 'tr';
  }
  try {
    console.log(text);
    console.log(tl);
    const translation = await translator.translate(text, tl, 'fa', 300000);
    console.log(translation);
    return translation;
  } catch (error) {
    return await translateText(text, targetLang);
  }
}

async function translateFiles(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      const localeFolder = file.name;
      const localePath = `${directory}/${localeFolder}`;
      const jsonFiles = fs.readdirSync(localePath).filter(file => file.endsWith('.json'));
      const faFile = jsonFiles.find(file => file === 'fa.json');

      if (faFile) {
        for (const jsonFile of jsonFiles) {
          console.log(jsonFile.split('.')[0]);
          if (jsonFile !== 'fa.json') {
            const filePath = `${localePath}/${jsonFile}`;
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            for (const key in data) {
              const value = data[key];
              data[key] = await translateText(value, jsonFile.split('.')[0]);
            }

            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`Translated file: ${filePath}`);
          }
        }
      }
    }
  }
}
// const services = ["rating", "bnpl", "show-up-time", "safety", "ride-preview", "garichi", "active-ride", "ride"];
const services = ["server"];
async function mn() {
  for (const service of services) {
    await translateFiles("/media/tapsi/Secure/backend/tap30/backend/" + service);
  }
}

mn();