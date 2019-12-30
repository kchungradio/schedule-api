const validator = require('validator')
const htmlToText = require('html-to-text')

module.exports = function sanitizeEvent(event) {
  let sanitizedEvent = {
    id: event.id,
    name: event.summary,
    start: event.start.dateTime,
    end: event.end.dateTime,
    url: generateUrl(event.summary)
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

const generateUrl = showName => {
  const search = encodeURIComponent(slugify(showName))
  return `https://www.kchungradio.org/archive?search=${search}`
}

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-')
}
