const googleCalendar = require('googleapis').calendar('v3')

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
      auth, calendarId, timeMin, timeMax, singleEvents: true
    }

    return new Promise(function (resolve, reject) {
      googleCalendar.events.list(request, (err, res) => {
        if (err) return reject(err)
        resolve(res.items)
      })
    })
  },

  _getDates (year, month) {
    const timeMin = new Date(year, month - 1, 1).toISOString()
    const timeMax = new Date(year, month, 0, 23, 59, 59).toISOString()
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
