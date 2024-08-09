import { testServer } from "../jest.setup";
import { StatusCodes } from "http-status-codes";

describe('UPDATE - Users', () => {

    const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNiQVhOaEpTWWNjbmdDVUxDNEI4MCJ9.eyJpc3MiOiJodHRwczovL2Rldi1teXV2d2dwdG8za25lcTJ6LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTk3OTk3NDYyNzEwMDM4NTg5MiIsImF1ZCI6WyJ3ZWItYXBwLXJlY2lwZXMtYXBpIiwiaHR0cHM6Ly9kZXYtbXl1dndncHRvM2tuZXEyei51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzE4ODMzODY2LCJleHAiOjE3MTg5MjAyNjYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJZaTJGQmdlNXdRd20zOXBHN0FRbUFZb1VEQnNKOVdWWCJ9.s30aJGYA-N7MCFs-4U2mVSSFhIezLgK676Z9HzpWT_O2OirGquBbJm4-YGFlm88YXKRInfD7gnvZdBWUJdEUBiEjEmjZDgeSWVjXlZmmbSai1fcCYxa73jy_Cm97CIol7mm-rAPksdVIUKXn86w2RWoxQRVMr_pnS9Rsor56Qk_qp_mvX6pnItw44r1SrzxWgYExTRRF_xGd2LdAhV6EXS4d8M_WVlsLI2DFeyBQWu5NMe1N2C2pSHiOtfw-LG3VFDTm3ThQbHXALefaXPYcnjyOOkPYszOrNCk7NYGVCkwZmWB7AjFS4VjRU5VN5H9LIPXxPrsjWjFuBGHu9X_KTw'
    const id_of_test = 'id_of_test'
    beforeAll( async () => {
        await testServer
        .post('/api/my/user')
        .send({ authId: "id_of_test" , email: "testjest@gmail.com", name: "Testjest1" })
    });

    it('Update My User', async () => {
        const res = await testServer
        .put(`/api/my/user/${id_of_test}`)
        .set({authorization: `Bearer ${accessToken}`})
        .send({ name: "new_Test2" })

        expect(res.statusCode).toEqual(StatusCodes.NO_CONTENT)
    })
    
    it('Update My User without AUTHORIZATION', async () => {
        const res = await testServer
        .put(`/api/my/user/${id_of_test}`)
        .send({ name: "new_Test2" })

        expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
    });


})

