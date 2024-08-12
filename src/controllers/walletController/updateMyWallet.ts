
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index"

export const updateMyWallet = async (req: Request, res: Response) => {
    try {
        const { userId, value, type } = req.body;

        console.log(req.body)

        const wallet = await prisma.wallet.findUnique({
            where: { userId: userId }
        })

        if (!wallet) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "wallet not found" })
        }

        if (!type || !value || !userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "all properties is required" })
        }



        if (type === 'TRANSFER') {
            console.log("caiu aqui")

            const { email } = req.body;

            // Procuramos pelo user que vai RECEBER o dinheiro da TRANSFERÊNCIA, pelo email
            const userReceiver = await prisma.user.findUnique({
                where: { email: email }
            })

            // Procuramos pelo user que vai ENVIAR o dinheiro da TRANSFERÊNCIA, pelo userId
            const userSendCash = await prisma.user.findUnique({
                where: { id: userId }
            })

            
            // Verificamos se ambos foram encontrados no banco de dados
            if (!userSendCash || !userReceiver) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "NOT FOUND USER" })
            }


            console.log("USER RECIPIENT", userReceiver)

            // Procuramos pela wallet do user que vai RECEBER o dinheiro da TRANSFERÊNCIA
            const walletUserReceiver = await prisma.wallet.findUnique({
                where: {
                    userId: userReceiver?.id
                }
            })

            // Procuramos pela wallet do user que vai ENVIAR o dinheiro da TRANSFERÊNCIA
            const walletUserSendCash = await prisma.wallet.findUnique({
                where: {
                    userId: userSendCash?.id
                }
            })

            // Verificamos se ambas wallet foram encontrados no banco de dados
            if (!walletUserReceiver || !walletUserSendCash) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "NOT FOUND WALLET" })
            }

            const curWalletUserSendCash = walletUserSendCash?.balance as number
            const curWalletUserReceiver = walletUserReceiver?.balance  as number

            /* verificamos se o saldo do usuário que está ENVIANDO
                o dinheiro não é menor que o valor que está tentando enviar
            */
            if (curWalletUserSendCash < value) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "BALANCE INSUFFICIENT" })
            }


            // Precisamos criar transações para ambos usuários
            const transactionUserReceiver = await prisma.transaction.create({
                data: {
                    amount: value,
                    status: "success",
                    currency: "usd",
                    method: "wallet",
                    transactionType: type,
                    userId: userReceiver?.id,
                    recipientUserId: userId || '',
                    walletId: wallet.id,
                    direction: "INBOUND"
                }
            })

            const transactionUserSend = await prisma.transaction.create({
                data: {
                    amount: value,
                    status: "success",
                    currency: "usd",
                    method: "wallet",
                    transactionType: type,
                    userId: userId,
                    recipientUserId: userReceiver?.id || '',
                    walletId: wallet.id,
                    direction: "OUTBOUND"
                }
            })

            if (!transactionUserReceiver || !transactionUserSend) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Unable create a transaction" })
            }

            // atualizando wallet do usuário que está ENVIANDO o dinheiro
            await prisma.wallet.update({
                where: { id: walletUserSendCash?.id },
                data: {
                    balance: curWalletUserSendCash - value
                }
            })

            // atualizando wallet do usuário que está RECEBENDO o dinheiro
            await prisma.wallet.update({
                where: { id: walletUserReceiver?.id },
                data: {
                    balance: curWalletUserReceiver + value
                }
            })



            return res.status(StatusCodes.OK).json({ message: "Tranfer is success" })
        }

        if (type === 'DEPOSIT' || type === 'WITHDRAW') {
            if (type === 'DEPOSIT') {
                const currentBalance = wallet.balance
    
                console.log(value)
        
                await prisma.wallet.update({
                    where: { id: wallet?.id },
                    data: {
                        balance: parseFloat(currentBalance + value.value)
                    }
                })
            }
    
            if (type === 'WITHDRAW') {
                const currentBalance = wallet.balance 
    
                console.log("WITHDRAW")
        
                await prisma.wallet.update({
                    where: { id: wallet?.id },
                    data: {
                        balance: currentBalance - value.value
                    }
                })
            }
    
            const transaction = await prisma.transaction.create({
                data: {
                    amount: value.value,
                    status: "success",
                    currency: "usd",
                    method: "wallet",
                    transactionType: type,
                    userId: userId,
                    walletId: wallet?.id
                }
            })
    
            if (!transaction) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: "ERROR FETCHING TRANSACTION" })
            }
    
            return res.status(StatusCodes.CREATED).json(wallet) 
        }

    } catch (error) {
        console.log("error", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "ERROR FETCHING WALLET" })
    }
}

