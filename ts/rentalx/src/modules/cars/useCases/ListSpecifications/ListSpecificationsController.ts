import { Request, Response } from 'express';
import { ListSpecificationsUseCase } from './ListSpecificationsUseCase';

class ListSpecificationsController {
  constructor(private listSpecificationUseCase: ListSpecificationsUseCase) {}

  handle(request: Request, response: Response) {
    const specificationsList = this.listSpecificationUseCase.execute();

    return response.json(specificationsList);
  }
}

export { ListSpecificationsController };
