//Description: client.js for - An elegant office task tracker and reporter application
//Javascript version: ES6
//HTML version: HTML5
//CSS version: CSS3
//Dependencies: Google Charts, SQLITE3
//Author: Kumar Saraboji
//Created: 15 Apr 2019
//Email: me.kumar.saraboji@gmail.com

//first load google charts
var dataTable
google.charts.load("current", {
    "packages": ["corechart", "table"]
})

//xhr requests
const xhrGetAllTasks = new XMLHttpRequest()
const xhrpostaTask = new XMLHttpRequest()
const xhrputaTask = new XMLHttpRequest()
const xhrDeleteAllTasks = new XMLHttpRequest()

google.charts.setOnLoadCallback(() => {

    //get all the tasks from server
    xhrGetAllTasks.open("get", "/getallTasks", true)
    xhrGetAllTasks.responseType = "json"
    xhrGetAllTasks.onload = () => {

        console.log("getallTasks rc", xhrGetAllTasks.status)
        if (xhrGetAllTasks.status === 200) {
            let tasks = xhrGetAllTasks.response
            updateDOM(tasks)
        }

        return
    }
    xhrGetAllTasks.onerror = (err) => {
        throw err
    }
    xhrGetAllTasks.send()

    return
})

//select appropriate DOM nodes to append the tasks
var todos = document.querySelector("#to-dos")
var todoContent = todos.querySelector(".content")
var inprogress = document.querySelector("#in-progress")
var inprogressContent = inprogress.querySelector(".content")
var pending = document.querySelector("#pending")
var pendingContent = pending.querySelector(".content")
var cancelled = document.querySelector("#cancelled")
var cancelledContent = cancelled.querySelector(".content")
var deleted = document.querySelector("#deleted")
var deletedContent = deleted.querySelector(".content")
var completed = document.querySelector("#completed")
var completedContent = completed.querySelector(".content")

//create taskObjs array to hold task objects
var taskno = 0
var taskObjs = []
taskObjs.push([{ label: "Task#", id: "task#", type: "number" },
{ label: "CreatedTS", id: "createdts", type: "datetime" },
{ label: "Title", id: "title", type: "string" },
{ label: "Requestor", id: "requestor", type: "string" },
{ label: "Details", id: "details", type: "string" },
{ label: "Remarks", id: "remarks", type: "string" },
{ label: "Status", id: "status", type: "string" },
{ label: "StatusUpdatedTS", id: "statusupdatedts", type: "string" }])

//function to append tasks aptly based on the args passed
var appendTask = (taskContent, taskno, title) => {

    let taskContentDiv = document.createElement("div")
    taskContentDiv.id = `task${taskno}`
    taskContentDiv.innerHTML = `
        <h4>#${taskno}</h4>
        <p>${title}</p>
    `
    taskContentDiv.setAttribute("draggable", "true")
    taskContent.appendChild(taskContentDiv)

    return
}

//function to update DOM with the tasks received from server
var updateDOM = (tasks) => {

    tasks.forEach((elem) => {

        taskno = elem["Task#"]
        let createdts = new Date(elem["CreatedTS"]) 
        let title = elem["Title"]
        let requestor = elem["Requestor"]
        let details = elem["Details"]
        let remarks = elem["Remarks"]
        let status = elem["Status"]
        let statusupdatedts = new Date(elem["StatusUpdatedTS"])

        taskObjs.push([taskno, createdts, title, requestor, details, remarks, status, statusupdatedts])

        switch (status) {
            case "Yet to start":
                appendTask(todoContent, taskno, title)
                break
            case "In progress":
                appendTask(inprogressContent, taskno, title)
                document.querySelector(`#task${taskno}`).style.background = "#F7DC6F"
                document.querySelector(`#task${taskno}`).style.color = "black"
                break
            case "Pending":
                appendTask(pendingContent, taskno, title)
                document.querySelector(`#task${taskno}`).style.background = "#E59866"
                document.querySelector(`#task${taskno}`).style.color = "black"
                break
            case "Cancelled":
                appendTask(cancelledContent, taskno, title)
                document.querySelector(`#task${taskno}`).style.background = "#F5B7B1"
                document.querySelector(`#task${taskno}`).style.color = "black"
                break
            case "Deleted":
                appendTask(deletedContent, taskno, title)
                document.querySelector(`#task${taskno}`).style.background = "#BB8FCE"
                document.querySelector(`#task${taskno}`).style.color = "black"
                break
            case "Completed":
                appendTask(completedContent, taskno, title)
                document.querySelector(`#task${taskno}`).style.background = "#76D7C4"
                document.querySelector(`#task${taskno}`).style.color = "black"
                break
        }

    })

    drawDataTable()
    drawCharts()

    return

}

