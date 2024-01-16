import express = require('express');
import morgan = require('morgan')
import cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors())
app.use(express.static('dist'))

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}));

interface Person {
  id: string,
  name: string,
  number: string
}

let persons: Person[] = [
  { 
    "id": '1',
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": '2',
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": '3',
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": '4',
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

let alreadyGen = new Set<string>(['1', '2', '3', '4'])
function generateId(): string {
  while (true) {
    let newId = String(Math.round(Math.random() * 1000));
    if (alreadyGen.has(newId)) {
      newId = String(Math.round(Math.random() * 1000));
    } else {
      alreadyGen.add(newId)
      return newId;
    }
  }
}

function removeId(id: string) {
  alreadyGen.delete(id)
}

app.get('/api/persons', (req, res) => {
  res.json(persons);
})

app.get('/api/persons/:id', (req, res) => {
  let id = req.params.id
  let foundPerson = persons.find(p => p.id === id);
  if (foundPerson) {
    res.status(200).json(foundPerson)
  } else {
    res.status(404).send('person couldn\'t be found')
  }
})

app.get('/info', (req, res) => {
  const numPeople = persons.length;
  let d = new Date(Date.now());
  const page = 
  `Phonebook has info for ${numPeople} people <br/>
  ${d.toDateString()}`
  res.send(page)
})



app.post('/api/persons', (req, res) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({error: "name is missing"});
  }
  if (!body.number) {
    return res.status(400).json({error: "number is missing"});
  }
  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({error: "name already in phone book"});
  }
  const newPerson: Person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(newPerson);
  res.json(newPerson)

})


app.delete('/api/persons/:id', (req, res) => {
  console.log('here')
  let id = req.params.id
  let foundPerson = persons.find(p => p.id === id);
  if (!foundPerson) {
    return res.status(404).send('person couldn\'t be found')
  }
  

  persons = persons.filter(p => p.id !== id);
  removeId(id)

  res.send('deleted ' + foundPerson.name);
})


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log('app listening on port', PORT);
})