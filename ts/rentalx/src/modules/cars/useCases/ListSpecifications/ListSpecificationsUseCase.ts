import { Specification } from '../../entities/Specification';
import { ISpecificationsRepository } from '../../repositories/ISpecificationsRepository';

class ListSpecificationsUseCase {
  constructor(private specificationsRepository: ISpecificationsRepository) {}

  execute(): Specification[] {
    const specificationsList = this.specificationsRepository.list();

    return specificationsList;
  }
}

export { ListSpecificationsUseCase };
