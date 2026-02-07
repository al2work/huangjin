const https = require('https');

// 118.AU9999, klt=101 (Daily), lmt=10
const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=118.AU9999&fields1=f1&fields2=f51,f52,f53,f54,f55,f56,f57,f61&klt=101&fqt=1&end=20500101&lmt=10`;

https.get(url, {
  headers: {
    'Referer': 'https://quote.eastmoney.com/'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`History Response: ${data}`);
  });
}).on('error', (err) => {
  console.error(`Error fetching history: ${err.message}`);
});
