const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { timeStamp } = require('console');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Socket.IO server!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let currentPoll = null;
let pastPolls = [];
let connectedStudents = {};
let kickedNames = {};

function broadcastStudentList(){
  const list = Object.values(connectedStudents);
  io.emit("student_list", list);
}

function getResults(poll) {
  const counts = {};
  poll.options.forEach((option) => {
    counts[option] = 0;
  });
  Object.values(poll.answers).forEach((answer) => {
    if (counts[answer] !== undefined) {
      counts[answer]++;
    }
  });
  return counts;
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('student_joined', (name, ack) => {
    const now = Date.now();
    const kickedAt = kickedNames[name];
    if(kickedAt && now - kickedAt < 20000){
      console.log(`Blocked rejoin for ${name}`);
      socket.emit("kicked");
      socket.disconnect();
      return;
    }
    if(kickedAt && now-kickedAt < 20000) delete kickedNames[name];
    console.log(`Student joined: ${name} (Socket ID: ${socket.id})`);
    connectedStudents[socket.id] = name;
    broadcastStudentList();
    if(ack) ack();
    if (currentPoll && !currentPoll.answers?.[name]) { 
      socket.emit('poll_question', currentPoll);
    }
  });

  socket.on('new_poll', (pollData) => {
    console.log('New poll received:', pollData);
    currentPoll = {
      ...pollData,
      answers: {},
      startTime: Date.now(),
    };
    io.emit('poll_question', currentPoll);
    setTimeout(() => {
      if (currentPoll) {
        pastPolls.push({
          question: currentPoll.question,
          options: currentPoll.options,
          answers: { ...currentPoll.answers },
        });
        const counts = getResults(currentPoll);
        io.emit("poll_results", counts);
        io.emit("poll_answers_detailed", currentPoll.answers);
        io.emit("past_polls", pastPolls);
        currentPoll = null;
      }
    }, pollData.duration * 1000);
  });

  socket.on('submit_answer', ({ name, answer }) => {
    if (!currentPoll || currentPoll.answers[name]) {
      console.log('No active poll to submit answer to.');
      return;
    }
    currentPoll.answers[name] = answer;
    console.log(`Answer submitted by ${name}: ${answer}`);
    const counts = getResults(currentPoll);
    io.emit('poll_results', counts);
    io.emit('poll_answers_detailed', currentPoll.answers);
  });

  socket.on("get_current_poll_state", () => {
    if(currentPoll) {
      socket.emit("poll_question", currentPoll);
      socket.emit("poll_results", getResults(currentPoll));
      socket.emit("poll_answers_detailed", currentPoll.answers);
    }
  });

  socket.on("get_student_list", () => {
    const list = Object.values(connectedStudents);
    socket.emit("student_list", list);
  })

  socket.on('get_past_polls', () => {
    socket.emit('past_polls', pastPolls);
  });

  socket.on("send_message", ({sender, role, message}) => {
    const chatMessage = {
      sender, role, message, timestamp: Date.now(),
    };
    io.emit("receive_message", chatMessage);
  });

  socket.on("kick_student", (nameToKick) => {
    for (let [sockId, studentName] of Object.entries(connectedStudents)) {
      if (studentName === nameToKick) {
        console.log(`Kicking ${nameToKick}`);
        kickedNames[nameToKick] = Date.now();
        io.to(sockId).emit("kicked");
        io.sockets.sockets.get(sockId)?.disconnect();
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete connectedStudents[socket.id];
    broadcastStudentList();
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});