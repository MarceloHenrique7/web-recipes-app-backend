
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index"

export const searchRecipe = async (req: Request, res: Response) => {
    try {
        const recipe = req.params.recipe
        const searchQuery = req.query.searchQuery as string || recipe || ""
        const selectedCategories = req.query.selectedCategories as string || ""
        const sortOption = req.query.sortOption as string || "lastUpdated"

        console.log(recipe)
        console.log(searchQuery)
        console.log(selectedCategories)
        console.log(sortOption)

        const page = parseInt(req.query.page as string) || 1

        let query: any = {
            name: {
                contains: recipe,
                mode: "insensitive",
              },
        };
        
        const recipeCheck = await prisma.recipe.count({ where: query})

        if (recipeCheck === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1,
                }
            })
        }

        console.log(selectedCategories)
        
        if(selectedCategories) {
            const categoriesArray = selectedCategories.split(",")
            query.categories = { hasEvery: categoriesArray }
            console.log(categoriesArray)
            console.log("query Categories: " + query.categories)
        }

        if (searchQuery) {
            const searchConditions = {
                OR: [
                    {
                        name: {
                            contains: searchQuery,
                            mode: "insensitive"
                        },
                    },
                    {
                        categories: {
                            has: searchQuery
                        },
                    },
                ]
            };
            query = {
                AND: [query, searchConditions]
            };
        };

        const pageSize = 10;
        const skip = (page - 1) * pageSize

        const recipes = await prisma.recipe.findMany({
            where: query,
            orderBy: {
                [sortOption]: 'asc',
            },
            skip: skip,
            take: pageSize
        })
        

        const total = await prisma.recipe.count({ where: query})

        const response = {
            data: recipes,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / pageSize)
            }
        }

        res.json(response)
    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error })
    }
}

