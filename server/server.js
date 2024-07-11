const express = require("express")
const cors = require('cors')

const app = express()
app.use(cors())
require('dotenv').config()

const assetRouter = require('./routes/asset.router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use("/api/v1/asset", assetRouter)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
})