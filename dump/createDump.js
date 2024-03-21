const {dbConnection} = require("../config/mongoConnection");
const fs = require("fs");
dbConnection().then(async db => {
    const collections = await db.listCollections().toArray()
    for (const collection of collections) {
        const data = await db.collection(collection.name).find({}).toArray();
        fs.writeFileSync(`./${collection.name}.json`, JSON.stringify(data))
    }
    console.log("Done")
    process.exit()
})
