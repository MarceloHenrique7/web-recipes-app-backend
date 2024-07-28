import * as createMyUser from './createUser'
import * as updateCurrentUser from './updateUser'
import * as getMyUser from './getUser'
import * as getAllUsers from './getAllUsers'
import * as deleteUser from './deleteUser'

export const myUserController = {
    ...createMyUser,
    ...updateCurrentUser,
    ...getMyUser,
    ...getAllUsers,
    ...deleteUser
}