//function to draw dataTable based on the data received from server
var drawDataTable = () => {

    dataTable = google.visualization.arrayToDataTable(taskObjs,false)
    let table = new google.visualization.Table(document.getElementById("stats-table"))

    let tableStyles = {
        headerCell: "google-table-hdrcell",
        tableCell: "google-table-tblcell"
    }

    let tableOptions = {
        cssClassNames: tableStyles
    }

    table.draw(dataTable, tableOptions)

    return

}

//select the form fields
var form = document.querySelector("#create-form")
var deleteallBtn = document.querySelector("#deleteall-btn")
var titleNode = document.querySelector('input[name="title"]')
var requestorNode = document.querySelector('input[name="requestor"]')
var detailsNode = document.querySelector("textarea")
var remarksNode = document.querySelector('input[name="remarks"]')

//function to perform delete 
deleteallBtn.onclick = (event) => {

    //get all the tasks from server
    xhrDeleteAllTasks.open("delete", "/deleteAllTasks", true)
    xhrDeleteAllTasks.onload = () => {

        console.log("deleteAllTasks rc", xhrDeleteAllTasks.status)
        if (xhrDeleteAllTasks.status === 200 || xhrDeleteAllTasks.status === 204) {
            taskno = 0
            taskObjs = [taskObjs[0]]
            todoContent.innerHTML = ""
            inprogressContent.innerHTML = ""
            pendingContent.innerHTML = ""
            cancelledContent.innerHTML = ""
            deletedContent.innerHTML = ""
            completedContent.innerHTML = ""
            drawDataTable()
            drawCharts()

            window.location.reload(false)
        }

        return
    }
    xhrDeleteAllTasks.onerror = (err) => {
        throw err
    }
    xhrDeleteAllTasks.send()


}

//function to post the task to server and update the DOM
form.onsubmit = (event) => {

    let title = titleNode.value
    let requestor = requestorNode.value
    let details = detailsNode.value
    let remarks = remarksNode.value

    if (title && requestor && details) {

        taskno += 1

        //post tasks to server
       let params = `taskno=${taskno}&title=${title}&requestor=${requestor}&details=${details}&remarks=${remarks}`

        xhrpostaTask.open("post", "/postaTask", true)
        xhrpostaTask.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8")
        xhrpostaTask.onload = () => {
            console.log("postaTask rc", xhrpostaTask.status)

            //if post successfull, update DOM elements
            if (xhrpostaTask.status === 200 || xhrpostaTask.status === 201) {

                let jsonData = xhrpostaTask.response
                let createdts, status, statusupdatedts
                jsonData.forEach((elem) => {
                    createdts = new Date(elem["CreatedTS"])
                    status = elem["Status"]
                    statusupdatedts = new Date(elem["StatusUpdatedTS"])
                })

                appendTask(todoContent, taskno, title)
                taskObjs.push([taskno, createdts, title, requestor, details, remarks, status, statusupdatedts])
                drawDataTable()
                drawCharts()
            }
        }
        xhrpostaTask.onerror = (err) => {
            throw err
        }
        xhrpostaTask.send(params)

        //reset form elements
        title.value = ""
        requestor.value = ""
        details.value = ""
        remarks.value = ""

    } else {
        console.log("missing inputs")
    }
  

    return
}

//mouseover event for task divs
document.addEventListener("mouseover", (event) => {

    let id = event.target.id
    if (id) {
        if (id.startsWith("task")) {
            document.querySelector(`#${id}`).style.cursor = "pointer"
        }
    }

}, false)

var sarticleNode, sarticleId
var oarticleId, oarticleNode
var earticleId, earticleNode
var larticleId, larticleNode
var darticleId, darticleNode

