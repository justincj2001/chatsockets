const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MySQL database connection configuration
const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hellocb'
});

// Connect to the database
dbConnection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Socket.io connection handling
io.on('connection', socket => {
    console.log('A user connected');

    // Listen for messages from clients
    socket.on('chat message', message => {
        // Broadcast the message to all connected clients
        io.emit('chat message', message);
        
        // Save the message to the database
        saveMessageToDatabase(message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Function to save message to the database
function saveMessageToDatabase(message) {
    const query = `
        INSERT INTO Messages (SenderUserID, ConversationID, MessageContent, MessageStatus)
        VALUES (?, ?, ?, 'Sent')
    `;
    const values = [2, 666, message]; // Replace 1, 1 with actual user and conversation IDs
    
    dbConnection.query(query, values, (error, results, fields) => {
        if (error) {
            console.error('Error saving message to database:', error);
            return;
        }
        console.log('Message saved to the database');
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
