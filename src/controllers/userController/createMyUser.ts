import { Request, Response } from "express";
import * as yup from 'yup'
import { validation } from "../../middleware/validation";
import { StatusCodes } from 'http-status-codes'

import { prisma } from '../../index';


interface User {
    auth0Id: string;
    email: string;
    name: string
}

export const createUserValidation = validation(getSchema =>({
    body: getSchema<User>(yup.object().shape({
        auth0Id: yup.string().required(),
        email: yup.string().required().email().min(5),
        name: yup.string().required().min(1),
    }))
}));

export const createMyUser = async (req: Request<{}, {}, User>, res: Response) => {
    try {   

        
        const UserId = req.body.auth0Id

        const existingUser = await prisma.user.findUnique({ where: {auth0Id: UserId} })
        
        if (existingUser) {
            return res.status(StatusCodes.OK).send()
        }

        const newUser = await prisma.user.create({
            data: {
                ...req.body,
                savedRecipes: []
            }
        })
        
        
        const wallet = await prisma.wallet.create({
            data: {
                userId: newUser.id,
                balance: 50.00
            },
        })

        const updatedUser = await prisma.user.update({
            where: { id: newUser.id },
            data: {
                walletId: wallet.id,
            }
        });
        
        await prisma.notification.create({
            data: {
                title: 'Thanks, for register!',
                subtitle: 'Welcome the plataform',
                description: '🎉You won 50 dollars for spend, Enjoy!🎉',
                type: "GENERAL",
                userId: newUser.id,
                recipientUserId: newUser.id,
                isGeneral: false,
            }
        })
        

        res.status(StatusCodes.CREATED).json(updatedUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Unable to create a user" })
    }

}