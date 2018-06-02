const calendars = require('./calendars')
const jwt = require('./auth/jwt')
const sanitizeEvent = require('./sanitize-event')
const filterEvent = require('./filter-event')

module.exports = async function fetchEvents (date) {
  try {
    await calendars.auth(jwt)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  let googleEvents
  try {
    googleEvents = await calendars
      .getEvents(date.getUTCFullYear(), date.getUTCMonth() + 1)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  return googleEvents.map(sanitizeEvent).filter(filterEvent)
}
