require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Course = require('./models/Course.model');

const prereqsMap = {
  'CSE111': ['CSE110'],
  'CSE220': ['CSE111', 'CSE230'],
  'CSE221': ['CSE220'],
  'CSE250': ['PHY112'], 
  'CSE251': ['CSE250'],
  'CSE260': ['CSE251'],
  'CSE310': ['CSE370'],
  'CSE321': ['CSE221'], 
  'CSE330': ['MAT216'],
  'CSE331': ['CSE221'],
  'CSE340': ['CSE260'],
  'CSE341': ['CSE260', 'CSE340', 'CSE321'],
  'CSE350': ['CSE251'],
  'CSE360': ['CSE341'],
  'CSE370': ['CSE221'],
  'CSE391': ['CSE370'],
  'CSE392': ['MAT215'],
  'CSE410': ['CSE321'],
  'CSE420': ['CSE321', 'CSE331', 'CSE340'],
  'CSE421': ['CSE320'],
  'CSE422': ['CSE221'],
  'CSE423': ['MAT216'],
  'CSE430': ['MAT120'],
  'CSE460': ['CSE260'],
  'CSE461': ['CSE260'],
  'CSE470': ['CSE370'],
  'CSE471': ['CSE370'],
  'CSE489': ['CSE370'],
  'ENG102': ['ENG101'],
  'ENG103': ['ENG102'],
  'MAT120': ['MAT110'],
  'MAT215': ['MAT216'],
  'MAT216': ['MAT120']
};

async function updatePrerequisites() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let updatedCount = 0;
    
    for (const [courseCode, reqList] of Object.entries(prereqsMap)) {
      const course = await Course.findOne({ courseCode });
      if (!course) {
        console.log(`Course not found in DB: ${courseCode}`);
        continue;
      }

      const reqIds = [];
      for (const reqCode of reqList) {
        const prereqCourse = await Course.findOne({ courseCode: reqCode });
        if (prereqCourse) {
          reqIds.push(prereqCourse._id);
        } else {
          console.log(`Warning: Prerequisite ${reqCode} not found for ${courseCode} (cannot dynamically link until ${reqCode} is created in DB)`);
        }
      }

      course.prerequisites = reqIds;
      await course.save();
      updatedCount++;
      console.log(`Updated ${courseCode} prerequisites`);
    }

    console.log(`Successfully updated prerequisites for ${updatedCount} courses based on the new map.`);
  } catch (error) {
    console.error('Error updating prerequisites:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Done.');
  }
}

updatePrerequisites();
