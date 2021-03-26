const url = require('url')

const { createError } = require('micro')
const htmlToText = require('html-to-text')
const getEmails = require('get-emails')

const fetchEvents = require('./lib/fetch-events')
const sanitizeEvent = require('./lib/sanitize-event')
const filterEvent = require('./lib/filter-event')

module.exports = async function(req, res) {
  // allow public access to our api from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*')

  // get the pathname "/year/month" from the url as ['', year, month]
  const pathname = url.parse(req.url).pathname.split('/')
  if (pathname[1].includes('favicon')) {
    return 'fav'
  }

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

  return printEmails(events)
  // printCsv(events)

  return 'done'

  // return the events as a json 200 OK response
  return events.map(sanitizeEvent).filter(filterEvent)
}

function printEmails(events) {
  let allEmails = []

  events.forEach(event => {
    const parsedDescription = htmlToText.fromString(event.description, {
      preserveNewlines: true,
      hideLinkHrefIfSameAsText: true
    })

    const emails = Array.from(getEmails(parsedDescription))
    if (emails && emails.length) {
      allEmails = allEmails.concat(emails)
    }
  })

  const emailSet = new Set(allEmails)
  const emailArray = Array.from(emailSet)

  emailArray.forEach(email => {
    console.log(email)
  })

  return emailArray.join('\n')
}

function printCsv(events) {
  events.forEach(event => {
    const parsedDescription = htmlToText.fromString(event.description, {
      preserveNewlines: true,
      hideLinkHrefIfSameAsText: true
    })

    let str = `"${event.summary}", `

    str = str + `"${parsedDescription}", `

    const emails = Array.from(getEmails(parsedDescription))
    if (emails && emails.length) {
      str = str + emails.join(', ')
    }

    console.log(str)
  })
}
