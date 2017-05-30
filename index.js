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
  playbooks: [
    // Id: 0
    {
      steps: [1, 2, 3],
    }
  ],
  tasks: [
    // Id: 0
    {
      playbookId: 555,
    }
  ],
}
const state = x => {
  console.log(x)
  // const output = model
  // view(output)
  // nap()
}

const present = data => {
  const {task} = data
  if (task) {
    let {id} = task
    const newTask = Boolean(id)
    if (newTask) {
      DB.tasks.push(task)
      // get id if newly created task
      id = DB.tasks.length - 1
    } else {
      Object.assign(DB.tasks[id], task)
    }
    state(DB.tasks[id])
  }
}

// Start the task
present({
  task: {
    id: 1,
    currentStepId: 1,
  }
})
