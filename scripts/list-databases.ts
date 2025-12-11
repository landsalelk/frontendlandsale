import { Client, Databases } from 'node-appwrite'

const client = new Client()
    .setEndpoint('http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1')
    .setProject('6938b2b200372bde48f0')
    .setKey(process.env.APPWRITE_API_KEY!)

const databases = new Databases(client)

databases.list().then(r => {
    console.log('Found', r.total, 'databases:')
    r.databases.forEach(db => {
        console.log(' -', db.name, `(${db.$id})`)
    })
}).catch(e => {
    console.error('Error:', e.message)
    if (e.response) {
        console.error('Response:', e.response)
    }
})
