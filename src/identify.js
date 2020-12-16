import { Predictions, Storage } from 'aws-amplify';
import transform from './transform';

async function identifyText(event, logger = (x, y) => `${x} ${y}`) {
  const { target: { files } } = event;
  const [file,] = files || [];
  const buketURL = 'https://digitrade-s3234231-dev.s3-ap-southeast-2.amazonaws.com/public/';

  if (!file) {
    return;
  }    

  try {
    const response = await Predictions.identify({
      text: {
        source: {
          file,
        },
        format: "ALL", // Available options "PLAIN", "FORM", "TABLE", "ALL"
      }
    })
  
    logger('digi-raw', JSON.stringify(response));

    const formData = await transform(JSON.stringify(response));
    const fileName = formData.name.replace(/\s/g, '') || file.name;
    formData.imageUrl = `${buketURL}${fileName}`;
    logger('digi-form', JSON.stringify(formData));

    const imgResp = await Storage.put(fileName, file, {
      contentType: file.type || 'image/png',
    });
    logger(`Upload img`, JSON.stringify(imgResp));

    const rawResp = await Storage.put(`digi-raw.${fileName}.json`, JSON.stringify(response), {
      contentType: 'text/json'
    });
    logger(`Upload raw json`, JSON.stringify(rawResp));
    logger(`raw json:`, JSON.stringify(response));

    const formResp = await Storage.put(`digi-form.${fileName}.json`, JSON.stringify(formData), {
      contentType: 'text/json'
    });
    logger(`Upload form json`, JSON.stringify(formResp));
    logger(`form json:`, JSON.stringify(formData));

    return formData;
  } catch (err) {
    logger('error', JSON.stringify(err));
    return;
  }
}

export default identifyText;
