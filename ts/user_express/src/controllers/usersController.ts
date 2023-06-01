import { Request, Response } from 'express'
import {database} from '../database.ts'

export class UsersController {
  createUser(req: Request, res: Response): Response {
    const {name}: {name: String} = req.body

    if(name.length < 1) {
      return res.status(403).json({'message': 'can\'t create user without name'})
    }
    
    database.push(name)

    return res.status(201).json({'message': `registered user ${name}`})
  }

  getUsers(req: Request, res: Response) {
    return res.status(200).json(database)
  }
}
