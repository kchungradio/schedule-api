const validator = require('validator')
const htmlToText = require('html-to-text')

module.exports = function sanitizeEvent (event) {
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
