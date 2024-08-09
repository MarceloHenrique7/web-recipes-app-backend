import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index"

import { Request, Response } from "express";





export const getTransactionsWallet = async (req: Request, res: Response) => {
    try {

        const { userId } = req.body;

        console.log(userId)
        const transactions = await prisma.transaction.findMany({ where: {userId: userId}, orderBy: { createdAt: 'desc' } })

        console.log(transactions)

        if (!transactions) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Transactions not Found" })
        }

        res.status(StatusCodes.OK).json(transactions)
        
    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ messag: "something went wrong" })
    }
}


