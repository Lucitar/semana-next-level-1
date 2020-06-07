import {Request, Response, response} from 'express';
import connection from '../database/connection';

class PointsController {
    async index(req: Request, res: Response){
        const {city, uf, items} = req.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await connection('points')
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return res.json(points);
    }

    async create(req: Request, res: Response){
    
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;
        
        const trx = await connection.transaction();
    
        const points = {
            image: 'image-falsa',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedIds = await trx('points').insert(points)
    
        console.log(insertedIds[0]);
        const point_id = insertedIds[0];
    
        const pointsItems = items.map((item_id: number)=>{
            return {
                item_id: item_id,
                point_id: point_id
            };
        });
        console.log(pointsItems);
        await trx('points_items').insert(pointsItems)
            .then(trx.commit)
            .catch(trx.rollback);
    
        return res.json({
            id: point_id,
            ...points, 
        });
    }

    async show(req: Request, res: Response){
        const id = req.params.id;

        const point = await connection('points').where('id', id).first();

        if(!point){
            return res.status(400).json({message: 'Ponto não Encontrado. :/'}) 
        }

        const items = await connection('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id)
            .select('items.title'); 

        return res.json({point, items});
    }
}

export default PointsController;