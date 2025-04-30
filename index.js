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
  console.log(params)/////

  switch (params[0]) {
    case 'add':
      const task = clean.split("\"")
      console.log(task)//////
      if (task[0] === 'add ') {
        const nt = await newTask({ task: task[1] })
        if (nt === true) return 'Task saved successfully'
        return 'Something went wrong'
      } else {
        return 'Enter a valid task!'
      }
      break;

    case 'update':
      const task2 = clean.split("\"")
      console.log(task2)//////
      if (params[1] !== undefined && task2[1] !== undefined) {
        const nt = await updateTask({ idTask: params[1], task: task2[1] })
        if (nt === true) return 'Task updated successfully'
      }
      return 'That does not exist'
      break;

    case 'delete':
      console.log(params[0])
      break;
    case 'mark-in-progress':
      console.log(params[0])
      break;
    case 'mark-done':
      console.log(params[0])
      break;
    case 'list':
      console.log(params[0])
      break;
    default:
      return 'Enter a valid command!'
  }
}

async function newTask ({ task }) {
  let allTasks = []
  // read file json
  if (existsSync(nameFile)) {
    try {
      const data = await fs.readFile(nameFile, 'utf-8')
      allTasks = JSON.parse(data)
    } catch (error) { console.log('file empty') }
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
  const jsonData = JSON.stringify(allTasks, null, 2)
  try {
    await fs.writeFile(nameFile, jsonData, 'utf8')
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

async function updateTask ({ idTask, task }) {
  let allTasks = []
  if (existsSync(nameFile)) {
    try {
      const data = await fs.readFile(nameFile, 'utf-8')
      allTasks = JSON.parse(data)
    } catch (error) { console.log('file empty') }

    //find id
    const taskIndex = allTasks.findIndex(({ id }) => id === parseInt(idTask))
    if (taskIndex !== -1) {
      const descriptionTask = {
        description: task,
        updatedAt: new Date()
      }
      // add update
      allTasks[taskIndex] = {
        ...allTasks[taskIndex],
        ...descriptionTask
      }
      // write json
      const jsonData = JSON.stringify(allTasks, null, 2)
      try {
        await fs.writeFile(nameFile, jsonData, 'utf8')
        return true
      } catch (error) {
        console.log(error)
      }
    }
  }
  return false
}