const prompt = require('prompt-sync')({ sigint: true });

// Prompting user to input the number of processes to simulate
let numberOfProcesses = prompt('Enter a number of processes: ');

// If the input is not a valid numeric value then continue prompting the user for a valid input
while (!Number(numberOfProcesses)) {
  console.log('Invalid Input! Only numeric values are allowed');
  numberOfProcesses = prompt('Enter a number of processes: ');
}

// Process List
const processes = [];

class Process {
  constructor(id) {
    this.id = id;
    this.counter = 0;
  }

  // Handles the occurrence of a local event
  localEvent() {
    this.counter++;
    console.log(
      `Process ${this.id}: Event Type: Local Event; Timestamp: ${this.counter}`
    );
  }

  // Handles send requests
  sending(receiverId) {
    this.counter++;
    console.log(
      `Process ${this.id}: Event Type: Sending Request to Process ${receiverId}; Timestamp: ${this.counter}`
    );
    processes[receiverId].receiving(this.id, this.counter);
  }

  // Handles received requests
  receiving(senderId, timestamp) {
    this.counter = Math.max(timestamp, this.counter) + 1;
    console.log(
      `Process ${this.id}: Event Type: Received request from Process ${senderId}; Timestamp: ${this.counter}`
    );
  }
}

// Initializing the processes
for (let i = 0; i < numberOfProcesses; i++) {
  processes.push(new Process(i));
}

// Emitting random events to simulate the working of the Lamport Clock
const possibleEvents = ['localEvent', 'sending', 'receiving'];
setInterval(function () {
  var randomProcessNumber = getRandomInt(numberOfProcesses);
  var randomEvent = getRandomInt(possibleEvents.length);
  switch (possibleEvents[randomEvent]) {
    case 'localEvent':
      processes[randomProcessNumber][possibleEvents[randomEvent]]();
      break;
    case 'sending':
      var randomReceiverId = getRandomInt(numberOfProcesses);
      while (randomReceiverId == randomProcessNumber)
        randomReceiverId = getRandomInt(numberOfProcesses);
      processes[randomProcessNumber][possibleEvents[randomEvent]](
        randomReceiverId
      );
      break;
    default:
      break;
  }
}, 1000);

// Select a random integer between the 0 and the max parameter
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
