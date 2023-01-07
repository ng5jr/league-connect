import { authenticate, createHttpSession, createHttp2Request } from 'league-connect'
import fetch from 'node-fetch'

// Credentials LOL
const credentials = await authenticate()
const session = await createHttpSession(credentials)

// BOT TELEGRAM

class TelegramBotSetup {
  constructor(token) {
    this.token = token
    this.requestUrl = 'https://api.telegram.org/bot'
  }

  api(type, method, body) {
    return new Promise((resolve, reject) => {
      fetch(this.requestUrl + this.token + type, {
        method: method,
        body: body
      })
        .then((res) => {
          resolve(res.json())
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

class Bot extends TelegramBotSetup {
  constructor(botToken, defaultChatID) {
    super(botToken)
    this.dcid = defaultChatID
  }

  static start() {
    console.log('start')
  }

  async getUpdates() {
    try {
      const result = await this.api('/getUpdates', 'GET')
      return await result
    } catch (e) {
      return await e
    }
  }

  async getMe() {
    try {
      const result = await this.api('/getMe', 'GET')
      return await result
    } catch (e) {
      return await e
    }
  }

  async sendMessage(text, chatID, parseMode, disableNotification) {
    try {
      const result = await this.api(
        `/sendMessage?text=${text}&chat_id=${chatID ? chatID : this.dcid}&parse_mode=${
          parseMode ? parseMode : 'html'
        }&disable_notification=${disableNotification ? disableNotification : false}`,
        'GET'
      )
      return await result
    } catch (e) {
      return await e
    }
  }
}

Bot.start()

const bot = new Bot('5839890843:AAGIwRkGbaFslIpSxf1YkUQ1swYlaLYmgv8', '-1001706112553')
let telegramData
let filteredArray = []
var intervalID
var intervalTelegram

const sendMessage = (msg) => {
  bot
    .sendMessage(msg, null, null, true)
    .then((res) => {
      console.log('Success!')
    })
    .then(() => {
      console.log('Mensaje enviado')
    })
    .catch((err) => console.log(err))
}

const checkFriend = async () => {
  const request = await createHttp2Request(
    {
      method: 'GET',
      url: '/lol-chat/v1/friends'
    },
    session,
    credentials
  )

  const friends = request.json()
  filteredArray = friends.filter((obj) => obj.gameName === 'P3lad0' || obj.gameName === 'Nattyvegan')

  filteredArray.map((pela) => {
    if (pela.availability !== 'offline' && pela.availability !== 'mobile') {
      if (pela.availability === 'dnd') {
        pela.availability = 'EN PARTIDA'
      }
      if (pela.availability === 'chat') {
        pela.availability = 'ONLINE'
      }
      if (pela.availability === 'away') {
        pela.availability = 'AUSENTE'
      }

      const text = `EL PELADO ESTA ${pela.availability} EN ${pela.gameName}`
      sendMessage(text)
      clearInterval(intervalID)
    }
  })
}

var timestamp

function telegramFunction() {
  bot
    .getUpdates()
    .then((data) => {
      const index = data.result.length - 1
      telegramData = data.result[index]
    })
    .then(() => {
      if (telegramData.message.text === 'Start' && telegramData.message.date !== timestamp) {
        console.log('inicia check')
        timestamp = telegramData.message.date

        startChecking()
      }
    })
}

function startChecking() {
  intervalID = setInterval(checkFriend, 10000)
}

function startMonitoring() {
  console.log('start monitoring')
  intervalTelegram = setInterval(telegramFunction, 5000)
}

startMonitoring()

// whatsapp and lol

// let sessionData

// Use the saved values
// const client = new Client({
//   authStrategy: new LocalAuth({
//     session: sessionData
//   })
// })

// client.on('qr', (qr) => {
//   console.log('QR RECEIVED', qr)
// })

// client.on('authenticated', (session) => {
//   console.log('authenticated')

//   sessionData = session
// })

// client.on('ready', () => {
//   console.log('Client is ready!')
//   const number = '+5492262352458'
//   const chatId = number.substring(1) + '@c.us'

// })
