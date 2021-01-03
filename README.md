NodeJS version of barbora-delivery-spot-alert with push notification support

Usage:

1. `yarn`
2. Put barbora.lt cookie to `COOKIE` variable in `.env` file.
3. Select your preferred delivery or pickup address in barbora.lt.
4. (Optional) To receive push notifications, set FCM server key and device token to `FCM_SERVER_KEY` and `FCM_TOKEN` variables in `.env`.
5. (Optional) To only get notified of times earlier than some date, set `LATEST_DELIVERY_INTERVAL_IN_DAYS` in `.env`.
6. `yarn start`
