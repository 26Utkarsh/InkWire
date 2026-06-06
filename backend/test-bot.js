import axios from 'axios';

async function test() {
  const query = 'isro mars mission mangalyaan 2';
  try {
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        search: query,
        limit: 10,
        format: 'json',
        origin: '*'
      },
      headers: {
        'User-Agent': 'InkWireNewsBot/1.0 (admin@inkwire.com)'
      },
      timeout: 5000
    });
    console.log('Bot Agent Success! Response data:', response.data);
  } catch (err) {
    console.log('Bot Agent Failed! Error:', err.message);
    if (err.response) {
      console.log('Status:', err.response.status);
    }
  }
}

test();
