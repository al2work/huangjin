const https = require('https');
const querystring = require('querystring');

function fetchSgeSilver() {
  const postData = querystring.stringify({
    start: '2026-01-20',
    end: ''
  });

  const options = {
    hostname: 'www.sge.com.cn',
    port: 443,
    path: '/graph/DayilyShsilverJzj',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0',
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
        console.log('Keys:', Object.keys(json));
        
        if (json.zp) {
          console.log('Morning (zp) count:', json.zp.length);
          if (json.zp.length > 0) {
             const last = json.zp[json.zp.length - 1];
             console.log('Last ZP:', new Date(last[0]).toISOString(), last[1]);
          }
        }
        
        if (json.wp) {
          console.log('Afternoon (wp) count:', json.wp.length);
          if (json.wp.length > 0) {
             const last = json.wp[json.wp.length - 1];
             console.log('Last WP:', new Date(last[0]).toISOString(), last[1]);
          }
        } else {
          console.log('No WP data found!');
        }

        // Check around Feb 5th
        const targetDate = new Date('2026-02-05').getTime();
        // Adjust for timezone if needed, usually timestamps are 16:00 UTC previous day for 00:00 CST? 
        // Or SGE timestamps might be noon?
        // Let's print the last 5 entries of both.
        
        console.log('\n--- Last 5 Morning (ZP) ---');
        json.zp.slice(-5).forEach(x => console.log(new Date(x[0]).toISOString(), x[1]));

        if (json.wp) {
            console.log('\n--- Last 5 Afternoon (WP) ---');
            json.wp.slice(-5).forEach(x => console.log(new Date(x[0]).toISOString(), x[1]));
        }

      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.log('Raw:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (e) => {
    console.error('Problem with request:', e.message);
  });

  req.write(postData);
  req.end();
}

fetchSgeSilver();
