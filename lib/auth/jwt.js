var google = require('googleapis')

module.exports = new google.auth.JWT(
  process.env.GOOGLE_API_CLIENT_EMAIL,
  null,
  Buffer.from(process.env.GOOGLE_API_PRIVATE_KEY_BASE64, 'base64').toString(
    'ascii'
  ),
  ['https://www.googleapis.com/auth/calendar.readonly'],
  process.env.GOOGLE_USER_EMAIL
)
