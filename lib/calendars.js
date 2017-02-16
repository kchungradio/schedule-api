const googleCalendar = require('googleapis').calendar('v3')
const moment = require('moment-timezone')

const calendarId = process.env.GOOGLE_CALENDAR_ID

module.exports = {
  auth (jwt) {
    this.jwt = jwt
  },

  getEvents (year, month) {
    this._check()
    const auth = this.jwt
    const { timeMin, timeMax } = this._getDates(year, month)

    const request = {
      auth, calendarId, timeMin, timeMax, singleEvents: true, orderBy: 'startTime', maxResults: 2500
    }

    return new Promise(function (resolve, reject) {
      googleCalendar.events.list(request, (err, res) => {
        if (err) return reject(err)
        resolve(res.items)
      })
    })
  },

  _getDates (year, month) {
    process.env.TZ && moment.tz.setDefault(process.env.TZ)

    const timeMin = moment.tz([year, month - 1], 'America/Los_Angeles').format()
    const timeMax = moment.tz([year, month - 1], 'America/Los_Angeles').endOf('month').format()

    return { timeMin, timeMax }
  },

  _check () {
    if (!this.jwt) {
      throw ReferenceError('Please include a jwt for authentication ' +
        'with the Google API by running `this.auth(jwt)`')
    }
    if (typeof this.jwt !== 'object') {
      throw TypeError('The jwt must be an object.')
    }
  }
}
