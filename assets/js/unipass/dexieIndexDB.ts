import Dexie from 'dexie'
import { Session } from './account'
const dbName = 'testDB3'
const table = 'MyObjectStore'
const db = new Dexie(dbName)
db.version(1).stores({ MyObjectStore: 'id' })

export async function saveDatas(session: Session) {
  try {
    await db.open()
    let testData = { id: 1 }
    testData = Object.assign(session, testData)
    await db.table(table).put(testData)
  } catch (e) {
    console.log('Ooops', e)
  }
}

export async function findData() {
  try {
    await db.open()
    const resultByIndex = await db.table(table).get(1)
    console.log(resultByIndex)
    return resultByIndex as Session
  } catch (e) {
    console.log('Ooops', e)
  }
}

export async function deleteData() {
  try {
    await db.delete()
  } catch (e) {
    console.log('Ooops', e)
  }
}
