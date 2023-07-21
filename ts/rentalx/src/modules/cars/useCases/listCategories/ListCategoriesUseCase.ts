import { Category } from '../../entities/Category';
import { ICategoriesRepository } from '../../repositories/ICategoriesRepository';

class ListCategoriesUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(): Promise<Category[]> {
    const categoriesList = await this.categoriesRepository.list();

    return categoriesList;
  }
}

export { ListCategoriesUseCase };
