const https = require('https');
const querystring = require('querystring');

function fetchSgeData() {
  const postData = querystring.stringify({
    start: '2026-01-01',
    end: ''
  });

  const options = {
    hostname: 'www.sge.com.cn',
    port: 443,
    path: '/graph/DayilyJzj',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.sge.com.cn/sjzx/jzj',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.zp && json.zp.length > 0) {
          const last5 = json.zp.slice(-5);
          console.log('Last 5 entries from SGE (Morning):');
          last5.forEach(item => {
            const date = new Date(item[0]);
            console.log(`${date.toISOString()} (${item[0]}): ${item[1]}`);
          });
        } else {
          console.log('No ZP data found or format changed');
          console.log(data.substring(0, 200));
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.log('Raw data:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (e) => {
    console.error('Problem with request:', e.message);
  });

  req.write(postData);
  req.end();
}

fetchSgeData();
