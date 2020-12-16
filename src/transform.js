const transformTables = (itemData) => {
  let descriptionIndex = -1;
  let qtyIndex = -1;
  let unitPriceIndex = -1;
  let totalIndex = -1;
  for (let i = 0; i < itemData[0].length; i++) {
    switch (itemData[0][i].text.toLowerCase()) {
      case 'description':
        descriptionIndex = i;
        break;
      case 'qty':
        qtyIndex = i;
        break;
      case 'unit price':
        unitPriceIndex = i;
        break;
      case 'total':
        totalIndex = i;
        break;
    };
  };

  const items = [];
  for (let i = 1; i < itemData.length; i++) {
    const name = itemData[i][descriptionIndex].text;
    if (!name) {
      continue;
    }

    const qty = qtyIndex === -1 ? 1 : itemData[i][qtyIndex].text;
    const unitPrice = unitPriceIndex === -1 ? itemData[i][totalIndex].text : itemData[i][unitPriceIndex].text;

    items.push({
      name,
      qty,
      unitPrice,
    });
  };

  return items;
};

const transformLines = (lines) => {
  if (!lines) {
    return [];
  }

  const items = [];
  let processingItems = false;
  let name = '';
  let unitPrice = 0;
  lines.forEach(line => {
    if (line.toLowerCase().includes('@ subtotal')) {
      processingItems = false;;
    };

    if (processingItems) {
      if (line.startsWith('$')) {
        unitPrice = line.substring(1);
        items.push({
          name,
          qty: 1,
          unitPrice,
        })
        name = '';
        unitPrice = 0;
      } else {
        name = `${name} ${line}`;
      };
    }

    if (line.toUpperCase() === 'TAX INVOICE **') {
      processingItems = true;;
    };
  });

  return items;
};

const getReceiptName = (jsonInput) => {
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  const dateString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

  let receiptName = 'Receipt';
  const lines = jsonInput.text.lines;
  if (lines && lines.length > 0) {
    receiptName = lines[0];
  }

  return `${receiptName} - ${dateString}`;
};

const transform = (rawInput, fileName = null) => {
  const jsonInput = JSON.parse(rawInput);

  let items;
  const tables = jsonInput.text.tables;
  if (tables && tables.length === 1) {
    items = transformTables(tables[0].table);
  }
  else {
    items = transformLines(jsonInput.text.lines);
  }

  const receiptName = fileName || getReceiptName(jsonInput);

  const receipt = {
    name: receiptName,
    imageUrl: "",
    items,
  };

  return receipt;
};

export default transform;
