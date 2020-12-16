import { Storage } from 'aws-amplify';

async function downloadForms(logger = (x, y) => `${x} ${y}`) {
  try {
    const fileList = await Storage.list('digi-form.');
    const jsonData = await Promise.all(fileList.map(async (item) => {
      const data = await Storage.get(item.key, { download: true });
      const bodyText = await data.Body.text();
      const fileData = JSON.parse(bodyText);
      logger(item.key, bodyText);
      return fileData;
    }));
    logger('final-json', JSON.stringify(jsonData));
    return jsonData;
  } catch (err) {
    logger('error', JSON.stringify(err));
    return;
  }
}

export default downloadForms;
