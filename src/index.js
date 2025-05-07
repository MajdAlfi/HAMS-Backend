const http = require("http")

const app = require("./App/app")
require("./Configs/databaseConnection").connect()
http.createServer(app)
const port = process.env.PORT
app.listen(port,()=> console.log('listen on port', port))