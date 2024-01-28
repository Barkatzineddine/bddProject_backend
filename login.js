const express = require("express")
const app = express()
const PORT = 8080
const cors = require("cors")
const mysql = require("mysql2")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const cookie = require("cookiejs")
/**********************   CONFIGURATION   ****************************** */
dotenv.config() 


/************************** FUNCTIONS ********************************* */
/*const test =async()=>{
const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash("admin123",salt)
        console.log(hashedPassword)
}
test()*/
console.log(process.env.NODE_ENV)
/******************************************************************************************************************** */

