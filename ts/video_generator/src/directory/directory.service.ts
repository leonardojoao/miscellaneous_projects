// src/directory/directory.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DirectoryService {
  private readonly basePath = path.join(__dirname, '..', '..', 'products');

  /**
   * Cria diretórios para todos os dias do mês/ano informado.
   * Exemplo: (9, 2025) => product-01-09-25 ... product-30-09-25
   *
   * @param month Mês em número (1–12)
   * @param year Ano (ex: 2025)
   * @returns Lista de diretórios criados
   */
  createDirectoriesForMonthAndYear(month: number, year: number): string[] {
    if (month < 1 || month > 12) {
      throw new Error('Mês inválido. Use um número de 1 a 12.');
    }

    const createdDirs: string[] = [];

    // Quantidade de dias no mês informado
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const MM = String(month).padStart(2, '0');
      const yy = String(year).slice(-2);

      const dirName = `product-${dd}-${MM}-${yy}`;
      const dirPath = path.join(this.basePath, dirName);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        createdDirs.push(dirPath);
      }
    }

    return createdDirs;
  }
}
