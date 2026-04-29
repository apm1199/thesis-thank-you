export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path, data } = req.body;

  const GH_USER = 'apm1199';
  const GH_REPO = 'thesis-thank-you';
  const GH_BRANCH = 'main';
  const token = process.env.GH_TOKEN;

  const apiUrl = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${path}`;

  // prende SHA se file esiste
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });

  let sha = null;
  if (getRes.ok) {
    const current = await getRes.json();
    sha = current.sha;
  }

  const content = Buffer.from(
    JSON.stringify(data, null, 2),
    'utf8'
  ).toString('base64');

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `update ${path}`,
      content,
      branch: GH_BRANCH,
      ...(sha ? { sha } : {})
    })
  });

  const result = await putRes.json();

  if (!putRes.ok) {
    return res.status(putRes.status).json(result);
  }

  return res.status(200).json(result);
}