//add eventlisteners for drag and drop events
document.addEventListener("dragstart", (event) => {
    
    let taskdiv = event.target
    let sdivNode = taskdiv.parentNode
    sarticleNode = sdivNode.parentNode
    sarticleId = sarticleNode.id

    event.dataTransfer.setData("text", taskdiv.id)
    event.dataTransfer.dropEffect = "move"

}, false)

document.addEventListener("dragover", (event) => {

    oarticleNode = event.target
    oarticleId = event.target.id

    switch (true) {
        case sarticleId === "to-dos":
            if (oarticleId === "in-progress" || oarticleId === "cancelled" || oarticleId === "deleted" ) 
                event.preventDefault()
            else 
                console.log("invalid drop")
            break
        case sarticleId === "in-progress":
            if (oarticleId === "completed" || oarticleId === "cancelled" || earticleId === "pending")
                event.preventDefault()
            else
                console.log("invalid drop")
            break
        case sarticleId === "completed":
            console.log("invalid drop")
            break
        case sarticleId === "pending":
            if (oarticleId === "in-progress" || oarticleId === "cancelled")
                event.preventDefault()
            else
                console.log("invalid drop")
            break
        case sarticleId === "cancelled":
            if (oarticleId === "in-progress" || oarticleId === "deleted")
                event.preventDefault()
            else
                console.log("invalid drop")
            break
        case sarticleId === "deleted":
            console.log("invalid drop")
            break
    }

}, false)

document.addEventListener("dragenter", (event) => {

    earticleNode = event.target
    earticleId = event.target.id

    switch (true) {
        case sarticleId === "to-dos":
            if (earticleId === "in-progress" || earticleId === "cancelled" || earticleId === "deleted")  {
                earticleNode.style.background = "#A3E4D7"
            }
            else 
                console.log("invalid drop")
            break
        case sarticleId === "in-progress":
            if (earticleId === "completed" || earticleId === "cancelled" || earticleId === "pending") {
                earticleNode.style.background = "#A3E4D7"
            }
            else
                console.log("invalid drop")
            break
        case sarticleId === "completed":
            console.log("invalid drop")
            break
        case sarticleId === "pending":
            if (earticleId === "in-progress" || earticleId === "cancelled") {
                earticleNode.style.background = "#A3E4D7"
            }
            else
                console.log("invalid drop")
            break
        case sarticleId === "cancelled":
            if (earticleId === "in-progress" || earticleId === "deleted") {
                earticleNode.style.background = "#A3E4D7"
            }
            else
                console.log("invalid drop")
            break
        case sarticleId === "deleted":
            console.log("invalid drop")
            break
        
    }


}, false)

var dropTask = (event, darticleNode) => {

    let divNode = darticleNode.querySelector(".content:last-child")
    let taskid = event.dataTransfer.getData("text")
    divNode.appendChild(document.querySelector(`#${taskid}`))
    darticleNode.style.background = "#D5F5E3"

    return taskid

}

var updateStatus = (darticleId, taskid) => {

    let status
    switch (darticleId) {
        case "in-progress":
            status = "In progress"
            document.querySelector(`#${taskid}`).style.background = "#F7DC6F"
            document.querySelector(`#${taskid}`).style.color = "black"
            break
        case "cancelled":
            status = "Cancelled"
            document.querySelector(`#${taskid}`).style.background = "#F5B7B1"
            document.querySelector(`#${taskid}`).style.color = "black"
            break
        case "deleted":
            status = "Deleted"
            document.querySelector(`#${taskid}`).style.background = "#BB8FCE"
            document.querySelector(`#${taskid}`).style.color = "black"
            break
        case "completed":
            status = "Completed"
            document.querySelector(`#${taskid}`).style.background = "#76D7C4"
            document.querySelector(`#${taskid}`).style.color = "black"
            break
        case "pending":
            status = "Pending"
            document.querySelector(`#${taskid}`).style.background = "#E59866"
            document.querySelector(`#${taskid}`).style.color = "black"
            break
    }

    taskObjs.forEach((arr, idx1) => {
        arr.forEach((elem, idx2) => {
            let taskno = document.querySelector(`#${taskid} h4`).innerHTML
            taskno = taskno.replace("#", "")
            taskno = parseInt(taskno)
            if (elem === taskno) {

                let params = `taskno=${taskno}&status=${status}`

                //put a task to server
                xhrputaTask.open("put", "/putaTask", true)
                xhrputaTask.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
                xhrputaTask.responseType  = "json"
                xhrputaTask.onload = () => {
                    console.log("putaTask rc", xhrputaTask.status)

                    //if post successfull, update DOM elements
                    if (xhrputaTask.status === 200 || xhrputaTask.status === 204) {

                        let jsonData = xhrputaTask.response
                        let statusupdatedts = new Date(jsonData.StatusUpdatedTS)
                        
                        taskObjs[idx1][6] = status
                        taskObjs[idx1][7] = statusupdatedts
                        drawDataTable()
                        drawCharts()
                    }
                }
                xhrputaTask.onerror = (err) => {
                    throw err
                }
                xhrputaTask.send(params)

            }
            
        })
    })

    return
}


