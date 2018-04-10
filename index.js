const url = require('url')
const validator = require('validator')
const htmlToText = require('html-to-text')

const jwt = require('./lib/auth/jwt')
const calendars = require('./lib/calendars')

module.exports = async function (req, res) {
  let pathname, date, events, year, month, err

  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }

  // get query params from url
  pathname = url
    .parse(req.url)
    .pathname
    .split('/')
  if (pathname.length !== 3) {
    // get current year and month
    const now = new Date()

    year = now.getUTCFullYear()
    month = now.getUTCMonth() + 1
  } else {
    year = pathname[1]
    month = pathname[2]
  }

  date = new Date(Date.UTC(year, month - 1))

  if (isNaN(date.getTime())) {
    err = new Error('Not a date')
    err.statusCode = 400
    throw err
  }

  try {
    events = await fetchEvents(date)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  return events
}

async function fetchEvents (date) {
  // TODO: put this function in lib/calendar?
  let googleEvents

  try {
    await calendars.auth(jwt)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  try {
    googleEvents = await calendars
      .getEvents(date.getUTCFullYear(), date.getUTCMonth() + 1)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  const events = googleEvents.map(event => {
    let sanitizedEvent = {
      id: event.id,
      name: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      url: generateLacaUrl(event.summary)
    }

    // find url in description
    let url
    if (event.description) {
      const parsedDescription = htmlToText.fromString(event.description, {
        preserveNewlines: true,
        hideLinkHrefIfSameAsText: true
      })
      url = parsedDescription.split('\n').filter(line => {
        // is url and is not email address
        return validator.isURL(line) && line.indexOf('@') === -1
      })[0]
      if (url) sanitizedEvent.url = url
    }

    return sanitizedEvent
  }).filter(event => {
    return !(event.name.includes('TENTATIVE') ||
      event.name.includes('TBD') ||
      event.name.includes('Open Slot') ||
      event.name.includes('DONOTLIST'))
  })

  return events
}

const generateLacaUrl = showName => (
  encodeURI(`http://lacarchive.com/kchung/archive/show/${showName}`)
)
