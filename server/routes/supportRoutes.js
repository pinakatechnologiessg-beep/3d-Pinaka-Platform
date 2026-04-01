import express from 'express';
import SupportQuery from '../models/SupportQuery.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, type, message } = req.body;
    const newQuery = new SupportQuery({ name, email, type, message });
    await newQuery.save();
    res.status(201).json({ message: 'Query received and saved to database' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving query' });
  }
});

export default router;
