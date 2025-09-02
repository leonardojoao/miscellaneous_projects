import { Controller, Get, Query, Res } from '@nestjs/common';
import {type  Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1️⃣ Endpoint para iniciar login no Google
  @Get('google')
  async googleAuth(@Res() res: Response) {
    const url = this.authService.getAuthUrl();
    return res.redirect(url);
  }

  // 2️⃣ Callback do Google
  @Get('callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const tokens = await this.authService.getTokens(code);

      console.log('🎟️ Tokens recebidos:', tokens);

      return res.json({
        message: 'Autenticação concluída!',
        tokens,
      });
    } catch (err) {
      console.error('Erro no callback:', err);
      return res.status(400).json({ error: 'Erro ao obter tokens' });
    }
  }
}
