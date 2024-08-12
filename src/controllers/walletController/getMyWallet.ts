
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index"

export const getMyWallet = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const wallet = await prisma.wallet.findUnique({
            where: { userId: userId }
        })

        if (!wallet) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "wallet not found" })
        }

        res.status(StatusCodes.OK).json(wallet)
    } catch (error) {
        console.log("error", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "ERROR FETCHING WALLET" })
    }
}

