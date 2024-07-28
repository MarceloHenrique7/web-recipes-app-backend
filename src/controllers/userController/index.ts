import * as createMyUser from './createMyUser'
import * as updateCurrentUser from './updateMyUser'
import * as getMyUser from './getMyUser'
import * as getAllUsers from './getAllUsers'

export const myUserController = {
    ...createMyUser,
    ...updateCurrentUser,
    ...getMyUser,
    ...getAllUsers
}