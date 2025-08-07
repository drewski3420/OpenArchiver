import { Request, Response } from 'express';
import { StorageService } from '../../services/StorageService';
import { randomUUID } from 'crypto';
import busboy from 'busboy';

export const uploadFile = async (req: Request, res: Response) => {
    const storage = new StorageService();
    const bb = busboy({ headers: req.headers });
    let filePath = '';
    let originalFilename = '';

    bb.on('file', (fieldname, file, filename) => {
        originalFilename = filename.filename;
        const uuid = randomUUID();
        filePath = `temp/${uuid}-${originalFilename}`;
        storage.put(filePath, file);
    });

    bb.on('finish', () => {
        res.json({ filePath });
    });

    req.pipe(bb);
};
