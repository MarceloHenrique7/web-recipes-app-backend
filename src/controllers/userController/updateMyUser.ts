import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../index';

export const updateCurrentUser = async (req: Request, res: Response) => {
    
    if (req.body.authId) {
        
        const { name } = req.body;

        const user = await prisma.user.findUnique({ where: { auth0Id: req.body.authId } })

        if(user === null) {
            console.log("Esta chegando aqui, esse e o user " + user)
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not Found" })
        }
        
        const resultUser = await prisma.user.update({ where: {
            auth0Id: req.body.authId,
        }, data: {
            name: name                
        } });
        
        return res.status(StatusCodes.NO_CONTENT).send(resultUser)
    }

    try {
        const { name } = req.body

        const user = await prisma.user.findUnique({ where: { id: req.body.userId } })

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" }) // se user nao existir retornamos O Codigo 401 
        }

        await prisma.user.update({where: {
            id: req.body.userId
        }, 
        data: {
            name: name
        }})
        res.send(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Unable to update a user" })
    }

}