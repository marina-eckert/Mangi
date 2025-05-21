const { Task } = require("../models/Project");
const mongoose = require('mongoose');
const Project = mongoose.model('Project');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');

// TODO need to make the admin check work here and likely break out a separate admin only check. Currently any collaborator has full CRUD access to their projects
function userOnProject(project, userId) {

    console.log("checking modification permissions for user with userOnProject");

    // if the user is the admin of the project immediately return true
    if(project.adminId.toString() == userId) {
        console.log("they are the admin");
        return true;
    } 
    else if (project.collaborators.indexOf(userId) >= 0) {
        console.log("they are a collaborator");
        return true;
    } else {
        console.log("not authorized");
        return false;
    }
}

function taskProtector(taskUpdates, existingTask) {

    validTaskParams.forEach((param) => {
        if(taskUpdates[param]) {
            existingTask[param] = taskUpdates[param]
        }
    })

    return existingTask;
}

function stringifyCompare(firstEle, secondEle) {
    return JSON.stringify(firstEle) === JSON.stringify(secondEle);
}

function getFutureDate(daysInFuture = 0) {
    let base = new Date();
    base.setDate(base.getDate() + daysInFuture);
    return base; 
}

async function blockingTaskCheck(rootTask, project) {
    // console.log(project, "project in btCheck\n****\n")

    // if this task has no blocking tasks then no checks need to be done and can resolve as passed
    if(rootTask.blockingTasks?.length <= 0) {
        return true;
    }
    
    // create a hash where the key is the ID of each blocking task of the rootTask and the value is the full task object
    const hashedTasks = project.tasks.reduce((acc, obj) => {
        acc[obj.id.toString()] = obj;
        return acc;
    }, {});

    // console.log(hashedTasks, "hashed Tasks\n****\n")
    
    // this is the date that no other task in the tree can end after
    const anchorDate = rootTask.startDate;

    
    // initialize the queue with the root's blocking tasks, making a copy of the data
    const checkQ = [...rootTask.blockingTasks];
    // console.log(checkQ, "checkQ\n****\n");

    // visited tracks already visited nodes for optimization
    const visited = {};

    //this is a Breadth First Search we work the queue until it is exhausted
    while (checkQ.length > 0) {
        
        // pull the first element off the queue, a task ID
        const currentTaskId = checkQ.shift().toString();
        // console.log(currentTaskId, "currentTaskId\n****\n");

        // if we have already visited, we can skip
        if(visited[currentTaskId]) {
            continue;
        }
        // if we haven't visited it, set its value to true for future iterations to know it has been visited
        else {
            visited[currentTaskId] = true;
        }

        // get the task from the id
        const currentTask = hashedTasks[currentTaskId]

        if(!currentTask) return false;

        // check the tasks end date against the anchor date. If the end date of the current task is after the start date of the root, then it is invalid, sos return true
        if (currentTask.endDate > anchorDate) {
            console.log(`Task ${currentTask._id} date of ${currentTask.endDate} is after ${anchorDate}  \n****\n`);
            return false
        }
        
        // add the children of the current task to the queue
        if (currentTask.blockingTasks.length > 0) checkQ.push(currentTask.blockingTasks);

    }

    // if we make it here, it means the queue was exhausted without finding an invalid blocking task. We can return true
    console.log("blocking task check has passed \n****\n");
    return true;
}

function arrayDiff(array1, array2) {
    const added = array2.filter((element) => !array1.includes(element));
    const removed = array1.filter((element) => !array2.includes(element));
    return { added, removed };
  }

module.exports = {
    userOnProject,
    taskProtector,
    stringifyCompare,
    getFutureDate,
    blockingTaskCheck,
    arrayDiff
}