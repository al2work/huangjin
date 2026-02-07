const https = require('https');

const codes = [
  'Au99.99',
  'Au99_99',
  'gds_Au99.99',
  'gds_Au99_99',
  'gds_AuTD',
  'AUTD',
  'hf_XAU', // Global
];

codes.forEach(code => {
  const url = `https://hq.sinajs.cn/list=${code}`;
  
  https.get(url, {
    headers: {
      'Referer': 'https://finance.sina.com.cn/'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Code: ${code}`);
      console.log(`Response: ${data.trim()}`);
      console.log('---');
    });
  }).on('error', (err) => {
    console.error(`Error fetching ${code}: ${err.message}`);
  });
});
