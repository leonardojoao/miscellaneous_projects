import { Category } from '../../model/Category';
import { ICategoriesRepository } from '../../repositories/ICategoriesRepository';

class ListCategoriesUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  execute(): Category[] {
    const categoriesList = this.categoriesRepository.list();

    return categoriesList;
  }
}

export { ListCategoriesUseCase };
