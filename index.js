import env from 'dotenv'
import fetch from 'node-fetch'
import notifier from 'node-notifier'

env.config()

const { LATEST_DELIVERY_INTERVAL_IN_DAYS, COOKIE, FCM_SERVER_KEY, FCM_TOKEN } = process.env

const host = 'https://pagrindinis.barbora.lt'
const deliveryTimesURL = `${host}/api/eshop/v1/cart/deliveries`
const deliveryRequestInfo = {
  headers: {
    Authorization: 'Basic YXBpa2V5OlNlY3JldEtleQ==',
    Cookie: COOKIE
  }
}
const fcmURL = 'https://fcm.googleapis.com/fcm/send'
const fcmRequestInfo = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `key=${FCM_SERVER_KEY}`
  }
}
const notificationTitle = 'Barbora available delivery times'

async function run() {
  const response = await fetch(deliveryTimesURL, deliveryRequestInfo)

  if (response.status !== 200) {
    return console.log(response.status)
  }

  const body = await response.json()

  const availableTimes = filterAvailableTimes(body.deliveries[0].params.matrix)

  if (availableTimes.length) {
    const message = availableTimes.join(', ')

    if (FCM_TOKEN) {
      fetch(fcmURL, {
        ...fcmRequestInfo,
        body: JSON.stringify({
          to: FCM_TOKEN,
          notification: {
            title: notificationTitle,
            body: message
          }
        })
      })
    } else {
      notifier.notify({
        title: notificationTitle,
        message,
        open: host
      })
    }
  }
}

function filterAvailableTimes(list) {
  const availableTimes = list.flatMap(({ hours }) =>
    hours.filter(({ available }) => available).map(({ deliveryTime }) => deliveryTime)
  )

  if (LATEST_DELIVERY_INTERVAL_IN_DAYS) {
    const latestDate = new Date()
    latestDate.setDate(latestDate.getDate() + parseInt(LATEST_DELIVERY_INTERVAL_IN_DAYS))
    latestDate.setHours(23, 59, 59, 999)

    const timesBeforeLatestDate = availableTimes.filter(time => {
      const date = new Date(time)

      return date.getTime() < latestDate.getTime()
    })

    if (availableTimes.length && !timesBeforeLatestDate.length) {
      console.log('Available times found but filtered by latest delivery interval')
    }

    return timesBeforeLatestDate
  }

  return availableTimes
}

setInterval(run, 60000)

run()
