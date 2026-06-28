const express = require('express');
const router = express.Router();
const { sendMail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');

router.post('/test-email', async (req, res) => {
  try {
    const { to, template, data } = req.body;
    
    if (!templates[template]) {
      return res.status(400).json({ success: false, message: 'Template không tồn tại' });
    }

    const mailOptions = templates[template](data || {});
    const result = await sendMail({ to, ...mailOptions });

    if (result.success) {
      res.json({ success: true, message: 'Gửi email test thành công', messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, message: 'Gửi email thất bại', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
