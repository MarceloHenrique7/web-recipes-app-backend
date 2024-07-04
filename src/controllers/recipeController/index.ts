import * as createRecipe from './createMyRecipe'
import * as updateMyRecipe from './updateMyRecipe'
import * as getRecipe from './getMyRecipe'
import * as searchRecipe from './RecipeController'
import * as deleteRecipe from './deleteMyRecipe'

export const MyRecipeController = {
    ...getRecipe,
    ...createRecipe,
    ...updateMyRecipe,
    ...searchRecipe,
    ...deleteRecipe 
}