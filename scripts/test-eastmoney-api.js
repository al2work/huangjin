const https = require('https');

const codes = [
  '118.AU9999', // SGE Gold 9999
  '118.AGTD',   // SGE Silver T+D
  '118.PT9995', // SGE Platinum 9995 (maybe)
];

codes.forEach(secid => {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?invt=2&fltt=2&fields=f43,f57,f58,f46,f44,f169,f170&secid=${secid}`;
  
  https.get(url, {
    headers: {
      'Referer': 'https://quote.eastmoney.com/'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Secid: ${secid}`);
      console.log(`Response: ${data}`);
      console.log('---');
    });
  }).on('error', (err) => {
    console.error(`Error fetching ${secid}: ${err.message}`);
  });
});
