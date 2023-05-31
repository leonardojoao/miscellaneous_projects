import {database} from '../database.js'

const usersController = {
  createUser(req, res) {
    const {name} = req.body
  
    if(name.length < 1) {
      return res.status(403).json({'message': 'can\'t create user without name'})
    }
    
    database.push(name)

    return res.status(201).json({'message': `registered user ${name}`})
  },

  getUsers(req, res) {
    return res.status(200).json(database)
  }
}

export { usersController }