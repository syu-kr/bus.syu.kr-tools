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

const dayCount = (d1: string | number | Date, d2: string | number | Date): any => {
  const date = new Date(d1).getTime() - new Date(d2).getTime()
  return Math.abs(date / (1000 * 60 * 60 * 24))
}

let monitorRaw: any = JSON.parse(fs.readFileSync(__dirname + '/convert/monitor.json', 'utf8'))
let newData: any = {}

for (let index in monitorRaw) {
  newData[index] = []
  for (let info of monitorRaw[index]) {
    if (dayCount(info['time'], new Date()) >= 10) {
      continue
    }
    newData[index].push(info)
  }
}

fs.writeFile(__dirname + '/monitor.json', JSON.stringify(newData, null, 2), (err) => {
  if (err) {
    console.log(err)
  }
})
