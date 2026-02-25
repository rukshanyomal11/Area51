const express = require('express');
const router = express.Router();
const Request = require('../models/Request');


// GET /requests
// Fetch all request records from the database
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find(); // Retrieve all requests
    res.json(requests); // Return as JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle any server errors
  }
});


// Export the router to be used in main app
module.exports = router;
