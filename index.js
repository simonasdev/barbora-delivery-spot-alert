import env from 'dotenv'
import fetch from 'node-fetch'
import notifier from 'node-notifier'

env.config()

const { COOKIE, FCM_SERVER_KEY, FCM_TOKEN } = process.env

const deliveryTimesURL = 'https://www.barbora.lt/api/eshop/v1/cart/deliveries'
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
const title = 'Barbora available delivery times'

async function run() {
  const response = await fetch(deliveryTimesURL, deliveryRequestInfo)

  if (response.status !== 200) {
    return console.log(response.status)
  }

  const body = await response.json()

  const availableTimes = body.deliveries[0].params.matrix.flatMap(({ hours }) =>
    hours.filter(({ available }) => available).map(({ deliveryTime }) => deliveryTime)
  )

  if (availableTimes.length) {
    const message = availableTimes.join(', ')

    if (FCM_TOKEN) {
      fetch(fcmURL, {
        ...fcmRequestInfo,
        body: JSON.stringify({
          to: FCM_TOKEN,
          notification: {
            title,
            body: message
          }
        })
      })
    } else {
      notifier.notify({
        title,
        message
      })
    }
  }
}

setInterval(run, 60000)

run()
