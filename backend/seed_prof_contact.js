const mongoose = require('mongoose');
require('dotenv').config();
const Professor = require('./models/Professor.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding professor contact info...');
    
    const professors = await Professor.find({});
    
    let updateCount = 0;
    for (const prof of professors) {
      if (!prof.email || !prof.deskNumber) {
        // Generate a fake email based on name
        const emailPrefix = prof.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
        prof.email = `${emailPrefix}@university.edu`;
        
        // Generate a random desk number like Building-Room
        const buildings = ['Science Hall', 'Tech Center', 'Main Building', 'Arts Wing'];
        const building = buildings[Math.floor(Math.random() * buildings.length)];
        const roomNumber = Math.floor(Math.random() * 400) + 100;
        prof.deskNumber = `${building} ${roomNumber}`;
        
        await prof.save();
        updateCount++;
      }
    }
    
    console.log(`Successfully updated ${updateCount} professors with contact info.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
