import { Specification } from '../../model/Specification';
import { ISpecificationsRepository } from '../../repositories/ISpecificationsRepository';

class ListSpecificationsUseCase {
  constructor(private specificationsRepository: ISpecificationsRepository) {}

  execute(): Specification[] {
    console.log('Auiii');
    const specificationsList = this.specificationsRepository.list();
    console.log('Auiii', specificationsList);

    return specificationsList;
  }
}

export { ListSpecificationsUseCase };
