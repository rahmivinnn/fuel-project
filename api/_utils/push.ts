export async function sendPush(registrationTokens: string[], payload: any) {
  const serverKey = process.env.FCM_SERVER_KEY as string
  if (!serverKey || !registrationTokens || registrationTokens.length === 0) return
  const url = 'https://fcm.googleapis.com/fcm/send'
  const body = {
    registration_ids: registrationTokens,
    notification: {
      title: payload.title || 'Notification',
      body: payload.body || ''
    },
    data: payload.data || {}
  }
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${serverKey}`
    },
    body: JSON.stringify(body)
  })
}