'use strict'

const CLIENT_QUESTION = Symbol()
const CLIENT_INFORMATION = Symbol()

const DB = {
  steps: [
    // Id: 0
    {
      type: CLIENT_INFORMATION,
      value: 'Hello Client, and welcome.'
    },
    // Id: 1
    {
      type: CLIENT_QUESTION,
      value: 'What would you like to have for dinner?',
    },
    // Id: 2
    {
      type: CLIENT_INFORMATION,
      value: 'Thank you',
    },
  ],
  tasks: [
    // Id: 0
    {
    },
    // Id: 1
    {
    }
  ],
}

const sendMsgToClient = x => console.log(`Message to client: ${x}`)

function nap() {
  const {tasks} = DB
  const ongoingTasks = tasks.filter(task => Boolean(task.currentStep !== undefined))
  ongoingTasks.forEach((task, id) => {
    const {playbookId, currentStep} = task
    const step = DB.steps[currentStep]
    if (step.type === CLIENT_INFORMATION) { sendMsgToClient(step.value) }
    DB.tasks[id].currentStep++
  })
}

function present(data) {
  const {task} = data
  if (task) {
    let {id} = task
    const newTask = Boolean(id)
    if (newTask) {
      DB.tasks.push(task)
    } else {
      delete task.id
      Object.assign(DB.tasks[id], task)
    }
  }
  nap()
}

// Start the task
present({
  task: {
    id: 0,
    currentStep: 0,
  }
})
