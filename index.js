const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const PORT = process.env.PORT || 3000;

async function getPriceFeed() {
  try {
    const siteUrl = 'https://coinmarketcap.com';

    const { data } = await axios({
      method: 'GET',
      url: siteUrl,
    });
    const $ = cheerio.load(data);

    const elementSelector =
      '#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div > div.h7vnx2-1.bFzXgL > table > tbody > tr';

    const keys = [
      'rank',
      'name',
      'price',
      '24h',
      '7d',
      'marketCap',
      'volume',
      'circulatingSupply',
    ];
    const coinArr = [];

    $(elementSelector).each((parentIndex, parentElement) => {
      let keyIndex = 0;
      const coinObject = {};

      if (parentIndex <= 9) {
        $(parentElement)
          .children()
          .each((childIndex, childElement) => {
            let tdValue = $(childElement).text();

            if (keyIndex === 1 || keyIndex === 6) {
              tdValue = $('p:first-child', $(childElement).html()).text();
            }

            if (tdValue) {
              coinObject[keys[keyIndex]] = tdValue;

              keyIndex++;
            }
          });

        coinArr.push(coinObject);
      }
    });
    return coinArr;
  } catch (err) {
    console.log(err);
  }
}

const app = express();

app.get('/api/crypto-feed', async (req, res) => {
  try {
    const cryptoFeed = await getPriceFeed();
    return res.status(200).json({
      result: cryptoFeed,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
