const prompt = require('prompt-sync')({ sigint: true });

// Prompting user to input the number of processes to simulate
let numberOfProcesses = prompt('Enter a number of processes: ');

// If the input is not a valid numeric value then continue prompting the user for a valid input
while (!Number(numberOfProcesses)) {
  console.log('Invalid Input! Only numeric values are allowed');
  numberOfProcesses = prompt('Enter a number of processes: ');
}

// Timeout Threshold
const timeoutThreshold = 3000;

// Structure of each process
class Process {
  constructor(id, coordinator = null) {
    this.id = id;
    this.isActive = true;
    this.latency = getRandomInt(5000);
    this.isCoordinator = false;
    this.coordinator = coordinator;
  }

  // Send election message if the a process realizes that the coordinator has crashed
  startElection() {
    var processesWithHigherIds = processes.filter(
      (process) => process.id > this.id
    );
    if (processesWithHigherIds.length) {
      // Sending electionMessages and getting candidates
      var candidates = processesWithHigherIds.filter((process) => {
        console.log(`Sent election message to Process#${process.id}`);
        return this.sendElectionMessage(process.id);
      });
      // If there are any candidates then select the best candidate as the coordinator
      if (candidates.length) {
        // Printing out candidates that acknowledged the electionMessage
        console.log('------------------- CANDIDATES -------------------');
        console.table(candidates);
        console.log('--------------------------------------');
        var coordinator = candidates[0];
        if (candidates.length > 1) {
          for (let i = 1; i < candidates.length; i++) {
            const candidate = candidates[i];
            if (candidate.id > coordinator.id) coordinator = candidate;
          }
        }
        // Coordinator selected and broadcasted
        this.broadcastCoordinator(coordinator);
      } else {
        // In case there aren't any candidates then make the process that initialized the election as the coordinator
        this.broadcastCoordinator(this);
        console.log(`Process ${this.id} becomes coordinator`);
      }
    } else {
      // In case there are no process greater than the process that initialized the election, then make itself the coordinator
      this.broadcastCoordinator(this);
      console.log(`Process ${this.id} becomes coordinator`);
    }
  }

  // Send election message for electing new coordinator
  sendElectionMessage(id) {
    return processes[id].acknowledge();
  }

  // Acknowledge election message
  acknowledge() {
    return this.isActive && this.latency < timeoutThreshold;
  }

  // Broadcasting that a new coordinator has been elected
  broadcastCoordinator(coordinator) {
    console.log(`Process ${coordinator.id} becomes coordinator`);
    for (let i = 0; i < numberOfProcesses; i++) {
      processes[i].coordinator = coordinator;
    }
  }

  // A process pings the coordinator to see if it's alive
  pingCoordinator() {
    return coordinator.getIsActive();
  }

  // Response by the coordinator
  getIsActive() {
    return this.isActive;
  }
}

// Initializing an empty array of processes
const processes = [];
// Creating processes and pushing them to the processes array
for (let i = 0; i < numberOfProcesses; i++) {
  processes.push(new Process(i, false));
}

// Initial we set the process with the highest id as the coordinator
var coordinator = processes[numberOfProcesses - 1];
console.log(
  `Process#${coordinator.id} selected as the original coordinator due to it having the highest id number`
);

// Kill the coordinator after 3000ms for simulation purposes
setTimeout(function () {
  console.log(`Process#${coordinator.id}, the coordinator crashes`);
  coordinator.isActive = false;
}, 3000);

// Keep polling coordinator through random processes. If the coordinator goes down at some point in time then we start a new coordinator election
var intervalHandle = setInterval(coordinatorPolling, 1000);
function coordinatorPolling() {
  var randomProcessNo = getRandomInt(numberOfProcesses);
  while (randomProcessNo == coordinator.id) {
    randomProcessNo = getRandomInt(numberOfProcesses);
  }
  isActive = processes[randomProcessNo].pingCoordinator();
  if (isActive) {
    console.log(
      `Process#${processes[randomProcessNo].id} -> coordinator... Coordinator Alive`
    );
  } else {
    console.log(
      `Process#${processes[randomProcessNo].id} -> coordinator... Coordinator Dead. Starting coordinator election`
    );
    clearInterval(intervalHandle);
    processes[randomProcessNo].startElection();
  }
}

// Select a random integer between the 0 and the max parameter
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
