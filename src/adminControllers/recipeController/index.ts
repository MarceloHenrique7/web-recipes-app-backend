import * as createRecipe from './createRecipe'
import * as updateMyRecipe from './updateRecipe'
import * as getRecipe from './getRecipe'
import * as searchRecipe from './RecipeController'
import * as deleteRecipe from './deleteRecipe'

export const MyRecipeController = {
    ...getRecipe,
    ...createRecipe,
    ...updateMyRecipe,
    ...searchRecipe,
    ...deleteRecipe 
}