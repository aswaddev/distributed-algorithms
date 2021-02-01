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
  constructor(id) {
    this.id = id;
    this.hasToken = false;
  }

  accessCriticalSection() {
    if (this.hasToken) {
      console.log(`Process#${this.id}: Accessing critical section`);
    }
  }
}

// Creating processes and pushing them to the processes array
for (let i = 0; i < numberOfProcesses; i++) {
  processes.push(new Process(i, false));
}

// Setting the initiator process as the previous process
var prevProcess = getRandomInt(numberOfProcesses);
prevProcess.hasToken = true;

// Setting the next process in array
var nextProcess = prevProcess + 1;

// Passing the token to the next process in ring after each second for simulation purposes
setInterval(function () {
  processes[getRandomInt(numberOfProcesses)].accessCriticalSection();
  // If the next process exists and the next process is active then move to the next process in array
  if (processes[nextProcess]) {
    console.log(
      `Process#${processes[prevProcess].id} passes token to Process#${processes[nextProcess].id}`
    );
    processes[nextProcess].hasToken = true;
    // Set the prevProcess as the nextProcess
    prevProcess = nextProcess;
  }

  // Set the nextProcess to the very next process in the array. The modulus operator makes sure that if the nextProcess number is greater than the totalNumberOfProcesses than we reset the nextProcess to 0
  nextProcess = (nextProcess + 1) % numberOfProcesses;
}, 1000);

// Select a random integer between the 0 and the max parameter
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
