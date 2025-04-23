import { Injectable } from '@nestjs/common';
import { GroupsService } from 'src/firebase/groups/groups.service';
import { FirebaseGroupData } from 'src/firebase/groups/interface/groups.interface';

@Injectable()
export class GroupsProcessorService {
  constructor(private readonly groupsService: GroupsService) {}

  async saveGroupData(data: FirebaseGroupData): Promise<void> {
    const { name, idGroup, category } = data;

    if (!name || !idGroup || !category) {
      throw new Error(
        'Todos os campos devem ser preenchidos para cadastrar um grupo!',
      );
    }

    try {
      const groups = await this.groupsService.getByIdGroupData(idGroup);

      if (groups) {
        console.warn(`Já existe um grupo cadastrado com o ID: ${idGroup}.`);
        throw new Error(`Já existe um grupo cadastrado com o ID: ${idGroup}.`);
      }

      await this.groupsService.saveGroupData(data);
      console.log(`Dados salvos com sucesso para o grupo: ${idGroup}`);
    } catch (error) {
      console.error(`Erro ao criar grupo para o ID: ${idGroup}`, error.stack);
      throw new Error(`Falha ao criar grupo para o ID: ${error.message}`);
    }
  }
}
