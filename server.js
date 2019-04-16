//Description: server.js for - An elegant office task tracker and reporter application
//Javascript version: ES6
//HTML version: HTML5
//CSS version: CSS3
//Dependencies: Google Charts, SQLITE3
//Author: Kumar Saraboji
//Created: 15 Apr 2019
//Email: me.kumar.saraboji@gmail.com

var express = require("express")
var  bodyParser = require("body-parser")
var fs = require("fs")
var sqlite3 = require("sqlite3")

var app = express()
var port = process.env.PORT || 9002

//mount bodyParser & static middlewares
app.use(bodyParser.urlencoded({extended: true})) 
app.use(express.static("public"))

//connect to sqlite db
var dbFile = "./.data/sqlite.db"
let dbFileExists = fs.existsSync(dbFile)

const sqlite3db = sqlite3.verbose()
let db = new sqlite3db.Database(dbFile, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected to sqlite db")
    }
})

//create table if first time
db.serialize(() => {

    if (!dbFileExists) {
        db.run(`CREATE TABLE "mitasks"(
            "Task#"	INTEGER,
            "CreatedTS"	TEXT,
            "Title"	TEXT,
            "Requestor"	TEXT,
            "Details"	TEXT,
            "Remarks"	TEXT,
            "Status"	TEXT,
            "StatusUpdatedTS"	TEXT,
            PRIMARY KEY("Task#")
        )`)
    }

    console.log("created mitasks table...")
    

})

//specify routes and methods
app.route("/")
    .get((req, res) => {
        res.sendFile(`${__dirname}/views/index.htm`)
    })

app.route("/getallTasks")
    .get((req, res) => {
        let sql = `select * from mitasks order by "Task#"`
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err
            }
            res.send(JSON.stringify(rows))
        })
    })

app.route("/postaTask")
    .post((req, res) => {

        let body = req.body
        let taskno = `${body["taskno"]}`
        let title = `"${body["title"]}"`
        let requestor = `"${body["requestor"]}"`
        let details = `"${body["details"]}"`
        let remarks = `"${body["remarks"]}"`
        
        let insertsql = `insert into mitasks VALUES(${taskno}, datetime(datetime("now"),"localtime"), ${title}, ${requestor}, ${details}, ${remarks}, "Yet to start", datetime(datetime("now"),"localtime"))`
        let selectsql = `select * from mitasks where "Task#" = ${taskno}`
        db.serialize(() => {
            db.run(insertsql)
              .get(selectsql, [], (err, row) => {
                  if (err) {
                      throw err
                  }
                  res.send(JSON.stringify(row))
            })
        })
        
    })

app.route("/putaTask")
    .put((req, res) => {
        let body = req.body
        let taskno = `${parseInt(body["taskno"])}` 
        let status = `"${body["status"]}"`

        let updatesql = `update mitasks set "Status" = ${status}, "StatusUpdatedTS" = datetime(datetime("now"),"localtime") where "Task#" = ${taskno}`
        let selectsql = `select * from mitasks where "Task#" = ${taskno}`

        db.serialize(() => {
            db.run(updatesql)
                .get(selectsql, [], (err, row) => {
                    if (err) {
                        throw err
                    }
                    res.send(JSON.stringify(row))
                })
        })
        
    })


app.delete("/deleteAllTasks", (req, res) => {

    db.run("delete from mitasks")
    res.sendStatus(200)
})

//listen for client
app.listen(port, () => {
    console.log(`miTasks app is listening on port# ${port}`)
})