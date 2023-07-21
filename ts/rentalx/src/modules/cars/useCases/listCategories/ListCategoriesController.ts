import { Request, Response } from 'express';
import { ListCategoriesUseCase } from './ListCategoriesUseCase';

class ListCategoriesController {
  constructor(private listCategoriesUseCase: ListCategoriesUseCase) {}

  async handle(request: Request, response: Response) {
    const categoriesList = await this.listCategoriesUseCase.execute();
    return response.json(categoriesList);
  }
}

export { ListCategoriesController };
