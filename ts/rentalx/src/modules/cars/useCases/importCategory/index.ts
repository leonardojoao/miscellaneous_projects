import { ImportCategoryUseCase } from './importCategoryUseCase';
import { ImportCategoryController } from './importCategoryController';
import { CategoriesRepository } from '../../repositories/implementations/CategoriesRepository';

export default (): ImportCategoryController => {
  const categoriesRepository = new CategoriesRepository();
  const importCategoryUseCase = new ImportCategoryUseCase(categoriesRepository);
  const importCategoryController = new ImportCategoryController(
    importCategoryUseCase,
  );

  return importCategoryController;
};
