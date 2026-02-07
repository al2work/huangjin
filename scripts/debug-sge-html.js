const https = require('https');

const options = {
  hostname: 'www.sge.com.cn',
  port: 443,
  path: '/sjzx/jzj',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Search for table rows with the date
    const tableRowRegex = /<tr[\s\S]*?2026-02-06[\s\S]*?<\/tr>/g;
    const matches = data.match(tableRowRegex);
    if (matches) {
      console.log('Table rows found:');
      matches.forEach(m => console.log(m.replace(/\s+/g, ' ').substring(0, 500)));
    } else {
      console.log('No table rows for 2026-02-06 found');
      // Try finding just the date in td
      const tdRegex = /<td[\s\S]*?2026-02-06[\s\S]*?<\/td>/g;
      const tdMatches = data.match(tdRegex);
      if (tdMatches) {
        console.log('TDs found:', tdMatches);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('Problem with request:', e.message);
});

req.end();
