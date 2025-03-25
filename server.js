const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const users = new Map();
const events = new Map();

const auth = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!users.has(userId)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

app.post('/register', (req, res) => {
    const { id, name, password } = req.body;
    if (users.has(id)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    users.set(id, { name, password });
    res.status(201).json({ message: 'User registered' });
});

app.post('/events', auth, (req, res) => {
    const { name, description, date, category } = req.body;
    const eventId = Date.now().toString();
    const event = { id: eventId, name, description, date, category, userId: req.userId };
    events.set(eventId, event);
    res.status(201).json(event);
});

app.get('/events', auth, (req, res) => {
    const userEvents = Array.from(events.values())
        .filter(event => event.userId === req.userId);

    const category = req.query.category;
    if (category) {
        return res.json(userEvents.filter(event => event.category === category));
    }

    userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(userEvents);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 