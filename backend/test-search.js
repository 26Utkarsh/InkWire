import axios from 'axios';

async function test() {
  const query = 'isro mars mission managalyan 2';
  try {
    console.log(`Querying Wikipedia for: "${query}"...`);
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        search: query.trim(),
        limit: 10,
        format: 'json',
        origin: '*'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    console.log('Success! Response data:', response.data);
  } catch (err) {
    console.error('Error occurred:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
}

test();
