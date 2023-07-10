import { Request, Response } from 'express';
import { ListSpecificationsUseCase } from './ListSpecificationsUseCase';

class ListSpecificationsController {
  constructor(private listSpecificationUseCase: ListSpecificationsUseCase) {}

  handle(request: Request, response: Response) {
    const specificationsList = this.listSpecificationUseCase.execute();
    console.log(specificationsList);
    return response.json(specificationsList);
  }
}

export { ListSpecificationsController };
