import repl from 'node:repl'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

const nameFile = 'data.json'
repl.start({
  prompt: 'task-cli >>> ',
  eval: myEval,
  writer: myWriter
})

async function myEval (cmd, context, filename, callback) {
  callback(null, await myFunction(cmd))
}

function myWriter (output) {
  const text = `  ==> ${output} \n`
  return text
}

async function myFunction (input) {
  const clean = input.trim()
  const params = clean.split(" ")
  let message = ''
  switch (params[0]) {
    case 'add':
      const task = clean.split("\"")
      if (task[0] === 'add ') {
        const nt = await newTask({ task: task[1] })
        if (nt === true) message = 'Task saved successfully'
        else message = 'Something went wrong'
      }
      else message = 'Enter a valid task!'
      break;

    case 'update':
      const task2 = clean.split("\"")
      if (params[1] !== undefined && params[2] !== undefined && task2[1] !== undefined) {
        const nt = await updateTask({ idTask: params[1], task: task2[1] })
        if (nt === true) message = 'Task updated successfully'
        else message = 'Enter a valid ID'
      }
      else message = 'Enter valid task ID and description'
      break;

    case 'delete':
      if (params[1] !== undefined) {
        const nt = await deleteTask({ idTask: params[1] })
        if (nt === true) message = 'Task deleted successfully'
        else message = 'Enter a valid ID'
      }
      else message = 'Enter ID to delete'
      break;

    case 'mark-in-progress':
    case 'mark-done':
      if (params[1] !== undefined) {
        let statusTask = 'todo'
        if (params[0] === 'mark-in-progress') statusTask = 'in-progress'
        if (params[0] === 'mark-done') statusTask = 'done'
        const nt = await changeStatus({ idTask: params[1], statusTask })
        if (nt === true) message = 'Task updated successfully'
        else message = 'Enter a valid ID'
      }
      else message = 'Enter ID to update'
      break;

    case 'list':
      if (params[1] === undefined || params[1] === 'done' || params[1] === 'todo' || params[1] === 'in-progress') {
        const nt = await listTasks({ statusTask: params[1] })
        if (nt !== false) message = nt
        else message = 'There are not tasks'
      }
      else message = "Enter a permitted state"
      break;

    default:
      message = 'Enter a valid command!'
  }
  return message
}

async function readJson () {
  let allTasks = []
  try {
    const data = await fs.readFile(nameFile, 'utf-8')
    allTasks = JSON.parse(data)
  } catch (error) { console.log('file empty') }
  return allTasks
}

async function writeJson ({ allTasks }) {
  const jsonData = JSON.stringify(allTasks, null, 2)
  try {
    await fs.writeFile(nameFile, jsonData, 'utf8')
    return true
  } catch (error) {
    console.log('Cannot create JSON')
    return false
  }
}

async function newTask ({ task }) {
  let allTasks = []
  // read file json
  if (existsSync(nameFile)) {
    allTasks = await readJson()
  }
  //find ID
  let id = 1
  if (allTasks.length > 0) {
    for (const property in allTasks) {
      if (allTasks[property].id >= id) id = allTasks[property].id + 1
    }
  }
  // push new task
  const newTask = {
    id: id,
    description: task,
    status: 'todo',
    createdAt: new Date().toString(),
    updatedAt: new Date().toString()
  }
  allTasks.push(newTask)
  // create json file
  const write = writeJson({ allTasks })
  if (write) return true
  return false
}

async function updateTask ({ idTask, task }) {
  if (existsSync(nameFile)) {
    let allTasks = []
    allTasks = await readJson()
    //find id
    const taskIndex = allTasks.findIndex(({ id }) => id === parseInt(idTask))
    if (taskIndex !== -1) {
      const updatedTask = {
        description: task,
        updatedAt: new Date().toString()
      }
      // add update
      allTasks[taskIndex] = {
        ...allTasks[taskIndex],
        ...updatedTask
      }
      // write json
      const write = writeJson({ allTasks })
      if (write) return true
    }
  }
  return false
}

async function deleteTask ({ idTask }) {
  if (existsSync(nameFile)) {
    let allTasks = []
    allTasks = await readJson()
    //find id
    const taskIndex = allTasks.findIndex(({ id }) => id === parseInt(idTask))
    if (taskIndex !== -1) {
      allTasks.splice(taskIndex, 1);
      //write json
      const write = writeJson({ allTasks })
      if (write) return true
    }
  }
  return false
}

async function changeStatus ({ idTask, statusTask }) {
  if (existsSync(nameFile)) {
    let allTasks = []
    allTasks = await readJson()

    const taskIndex = allTasks.findIndex(({ id }) => id === parseInt(idTask))
    if (taskIndex !== -1) {
      const updatedTask = {
        status: statusTask,
        updatedAt: new Date().toString()
      }
      // add update
      allTasks[taskIndex] = {
        ...allTasks[taskIndex],
        ...updatedTask
      }
      // write json
      const write = writeJson({ allTasks })
      if (write) return true
    }
  }
  return false
}

async function listTasks ({ statusTask }) {
  if (existsSync(nameFile)) {
    let allTasks = []
    allTasks = await readJson()
    if (allTasks.length !== 0) {
      let message = 'Correcting listing'
      switch (statusTask) {
        case undefined:
          console.log(allTasks)
          break;
        case 'done':
          const resultDone = allTasks.filter(({ status }) => status === statusTask);
          if (resultDone.length !== 0) console.log(resultDone)
          else message = 'The task list with the status done is empty'
          break;
        case 'todo':
          const resultTodo = allTasks.filter(({ status }) => status === statusTask);
          if (resultTodo.length !== 0) console.log(resultTodo)
          else message = 'The task list with the status todo is empty'
          break;
        case 'in-progress':
          const resultInProgress = allTasks.filter(({ status }) => status === statusTask);
          if (resultInProgress.length !== 0) console.log(resultInProgress)
          else message = 'The task list with the status in-progress is empty'
          break;
      }
      return message
    }
  }
  return false
}