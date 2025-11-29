/**
 * Visits API routes
 */

import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase';
import { logger } from '../utils/logger';
import { VisitRecord } from '../../../shared/types';

export const visitsRouter = Router();

/**
 * POST /api/visits
 * Create a new visit
 */
visitsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nurseId } = req.body;

    const visit = await supabaseService.createVisit(nurseId);

    logger.info(`Created visit ${visit.id}`);

    res.status(201).json(visit);
  } catch (error) {
    logger.error('Error creating visit:', error);
    res.status(500).json({
      error: 'Failed to create visit',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/visits/:id
 * Get a visit by ID
 */
visitsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visit = await supabaseService.getVisit(id);

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json(visit);
  } catch (error) {
    logger.error(`Error getting visit ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to get visit',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/visits/:id
 * Update a visit
 */
visitsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;

    const visit = await supabaseService.updateVisit(id, updates);

    logger.info(`Updated visit ${id}`);

    res.json(visit);
  } catch (error) {
    logger.error(`Error updating visit ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to update visit',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

