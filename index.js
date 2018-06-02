const { createError } = require('micro')
const url = require('url')
const validator = require('validator')
const htmlToText = require('html-to-text')

const jwt = require('./lib/auth/jwt')
const calendars = require('./lib/calendars')

module.exports = async function (req, res) {
  // allow public access to our api from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*')

  // get the pathname "/year/month" from the url as ['', year, month]
  const pathname = url.parse(req.url).pathname.split('/')

  // set the year and month that we'll use to get events
  let year, month
  if (pathname.length !== 3) {
    // if the request didn't include a pathname,
    // then get the current year/month
    const now = new Date()
    year = now.getUTCFullYear()
    month = now.getUTCMonth() + 1
  } else {
    // otherwise get the provided year/month
    year = pathname[1]
    month = pathname[2]
  }

  // create a date from year/month
  const date = new Date(Date.UTC(year, month - 1))

  // throw an error if year/month does not make a date
  if (isNaN(date.getTime())) {
    throw createError(400, 'Not a date')
  }

  // fetch the events from google calendar
  let events
  try {
    events = await fetchEvents(date)
  } catch (err) {
    err.statusCode = 400
    throw err
  }

  // return the events as a json 200 OK response
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

  return googleEvents.map(sanitizeEvent).filter(filterEvent)
}

function sanitizeEvent (event) {
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
}

const generateLacaUrl = showName => (
  encodeURI(`http://lacarchive.com/kchung/archive/show/${showName}`)
)

function filterEvent (event) {
  if (!event.name) return false
  return !['TENTATIVE', 'TBD', 'Open Slot', 'DONOTLIST'].includes(event.name)
}
