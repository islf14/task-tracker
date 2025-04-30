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
  const text = `  ==> ${output}`
  return text
}

async function myFunction (input) {
  const clean = input.trim()
  const params = clean.split(" ")
  let message = ''
  console.log(params)/////

  switch (params[0]) {
    case 'add':
      const task = clean.split("\"")
      console.log(task)//////
      if (task[0] === 'add ') {
        const nt = await newTask({ task: task[1] })
        if (nt === true) return 'Task saved successfully'
        return 'Something went wrong'
      }
      message = 'Enter a valid task!'
      break;

    case 'update':
      const task2 = clean.split("\"")
      console.log(task2)//////
      if (params[1] !== undefined && task2[1] !== undefined) {
        const nt = await updateTask({ idTask: params[1], task: task2[1] })
        if (nt === true) return 'Task updated successfully'
      }
      message = 'That does not exist to update'
      break;

    case 'delete':
      if (params[1] !== undefined) {
        const nt = await deleteTask({ idTask: params[1] })
        if (nt === true) return 'Task deleted successfully'
      }
      message = 'That does not exist to delete'
      break;

    case 'mark-in-progress':
    case 'mark-done':
      if (params[1] !== undefined) {
        const nt = await changeStatus({ idTask: params[1], statusTask: params[0] })
        if (nt === true) return 'Task updated successfully'
      }
      message = 'That cannot be updated'
      break;

    case 'list':
      console.log(params[0])
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
    console.log(error)
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
    createdAt: new Date(),
    updatedAt: new Date()
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
        updatedAt: new Date()
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
        updatedAt: new Date()
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