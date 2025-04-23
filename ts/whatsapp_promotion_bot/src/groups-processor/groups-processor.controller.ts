import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GroupsProcessorService } from './groups-processor.service';
import { FirebaseGroupData } from 'src/firebase/groups/interface/groups.interface';

@Controller('groups-processor')
export class GroupsProcessorController {
  constructor(
    private readonly groupsProcessorService: GroupsProcessorService,
  ) {}

  @Post()
  async createGroupProcessor(
    @Body() groupProcessorData: FirebaseGroupData,
  ): Promise<{ message: string }> {
    try {
      await this.groupsProcessorService.saveGroupData(groupProcessorData);
      return { message: 'Grupo criado com sucesso!' };
    } catch (error) {
      console.error('Erro ao processar o grupo', error.stack);

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('batch')
  async createGroupProcessorBatch(
    @Body() groupProcessorData: FirebaseGroupData[],
  ): Promise<{ message: string; errors?: string[] }> {
    const errors: string[] = [];

    for (const group of groupProcessorData) {
      try {
        await this.groupsProcessorService.saveGroupData(group);
      } catch (error) {
        console.error(
          `Erro no grupo com idGroup "${group.idGroup}": ${error.message}`,
        );
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      return {
        message: 'Processamento parcial concluido com erros!',
        errors,
      };
    }

    return { message: 'Grupos criados com sucesso!' };
  }
}
