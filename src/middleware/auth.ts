import { NextFunction, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes';

dotenv.config()

export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
})

import { prisma } from '../index';

export const jwtParse = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if(!authorization || !authorization.startsWith("Bearer")) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" })
    }

    const accessTokenTest = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNiQVhOaEpTWWNjbmdDVUxDNEI4MCJ9.eyJpc3MiOiJodHRwczovL2Rldi1teXV2d2dwdG8za25lcTJ6LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTk3OTk3NDYyNzEwMDM4NTg5MiIsImF1ZCI6WyJ3ZWItYXBwLXJlY2lwZXMtYXBpIiwiaHR0cHM6Ly9kZXYtbXl1dndncHRvM2tuZXEyei51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzE4ODMzODY2LCJleHAiOjE3MTg5MjAyNjYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJZaTJGQmdlNXdRd20zOXBHN0FRbUFZb1VEQnNKOVdWWCJ9.s30aJGYA-N7MCFs-4U2mVSSFhIezLgK676Z9HzpWT_O2OirGquBbJm4-YGFlm88YXKRInfD7gnvZdBWUJdEUBiEjEmjZDgeSWVjXlZmmbSai1fcCYxa73jy_Cm97CIol7mm-rAPksdVIUKXn86w2RWoxQRVMr_pnS9Rsor56Qk_qp_mvX6pnItw44r1SrzxWgYExTRRF_xGd2LdAhV6EXS4d8M_WVlsLI2DFeyBQWu5NMe1N2C2pSHiOtfw-LG3VFDTm3ThQbHXALefaXPYcnjyOOkPYszOrNCk7NYGVCkwZmWB7AjFS4VjRU5VN5H9LIPXxPrsjWjFuBGHu9X_KTw'

    const token = authorization.split(' ')[1];

    if (token === accessTokenTest) {
        req.body.authId = 'id_test'
        return next()
    }

    try {
        console.log("executando o auth middlware")
        const decoded = jwt.decode(token) as jwt.JwtPayload
        const auth0Id = decoded.sub

        const user = await prisma.user.findUnique({ where: { auth0Id: auth0Id } })

        if(!user) {
            return res.sendStatus(StatusCodes.NOT_FOUND)
        }
        req.body.userId = user.id.toString()
        next()
    } catch (error) {
        console.log(error)
        return res.sendStatus(StatusCodes.UNAUTHORIZED)
    }
}



const isAdminUser = async (req: Request, res: Response) => {

    

}