const fs = require('fs');
const path = require('path');

const candidatePaths = [
  path.join('/tmp', 'guestlist-data.json'),
  path.join(__dirname, '../../guestlist-data.json')
];

function getGuestlistFilePath() {
  return candidatePaths[0];
}

function readGuestlist() {
  for (const filePath of candidatePaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      continue;
    }
  }

  return [];
}

function writeGuestlist(names) {
  const filePath = getGuestlistFilePath();

  try {
    fs.writeFileSync(filePath, JSON.stringify(names, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(readGuestlist())
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const name = (body.name || '').trim();

      if (!name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name is required' })
        };
      }

      const names = readGuestlist();
      if (!names.includes(name)) {
        names.push(name);
        writeGuestlist(names);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(names)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Unable to save guestlist' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
