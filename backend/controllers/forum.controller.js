const ForumTopic = require('../models/ForumTopic.model');
const ForumAnswer = require('../models/ForumAnswer.model');

exports.createTopic = async (req, res) => {
  try {
    const { title, content, isAnonymous } = req.body;
    const topic = new ForumTopic({
      title,
      content,
      isAnonymous,
      author: req.user.userId
    });
    const savedTopic = await topic.save();
    res.status(201).json(savedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Error creating forum topic', error: error.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const topics = await ForumTopic.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    // Handle anonymity
    const processedTopics = topics.map(topic => {
      const topicObj = topic.toObject();
      if (topicObj.isAnonymous) {
        topicObj.author = { _id: null, username: 'Anonymous' };
      }
      return topicObj;
    });

    res.json(processedTopics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching topics', error: error.message });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id)
      .populate('author', 'username');
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const topicObj = topic.toObject();
    if (topicObj.isAnonymous) {
      topicObj.author = { _id: null, username: 'Anonymous' };
    }

    const answers = await ForumAnswer.find({ topicId: req.params.id })
      .populate('author', 'username')
      .sort({ createdAt: 1 });

    const processedAnswers = answers.map(answer => {
      const ansObj = answer.toObject();
      if (ansObj.isAnonymous) {
        ansObj.author = { _id: null, username: 'Anonymous' };
      }
      return ansObj;
    });

    res.json({ topic: topicObj, answers: processedAnswers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching topic', error: error.message });
  }
};

exports.createAnswer = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const topicId = req.params.id;

    const answer = new ForumAnswer({
      topicId,
      content,
      isAnonymous,
      author: req.user.userId
    });

    const savedAnswer = await answer.save();
    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating answer', error: error.message });
  }
};
