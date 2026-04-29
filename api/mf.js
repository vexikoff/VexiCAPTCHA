const crypto = require('crypto');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const { token, answer, _meta } = JSON.parse(body);

      if (!_meta || !_meta.secret || !_meta.hash) {
        return res.status(400).json({ success: false, verified: false });
      }

      const userHash = crypto
        .createHmac('sha256', _meta.secret)
        .update(answer.toLowerCase().trim())
        .digest('hex');

      const isMatch = crypto.timingSafeEqual(
        Buffer.from(userHash),
        Buffer.from(_meta.hash)
      );

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        verified: isMatch,
        token: token
      });

    } catch (err) {
      res.status(400).json({ success: false, verified: false });
    }
  });
};