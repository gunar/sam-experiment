'use strict'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/test')

const { Schema } = mongoose
const {
  Mixed,
  ObjectId,
} = Schema.Types

const CLIENT_INPUT = 'CLIENT_INPUT'
const CLIENT_MESSAGE = 'CLIENT_MESSAGE'

// this.modifiedPaths()
// original values: https://stackoverflow.com/questions/18192804/mongoose-get-db-value-in-pre-save-hook#18195850

// STEP -----------------------------------------
const stepSchema = new Schema({
  type: { type: String, required: true, enum: [CLIENT_INPUT, CLIENT_MESSAGE] },
  value: String,
  index: {
    type: Number,
    required: true,
    validate: async function (v) {
      const count = await Step.count({ index: this.index })
      if (count > 0) throw Error('step.index should be unique')
    },
  },
})
stepSchema.post('save', state)
const Step = mongoose.model('Step', stepSchema)

// TASK -----------------------------------------
const taskSchema = new Schema({
  currentStep: { type: Number, default: 0 },
})
taskSchema.post('save', state)
const Task = mongoose.model('Task', taskSchema)

// DATAFIELD -----------------------------------------
const dataFieldSchema = new Schema({
  taskId: {
    type: ObjectId, 
    validator: async function (v) {
      const step = await Step.findById(v)

      if (step.type !== CLIENT_INPUT) {
        throw Error('Cant create a DataField for a non CLIENT_INPUT step')
      }
      task.currentStep++
      await task.save()
    },
  },
  value: String,
})
dataFieldSchema.post('save', state)
const DataField = mongoose.model('DataField', dataFieldSchema)

const sendMsgToClient = x => console.log(`Message to client: ${x}`)


async function nap(lastUpdatedInstance) {
  if (lastUpdatedInstance instanceof Task)
    await nap.processTask(lastUpdatedInstance)
}

nap.processTask = async (task) => {
  const step = await Step.findOne({ index: task.currentStep })
  if (step.type === CLIENT_MESSAGE) {
    sendMsgToClient(step.value)
    task.currentStep++
    await task.save()
  }
}

function state() {
  // TODO

  const lastUpdatedInstance = this
  nap(lastUpdatedInstance)
}

const onClientInput = ({taskId, value}) => 
  DataField.create({ taskId, value })

const consolePrintDB = () => console.log(JSON.stringify({DB}, undefined, 2))

const sleep = ms =>
  new Promise(res =>
    setTimeout(res, ms))

async function init() {
  // prepare database
  try {
    await Promise.all([
      Step.create({
        index: 0,
        type: CLIENT_MESSAGE,
        value: 'Hello Client, and welcome.',
      }),
      Step.create({
        index: 1,
        type: CLIENT_MESSAGE,
        value: 'What would you like to have for dinner?',
      }),
      Step.create({
        index: 2,
        type: CLIENT_INPUT,
      }),
      Step.create({
        index: 3,
        type: CLIENT_MESSAGE,
        value: 'Got it! Thank you',
      }),
    ])
  }
  catch (e) {}

  // run
  const task = await Task.create({ currentStep: 0 })
  await sleep(500)
  onClientInput({taskId: task._id, value: 'Chicken'})
}

init()
