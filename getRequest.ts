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
      busstop: string
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

const getPrefix = (): string => {
  return '[' + getDate() + ' ' + getTime() + ']'
}

const getDistance = (pos1: any, pos2: any): any => {
  var lat1 = pos1['lat']
  var lng1 = pos1['lon']
  var lat2 = pos2['lat']
  var lng2 = pos2['lon']

  var R = 6371
  var dLat = deg2rad(lat2 - lat1)
  var dLon = deg2rad(lng2 - lng1)
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c
  var convert = +d.toFixed(5) * 1000 // convert km to m
  return convert
}

const deg2rad = (deg: any): any => {
  return deg * (Math.PI / 180)
}

const busStop: any = {
  '삼육대': {
    lat: 37.64349,
    lon: 127.105649,
  },
  '화랑대역': {
    lat: 37.619984,
    lon: 127.085462,
  },
  '태릉입구역': {
    lat: 37.617969,
    lon: 127.077054,
  },
  '석계역': {
    lat: 37.615088,
    lon: 127.067217,
  },
  '별내역': {
    lat: 37.642239,
    lon: 127.126747,
  },
  '월릉교': {
    lat: 37.6162,
    lon: 127.07129,
  },
  '경춘선숲길, 토끼굴앞': {
    lat: 37.6162,
    lon: 127.07129,
  },
  '봉화산역': {
    lat: 37.61745,
    lon: 127.091115,
  },
  '두산대림아파트': {
    lat: 37.61895,
    lon: 127.087818,
  },
  '화랑대사거리': {
    lat: 37.62158,
    lon: 127.087228,
  },
  '경춘선숲길': {
    lat: 37.623846,
    lon: 127.090894,
  },
  '서울여대, 육군사관학교': {
    lat: 37.626043,
    lon: 127.09468,
  },
  '태릉': {
    lat: 37.630241,
    lon: 127.098309,
  },
  '태릉선수촌': {
    lat: 37.633423,
    lon: 127.103218,
  },
  '삼육대 정문': {
    lat: 37.638211,
    lon: 127.107558,
  },
}

const nearBusStop = (pos: any): any => {
  let meter: any = {}
  for (let index in busStop) {
    meter[index] = getDistance(pos, busStop[index])
  }
  const sorted = Object.fromEntries(Object.entries(meter).sort((a: any, b: any) => a[1] - b[1]))
  //console.log(sorted)
  return Object.keys(sorted)[0]
}

const dayCount = (d1: string | number | Date, d2: string | number | Date): any => {
  const date = new Date(d1).getTime() - new Date(d2).getTime()
  return Math.abs(date / (1000 * 60 * 60 * 24))
}

const getResponse = async (): Promise<void> => {
  if (new Date().getDay() == 0 || new Date().getDay() == 6) {
    console.log(getPrefix() + ' API data loading failed. Not weekday.')
    return
  }

  if (new Date().getHours() < 8 || new Date().getHours() > 19) {
    console.log(getPrefix() + ' API data loading failed. Not time.')
    return
  }

  const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'))
  const response = await fetch(config.url, config.options)

  if (!response.ok) {
    // response.text().then((text) => {
    //   throw new Error(text)
    // })
    console.log(getPrefix() + ' API data loading failed. Error.')
    return
  }

  try {
    const rawJson: BusStatusRaw = JSON.parse(JSON.stringify(await response.json()))
    //const newJson: Partial<BusStatusNew> = {}
    const newJson: any = {}

    newJson.time = getDate() + ' ' + getTime()
    newJson.returnCode = rawJson?.returnCode
    // newJson.data = rawJson?.data
    newJson.data = rawJson?.data?.map((obj: any) => {
      obj.busstop = nearBusStop(obj)
      return obj
    })

    fs.writeFile(__dirname + '/api.json', JSON.stringify(newJson, null, 2), (err) => {
      if (err) {
        console.log(err)
      }
    })

    let monitorRaw: any = JSON.parse(fs.readFileSync(__dirname + '/monitor.json', 'utf8'))

    for (let element of newJson.data) {
      if (monitorRaw[element.name] == undefined) {
        monitorRaw[element.name] = []
      }

      let distance = getDistance(busStop[element.busstop], {'lat': element.lat, 'lon': element.lon})

      // if (
      //   element.name != '석계역' &&
      //   element.name != '태릉입구역' &&
      //   element.name != '화랑대역' &&
      //   element.name != '삼육대'
      // ) {
      //   continue
      // }

      let monitorNew = {
        // 'lat': element.lat,
        // 'lon': element.lon,
        'busstop': element.busstop,
        'time': getDate() + ' ' + getTime(),
        'distance': distance,
      }

      if (element.status == '0') {
        continue
      }

      // if (distance >= 40) {
      //   continue
      // }

      // let lastRaw = monitorRaw[element.name].slice(-1)[0]
      // if (lastRaw != undefined) {
      //   if (lastRaw.busstop == element.busstop) {
      //     if (lastRaw.distance < distance) { // 50 < 60
      //       Array.prototype.pop.call(monitorRaw[element.name])
      //       console.log(monitorNew)
      //       continue
      //     }
      //   }
      // }

      console.log(monitorNew)

      if (distance >= 50) {
        continue
      }

      let lastRaw = monitorRaw[element.name].slice(-1)[0]
      if (lastRaw != undefined) {
        if (lastRaw.busstop == element.busstop) {
          continue
        }
      }

      Array.prototype.push.call(monitorRaw[element.name], monitorNew)
    }

    fs.writeFile(__dirname + '/monitor.json', JSON.stringify(monitorRaw, null, 2), (err) => {
      if (err) {
        console.log(err)
      }
    })

    // let newData: any = {}
    // for (let index in monitorRaw) {
    //   newData[index] = []
    //   for (let info of monitorRaw[index]) {
    //     if (dayCount(info['time'], new Date()) >= 10) {
    //       continue
    //     }
    //     newData[index].push(info)
    //   }
    // }

    // fs.writeFile(__dirname + '/monitor-convert.json', JSON.stringify(newData, null, 2), (err) => {
    //   if (err) {
    //     console.log(err)
    //   }
    // })

    let busNumbers = newJson.data?.map((element: any) => {
      return element.name
    })

    console.log(getPrefix() + ' API [' + busNumbers?.join(', ') + '] data loading completed.')
  } catch {}
}

setInterval(() => {
  getResponse()
}, 1000 * 2)
