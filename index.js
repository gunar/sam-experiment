'use strict'

const CLIENT_INPUT = Symbol()
const CLIENT_MESSAGE = Symbol()

const DB = {
  steps: [
    // Id: 0
    {
      type: CLIENT_MESSAGE,
      value: 'Hello Client, and welcome.'
    },
    // Id: 1
    {
      type: CLIENT_MESSAGE,
      value: 'What would you like to have for dinner?',
    },
    // Id: 2
    {
      type: CLIENT_INPUT,
    },
    // Id: 3
    {
      type: CLIENT_MESSAGE,
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
  DB.tasks.forEach((task, id,array) => {
    const {playbookId, currentStep} = task
    if (currentStep === undefined) return
    const step = DB.steps[currentStep]
    if (step.type === CLIENT_MESSAGE) {
      sendMsgToClient(step.value)
      present({ task: { id, currentStep: currentStep + 1, } })
    }
  })
}

function present(data) {
  console.log('present', data)
  const {task} = data
  if (task) {
    let {id} = task
    const newTask = Boolean(id === undefined)
    if (newTask) {
      DB.tasks.push(task)
    } else {
      delete task.id
      Object.assign(DB.tasks[id], task)
    }
  }
  nap()
}

// Start a new task
present({
  task: {
    currentStep: 0,
  }
})

// simulate client input
setTimeout(() => {
  console.log("Client: hi")
  present({ task: {
    id: 0,
  } })
}, 500)
