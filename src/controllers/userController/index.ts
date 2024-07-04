import * as createMyUser from './createMyUser'
import * as updateCurrentUser from './updateMyUser'
import * as getMyUser from './getMyUser'

export const myUserController = {
    ...createMyUser,
    ...updateCurrentUser,
    ...getMyUser,
}