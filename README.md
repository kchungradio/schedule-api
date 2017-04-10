# KCHUNG Radio Schedule API
Get every KCHUNG Radio broadcast event for the current month. Or specify a year and a month.

- https://kchungradio-schedule-api.now.sh/
- https://kchungradio-schedule-api.now.sh/2017/03

The API pulls data from the KCHUNG Radio Broadcast Schedule Google Calendar.

## Usage

### Requesting Data

When requesting data from the API, you'll receive json in the following format:

```json
{
  "id":"9inr77jglg5qpuu68qc8k25voc_20170401T190000Z",
  "name":"primary ingredients",
  "start":"2017-04-01T12:00:00-07:00",
  "end":"2017-04-01T13:00:00-07:00",
  "url":"http://lacarchive.com/kchung/archive/show/primary%20ingredients"
}
```

### Replacing the URL

By default, the `url` field will be generated automatically by the api, like in the example above. `name` is processed by [`encodeURI()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI) to escape certain characters.

If there is a url anywhere in the description field in the Google Calendar then that will be used instead.
