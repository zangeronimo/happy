import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import Orphanage from '../models/Orphanage';
import OrphanageView from '../views/OrphanagesView';
import * as Yup from 'yup';

export default {
    async index(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(OrphanageView.renderMany(orphanages));
    },

    async show(request: Request, response: Response) {
        const {id} = request.params;
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return response.json(OrphanageView.render(orphanages));
    },

    async create(request: Request, response: Response) {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } = request.body;
    
        const orphanagesRepository = getRepository(Orphanage);

        const requestImages = request.files as Express.Multer.File[];
        const images = requestImages.map(image => {
            return { path: image.filename }
        })
    
        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            images
        };

        const schema = Yup.object().shape({
            name: Yup.string().required('Nome obrigatório'),
            latitude: Yup.number().required('Latitude obrigatório'),
            longitude: Yup.number().required('Longitude obrigatório'),
            about: Yup.string().required('Sobre obrigatório').max(300, 'Máximo de 300 caracteres'),
            instructions: Yup.string().required('Instruções obrigatório'),
            opening_hours: Yup.string().required('Horário obrigatório'),
            open_on_weekends: Yup.boolean().required('Aberto aos fim de semana obrigatório'),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required('Caminho obrigatório')
                })
            )
        })

        const finalData = schema.cast(data);

        await schema.validate(data, {
            abortEarly: false,
        })

        const orphanage = orphanagesRepository.create(data);
    
        await orphanagesRepository.save(orphanage);
    
        return response.status(201).json(orphanage);
    }
};