const TRACKS = [];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api/, '');

  if (pathname === '/tracks' || pathname === '/tracks/' || pathname === '') {
    return res.status(200).json({ success: true, tracks: TRACKS });
  }

  if (pathname === '/stream/local') {
    const file = url.searchParams.get('file');
    if (file) {
      return res.redirect(302, `/songs/${encodeURIComponent(file)}`);
    }
    const id = url.searchParams.get('id');
    const found = TRACKS.find(t => t.id === id);
    if (found) {
      return res.redirect(302, `/songs/${encodeURIComponent(found.relPath)}`);
    }
    return res.status(404).send('Track not found');
  }

  if (pathname === '/playlists') {
    return res.status(200).json({ success: true, playlists: [] });
  }

  if (pathname === '/todos') {
    return res.status(200).json({ success: true, todos: [] });
  }

  if (pathname === '/auth/register' || pathname === '/auth/login') {
    const body = req.body || {};
    const name = body.name || body.username || body.identifier || 'User';
    return res.status(200).json({
      success: true,
      token: `session_${Date.now()}`,
      user: { id: `usr_${Date.now()}`, username: name, email: body.email || `${name}@user.com`, name }
    });
  }

  return res.status(200).json({ success: true, message: 'White Devil Music API' });
};
