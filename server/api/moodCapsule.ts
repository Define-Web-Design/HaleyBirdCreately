
import express from 'express';
import { analyzeMood, createMoodCapsules, generateCapsuleCaption } from '../ai/moodCapsule';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all mood capsules
router.get('/mood-capsules', async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, we'll return a placeholder response
    res.json({ 
      success: true,
      moodCapsules: [] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
});

// Create a new mood capsule
router.post('/mood-capsule', async (req, res) => {
  try {
    const { content, mood } = req.body;
    
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Content array is required and must not be empty' 
      });
    }
    
    // Step 1: Analyze content with sentiment/mood detection
    const analyzedData = await analyzeMood(content);
    
    // Step 2: Group content and create capsules
    const moodCapsules = await createMoodCapsules(analyzedData, mood);
    
    // Step 3: Award evolution points or update creative history here
    // This would typically interact with user accounts/profiles
    
    res.json({ 
      success: true,
      moodCapsules 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
});

// Generate a caption for a mood capsule
router.post('/mood-capsule/caption', async (req, res) => {
  try {
    const { capsule } = req.body;
    
    if (!capsule) {
      return res.status(400).json({ 
        success: false,
        error: 'Capsule data is required' 
      });
    }
    
    const caption = await generateCapsuleCaption(capsule);
    
    res.json({ 
      success: true,
      caption 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
});

export default router;
