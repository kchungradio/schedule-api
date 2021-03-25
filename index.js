const url = require('url')

const { createError } = require('micro')

const fetchEvents = require('./lib/fetch-events')
const sanitizeEvent = require('./lib/sanitize-event')
const filterEvent = require('./lib/filter-event')

module.exports = async function(req, res) {
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
  return events.map(sanitizeEvent).filter(filterEvent)
}
