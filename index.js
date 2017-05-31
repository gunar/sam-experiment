'use strict'

const CLIENT_INPUT = 'CLIENT_INPUT'
const CLIENT_MESSAGE = 'CLIENT_MESSAGE'

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
      value: 'Got it! Thank you',
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
  dataFields: [
  ],
}

const sendMsgToClient = x => console.log(`Message to client: ${x}`)
const merge = (to, from) => Object.assign({}, to, from)

function nap() {
  DB.tasks.forEach((task, id) => {
    const {playbookId, currentStep} = task
    if (currentStep === undefined) return
    const step = DB.steps[currentStep]
    if (step && step.type === CLIENT_MESSAGE) {
      sendMsgToClient(step.value)
      present({ task: { id, currentStep: currentStep + 1, } })
    }
  })
}

const processTask = input => {
  const {id} = input
  const isNew = Boolean(id === undefined)
  if (isNew) {
    DB.tasks.push(input)
  } else {
    delete input.id
    DB.tasks[id] = merge(DB.tasks[id], input)
  }
}

const processDataField = dataField => {
  let {id} = dataField
  const isNew = Boolean(id === undefined)
  if (isNew) {
    const {taskId} = dataField
    const task = DB.tasks[taskId]
    if (DB.steps[task.currentStep].type !== CLIENT_INPUT) return 'rejected'
    DB.dataFields.push(dataField)
    present({
      task: {
        id: taskId,
        currentStep: task.currentStep + 1,
      }
    })
  } else {
    // TODO
  }
}

function present(data) {
  console.log('present', data)

  const {task} = data
  if (task !== undefined) processTask(task)

  const {dataField} = data
  if (dataField !== undefined) processDataField(dataField)

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
  present({
    dataField: {
      taskId: 2,
      value: 'Chicken',
    }
  })
}, 500)

// present final DB
setTimeout(() => {
  console.log(JSON.stringify({DB}, undefined, 2))
}, 600)
