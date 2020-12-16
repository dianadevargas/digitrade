import { Storage } from 'aws-amplify';
import transform from './transform';

async function transformRawFiles(logger = (x, y) => `${x} ${y}`) {
  try {
    const buketURL = 'https://digitrade-s3234231-dev.s3-ap-southeast-2.amazonaws.com/public/';
    // get all raw files and transform them
    const fileList = await Storage.list('digi-raw.');

    fileList.map(async (item) => {
      const imgFileName = item.key.replace(/digi-raw\./gi, '').replace(/\.json/i, '');
      const data = await Storage.get(item.key, { download: true });

      // Read the raw file
      data.Body.text().then(async (string) => {
        const formData = transform(string) || {};
        formData.imageUrl = `${buketURL}${imgFileName}`;
        logger(item.key, JSON.stringify(formData));

        // Save the transformed data
        await Storage.put(`digi-form.${imgFileName}.json`, JSON.stringify(formData), {
          contentType: 'text/json'
        });
      });
      return true;
    });
  } catch (err) {
    logger('error', JSON.stringify(err));
    return;
  }
}

export default transformRawFiles;
