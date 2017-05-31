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
  tasks: [ ],
  dataFields: [ ],
}

DB.newDataField = input => {
  const {taskId} = input
  const task = DB.tasks[taskId]
  if (DB.steps[task.currentStep].type !== CLIENT_INPUT) return 'rejected'
  DB.dataFields.push(input)
  present({
    task: {
      id: taskId,
      currentStep: task.currentStep + 1,
    }
  })
}

DB.newTask = input => {
  DB.tasks.push(input)
}

const sendMsgToClient = x => console.log(`Message to client: ${x}`)
const mergeInto = (to, from) => Object.assign(to, from)

function nap() {
  nap.processTasks()
}

nap.processTasks = () => {
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


function present(data) {
  console.log('present', data)

  present.task(data)
  present.dataField(data)

  nap()
}

const createSubPresent = ({fieldName, ifNew, ifUpdate}) =>
  data => {
    const input = data[fieldName]
    if (input === undefined) return
    const {id} = input
    const isNew = Boolean(id === undefined)
    if (isNew) { return ifNew(input) }
    else { return ifUpdate(input) }
  }

present.task = createSubPresent({
  fieldName: 'task',
  ifNew: DB.newTask,
  ifUpdate(input) {
    const id = input.id
    delete input.id
    mergeInto(DB.tasks[id], input)
  }
})

present.dataField = createSubPresent({
  fieldName: 'dataField',
  ifNew: DB.newDataField,
  // TODO
  ifUpdate: () => null, 
})

const newTask = () =>
  present({ task: { currentStep: 0 } })

const onClientInput = ({taskId, value}) => 
  present({ dataField: { taskId, value } })

const consolePrintDB = () => console.log(JSON.stringify({DB}, undefined, 2))

function init() {
  newTask()

  setTimeout(() => {
    onClientInput({taskId: 0, value: 'Chicken'})
  }, 500)

  setTimeout(() => {
    consolePrintDB()
  }, 600)
}

init()
