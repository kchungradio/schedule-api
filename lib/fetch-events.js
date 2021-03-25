const calendars = require('./calendars')
const jwt = require('./auth/jwt')

module.exports = async function fetchEvents(date) {
  try {
    await calendars.auth(jwt)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  let googleEvents
  try {
    googleEvents = await calendars.getEvents(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1
    )
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  return googleEvents
}
