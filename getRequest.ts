/**
 *    ____                  __________
 *   / __ \_   _____  _____/ __/ / __ \_      __
 *  / / / / | / / _ \/ ___/ /_/ / / / / | /| / /
 * / /_/ /| |/ /  __/ /  / __/ / /_/ /| |/ |/ /
 * \____/ |___/\___/_/  /_/ /_/\____/ |__/|__/
 *
 * The copyright indication and this authorization indication shall be
 * recorded in all copies or in important parts of the Software.
 *
 * @author 0verfl0w767
 * @link https://github.com/0verfl0w767
 * @license MIT LICENSE
 *
 */

import * as fs from 'fs'
import fetch from 'node-fetch'

interface BusStatusRaw {
  returnCode?: number
  data?: [
    {
      id: string
      name: string
      lat: number
      lon: number
      status: string
      routeid: number
      updatetime: number
      num: string
      os: string
      model: string
    },
  ]
}

interface BusStatusNew {
  time: string
  returnCode?: number
  data?: [
    {
      id: string
      name: string
      lat: number
      lon: number
      status: string
      routeid: number
      updatetime: number
    },
  ]
}

const getDate = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return year + '-' + month + '-' + day
}

const getTime = (): string => {
  const today = new Date()
  const hours = ('0' + today.getHours()).slice(-2)
  const minutes = ('0' + today.getMinutes()).slice(-2)
  const seconds = ('0' + today.getSeconds()).slice(-2)
  return hours + ':' + minutes + ':' + seconds
}

const getResponse = async (): Promise<void> => {
  const time = getDate() + ' ' + getTime()

  if (new Date().getDay() == 0 || new Date().getDay() == 6) {
    console.log(time + ' / API data loading failed. Not weekday.')
    return
  }

  if (new Date().getHours() < 8 || new Date().getHours() > 19) {
    console.log(time + ' / API data loading failed. Not time.')
    return
  }

  const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'))
  const response = await fetch(config['url'], config['options'])

  if (!response.ok) {
    response.text().then((text) => {
      throw new Error(text)
    })
    console.log(time + ' / API data loading failed. Error.')
    return
  }

  const rawJson: BusStatusRaw = JSON.parse(JSON.stringify(await response.json()))
  const newJson: Partial<BusStatusNew> = {}

  newJson['time'] = time
  newJson['returnCode'] = rawJson['returnCode']
  newJson['data'] = rawJson['data']

  fs.writeFile('api.json', JSON.stringify(newJson, null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })

  let busNumbers = newJson['data']?.map((element) => {
    return element['name']
  })

  console.log(time + ' / API [ ' + busNumbers?.join(', ') + ' ] data loading completed.')
}

setInterval(() => {
  getResponse()
}, 1000 * 2)
