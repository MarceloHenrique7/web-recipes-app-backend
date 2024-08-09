import { testServer } from "../jest.setup";
import { StatusCodes } from "http-status-codes";

describe('User - Create', () => {
    
    it('Create a new USER', async () => {
        const result = await testServer
        .post('/api/my/user')
        .send({ auth0Id: "id_of_test" , email: "testjest@gmail.com", name: "Testjest1" })

        expect(result.statusCode).toEqual(StatusCodes.CREATED)
        expect(typeof result.body).toEqual("object")
    })

    it('Create a new user without AUTH0ID', async () => {
        const result = await testServer
        .post('/api/my/user')
        .set({ Authorization: `Bearer ` })
        .send({ email: "testjest@gmail.com", name: "Testjest1" })

        expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(typeof result.body).toEqual('object')
        expect(result.body).toHaveProperty('errors.body.auth0Id')
    });

    it('Create a new user without EMAIL', async () => {
        const result = await testServer
        .post('/api/my/user')
        .set({ Authorization: `Bearer ` })
        .send({ auth0Id: "id_of_test" , name: "Testjest1" })

        expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(typeof result.body).toEqual('object')
        expect(result.body).toHaveProperty('errors.body.email')
    });

    it('Create a new user without NAME', async () => {
        const result = await testServer
        .post('/api/my/user')
        .set({ Authorization: `Bearer ` })
        .send({ auth0Id: "id_of_test" , email: "testjest@gmail.com"})

        expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(typeof result.body).toEqual('object')
        expect(result.body).toHaveProperty('errors.body.name')
    });

    it('Create a new user without NAME', async () => {
        const result = await testServer
        .post('/api/my/user')
        .set({ Authorization: `Bearer ` })
        .send({ auth0Id: "id_of_test" , email: "testjest@gmail.com"})

        expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(typeof result.body).toEqual('object')
        expect(result.body).toHaveProperty('errors.body.name')
    });

        it('Create a new USER with EMAIL wrong', async () => {
        const result = await testServer
        .post('/api/my/user')
        .send({ auth0Id: "id_of_test" , email: "testjest", name: "Testjest1" })

        expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(typeof result.body).toEqual("object")
        expect(result.body).toHaveProperty('errors.body.email')
    });

})