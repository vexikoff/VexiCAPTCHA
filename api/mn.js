const { v4: uuidv4 } = require('uuid');
const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const token = uuidv4();

  const captcha = svgCaptcha.create({
    size: 6,
    ignoreChars: 'O0I1il',
    noise: 3,
    color: true,
    width: 280,
    height: 90
  });

  const answerHash = crypto
    .createHmac('sha256', sessionSecret)
    .update(captcha.text.toLowerCase())
    .digest('hex');

  res.setHeader('Content-Type', 'application/json');

  res.status(200).json({
    token: token,
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(captcha.data)}`,
    _meta: {
      secret: sessionSecret,
      hash: answerHash
    }
  });
};