document.addEventListener("drop", (event) => {

    event.preventDefault()
    darticleNode = event.target
    darticleId = darticleNode.id

    switch (true) {
        case sarticleId === "to-dos":
            if (darticleId === "in-progress" || darticleId === "cancelled" || darticleId === "deleted") {
                let taskid = dropTask(event, darticleNode)
                updateStatus(darticleId, taskid)
                
                //event.stopPropagation()
            }
            break
        case sarticleId === "in-progress":
            if (darticleId === "completed" || darticleId === "cancelled" || darticleId === "pending") {
                let taskid = dropTask(event, darticleNode)
                updateStatus(darticleId, taskid)

                //event.stopPropagation()
            }
            else
                console.log("invalid drop")
            break
        case sarticleId === "completed":
            let taskid = dropTask(event, darticleNode)
            updateStatus(darticleId, taskid)

            //event.stopPropagation()
            break
        case sarticleId === "pending":
            if (darticleId === "in-progress" || darticleId === "cancelled") {
                let taskid = dropTask(event, darticleNode)
                updateStatus(darticleId, taskid)

               // event.stopPropagation()
            }
            else
                console.log("invalid drop")
            break
        case sarticleId === "cancelled":
            if (darticleId === "in-progress" || darticleId === "deleted") {
                let taskid = dropTask(event, darticleNode)
                updateStatus(darticleId, taskid)

                //event.stopPropagation()
            }
            else
                console.log("invalid drop")
            break
        case sarticleId === "deleted":
            taskid = dropTask(event, darticleNode)
            updateStatus(darticleId, taskid)

            //event.stopPropagation()
            break
    }
    

}, false)


document.addEventListener("dragleave", (event) => {

    larticleNode = event.target
    larticleId = event.target.id

    console.log("cellllllllllll", larticleNode)

    switch (true) {
        case larticleId === "pending":
        case larticleId === "deleted":
        case larticleId=== "cancelled":
        case larticleId === "completed":
        case larticleId === "in-progress":
            if (larticleNode.style.background !== "#D5F5E3") {
                larticleNode.style.background = "#D5F5E3"
            }
            break
    }


}, false)

//draw charts
var drawCharts = () => {

    //chart# 1
    //aggregate content-type to plot column chart
    let typeBarTable = google.visualization.data.group(
        dataTable,
        [6],
        [{ column: 6, aggregation: google.visualization.data.count, type: "number", label: "noOfTasks" }]
    )

    typeBarTable.sort([{ column: 1, desc: true }])
    let typeBarView = new google.visualization.DataView(typeBarTable)
    typeBarView.setColumns([0, 1, {
        type: "string",
        calc: "stringify",
        sourceColumn: 1,
        role: "annotation",
    }])

    let typeBarChartOptions = {
        title: "# of tasks by status",
        titleTextStyle: { color: "#CD5C5C", bold: true, fontSize: 16 },
        fontName: "'Advent Pro', sans-serif",
        bar: { groupWidth: "95%" },
        legend: { position: "none", textStyle: { fontSize: 10 } },
        colors: ["#F7DC6F"],
        hAxis: { title: "# of tasks" },
        vAxis: { title: "Task status" },
    };
    let typeBarChart = new google.visualization.BarChart(document.getElementById("charts"))
    typeBarChart.draw(typeBarView, typeBarChartOptions)

}