'use strict'

const assert = require('assert')
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
const UNIQUE_STEP_INDEX_ERROR = Error('step.index should be unique')
const stepSchema = new Schema({
  type: { type: String, required: true, enum: [CLIENT_INPUT, CLIENT_MESSAGE] },
  value: String,
  index: {
    type: Number,
    required: true,
    validate: async function (v) {
      const count = await Step.count({ index: this.index })
      if (count > 0) throw UNIQUE_STEP_INDEX_ERROR
    },
  },
})
stepSchema.post('save', state)
const Step = mongoose.model('Step', stepSchema)

// TASK -----------------------------------------
const taskSchema = new Schema({
  currentStep: {
    type: Number,
    default: 0,
    validate: async function() {
      const step = await Step.findOne({ index: this.currentStep })
      if (step && step.type === CLIENT_MESSAGE) {
        // if this throws, present() fails thus not changing current step
        sendMsgToClient(step.value)
      }
    }
  },
})
taskSchema.post('save', state)
taskSchema.methods.moveForwardOneStep = async function () {
  this.currentStep++
  await this.save()
}
const Task = mongoose.model('Task', taskSchema)

// DATAFIELD -----------------------------------------
const dataFieldSchema = new Schema({
  taskId: {
    type: ObjectId, 
    validate: async function () {
      const task = await Task.findById(this.taskId)
      const step = await Step.findOne({ index: task.currentStep })
      if (!step) return

      if (step.type !== CLIENT_INPUT) {
        throw Error('Cant create a DataField for a non CLIENT_INPUT step')
      }
    },
  },
  step: Number,
  value: String,
})
dataFieldSchema.post('save', state)
const DataField = mongoose.model('DataField', dataFieldSchema)

const sendMsgToClient = x => console.log(`Bot: ${x}`)

async function nap(lastUpdatedInstance) {
  await nap.processTasks()
}

nap.processTasks = async () => {
  const tasks = await Task.find({ currentStep: { $ne: null } })
  for (const task of tasks) {
    const step = await Step.findOne({ index: task.currentStep })
    if (!step) continue
    if (step.type === CLIENT_MESSAGE) {
      await task.moveForwardOneStep()
    }
    if (step.type === CLIENT_INPUT) {
      const dataField = await DataField.find({
        taskId: task._id,
        step: task.currentStep,
      })
      const hasBeenAnswered = Boolean(dataField.length > 0)
      if (hasBeenAnswered) {
        await task.moveForwardOneStep()
      }
    }
  }
}

async function state() {
  // TODO

  await nap()
}

const onClientInput = async ({taskId, value}) => {
  console.log(`Client: ${value}`)
  const task = await Task.findById(taskId)
  DataField.create({ taskId, value, step: task.currentStep })
}

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
  catch (e) {
    // Steps already created in DB
    assert.strictEqual(e.errors.index.reason.message, UNIQUE_STEP_INDEX_ERROR.message)
  }

  // run
  const task = await Task.create({ currentStep: 0 })
  await sleep(1000)
  await onClientInput({taskId: task._id, value: 'Chicken'})
}

init()
