const prompt = require('prompt-sync')({ sigint: true });

// Prompting user to input the number of processes to simulate
let numberOfProcesses = prompt('Enter a number of processes: ');

// If the input is not a valid numeric value then continue prompting the user for a valid input
while (!Number(numberOfProcesses)) {
  console.log('Invalid Input! Only numeric values are allowed');
  numberOfProcesses = prompt('Enter a number of processes: ');
}

// Initializing an empty array of processes
const processes = [];

// Structure of each process
class Process {
  constructor(id, coordinator = null) {
    this.id = id;
    this.isActive = true;
    this.isCoordinator = false;
    this.coordinator = coordinator;
  }

  startElection() {
    var electionMessage = [];

    // Setting the initiator process as the previous process
    var prevProcess = this.id;
    // Setting the next process in array
    var nextProcess = prevProcess + 1;

    electionMessage.push(prevProcess);

    // Iterating through the ring till we have made a made a complete round through it
    while (true) {
      // If the next process exists and the next process is active then move to the next process in array
      if (processes[nextProcess] && processes[nextProcess].isActive) {
        console.log(
          `Process ${processes[prevProcess].id} passes ${JSON.stringify(
            electionMessage
          )} to ${processes[nextProcess].id}`
        );
        electionMessage.push(nextProcess);
        // Set the prevProcess as the nextProcess
        prevProcess = nextProcess;
      }

      // Set the nextProcess to the very next process in the array. The modulus operator makes sure that if the nextProcess number is greater than the totalNumberOfProcesses than we reset the nextProcess to 0
      nextProcess = (nextProcess + 1) % numberOfProcesses;

      // If we have made a complete roundtrip then break out of the loop
      if (nextProcess == this.id) {
        break;
      }
    }

    var newCoordinator = getHighestProcess(electionMessage);
    coordinatorUpdated(newCoordinator);
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

// Creating processes and pushing them to the processes array
for (let i = 0; i < numberOfProcesses; i++) {
  processes.push(new Process(i, false));
}

// Initial we set the process with the highest id as the coordinator
var coordinator = processes[numberOfProcesses - 1];
console.log(
  `Process#${coordinator.id} selected as the original coordinator due to it having the highest id number`
);

// Broadcasting coordinator process
coordinatorUpdated(coordinator);

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

// Get the id of the process having the highest id from the given list
function getHighestProcess(electionMessage) {
  var electionMessage = electionMessage.filter(
    (processId) => processes[processId].isActive
  );
  var max = electionMessage.reduce((a, b) => Math.max(a, b));
  return processes[max];
}

// Select a random integer between the 0 and the max parameter
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Broadcasting that a new coordinator has been elected
function coordinatorUpdated(coordinator) {
  console.log(`Process ${coordinator.id} becomes coordinator`);
  for (let i = 0; i < numberOfProcesses; i++) {
    processes[i].coordinator = coordinator;
  }
}
