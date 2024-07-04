import supertest from "supertest";
import { app } from "../src";
import { prisma } from "../src";

beforeAll(async () => {
    await prisma.$connect()
})


afterAll(async () => {
    const user = await prisma.user.findUnique({ where: {auth0Id: "id_of_test"} })
    
    if (user) {
        await prisma.user.delete({ where: { auth0Id: "id_of_test" } })
    }
    await prisma.$disconnect()
})

export const testServer = supertest(app);