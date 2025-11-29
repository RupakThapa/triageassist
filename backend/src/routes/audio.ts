/**
 * Audio upload routes
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabaseService } from '../services/supabase';
import { triggerN8nWebhook } from '../services/n8nWebhook';
import { logger } from '../utils/logger';
import { VisitStatus } from '../../../shared/types';

export const audioRouter = Router();

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

/**
 * POST /api/audio/upload/:visitId
 * Upload audio file for a visit and trigger processing
 */
audioRouter.post('/upload/:visitId', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;
    const file = req.file;
    const transcript = req.body.transcript; // Get transcript from form data

    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    logger.info(`Uploading audio for visit ${visitId} (${file.size} bytes, ${file.mimetype})`);
    if (transcript) {
      logger.info(`Received live transcript (${transcript.length} chars)`);
    }

    // Verify visit exists
    const visit = await supabaseService.getVisit(visitId);
    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Upload to Supabase Storage (pass buffer directly)
    const audioUrl = await supabaseService.uploadAudio(visitId, file.buffer, file.mimetype);

    // Update visit with audio URL and set status to processing
    await supabaseService.updateVisit(visitId, {
      audio_url: audioUrl,
      status: 'processing' as VisitStatus,
    });

    // Trigger n8n-mock webhook asynchronously with transcript
    triggerN8nWebhook(visitId, audioUrl, visit.nurse_id || undefined, transcript).catch((error) => {
      logger.error(`Failed to trigger n8n webhook for visit ${visitId}:`, error);
    });

    logger.info(`Audio uploaded successfully for visit ${visitId}`);

    res.json({
      success: true,
      visitId,
      audioUrl,
    });
  } catch (error) {
    logger.error(`Error uploading audio for visit ${req.params.visitId}:`, error);
    res.status(500).json({
      error: 'Failed to upload audio',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/audio/:visitId
 * Get signed URL for audio file
 */
audioRouter.get('/:visitId', async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const audioUrl = await supabaseService.getAudioUrl(visitId);

    if (!audioUrl) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    res.json({ audioUrl });
  } catch (error) {
    logger.error(`Error getting audio URL for visit ${req.params.visitId}:`, error);
    res.status(500).json({
      error: 'Failed to get audio URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

