// server.js
/*
const express = require('express');
const app = express();
const port = 8080;

 Serva statiska filer (HTML, CSS, JS) från public-mappen
 app.get('/', (req, res) => {res.send('Hello World! now with auto deploy');}); 
 app.use(express.static('FireworkshopProjectCodeChatGPT'));
 app.get('/', (req, res) => {res.sendFile(__dirname + '/index.html');});
napp.get('/', (req, res) => {res.sendFile('C:\Users\Paulo\Skola\Lexicon\Projects\Final Project\FireworkshopProjectCodeChatGPT\index.html');});

 Starta servern
 app.listen(port, () => {console.log(`Server running at http://localhost:${port}`);});
*/

const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serva statiska filer direkt från projektmappen
app.use(express.static(__dirname));

// Serva index.html vid root ("/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serva header.html och footer.html
app.get('/header.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'header.html'));
});

app.get('/footer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'footer.html'));
});

// Starta servern
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
