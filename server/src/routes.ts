import express from 'express';
import connection from './database/connection';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const router = express.Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();

router.get('/items', itemsController.index)

router.post('/points', pointsController.create);

router.get('/points', pointsController.index);

router.get('/points/:id', pointsController.show);

router.get('/select', async (req, res) => {
    const items = await connection('items').select('*');
    const points = await connection('points').select('*');
    const points_items = await connection('points_items').select('*');
    
    
    return res.json(points_items);
})

export default router;