const http = require('http');

const url = 'http://localhost:3000/api/history?symbol=GOLD&period=1m';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.data && json.data.length > 0) {
        const last = json.data[json.data.length - 1];
        const first = json.data[0];
        console.log('First date:', new Date(first.time * 1000).toISOString());
        console.log('Last date:', new Date(last.time * 1000).toISOString());
        console.log('Data count:', json.data.length);
      } else {
        console.log('No data found');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
