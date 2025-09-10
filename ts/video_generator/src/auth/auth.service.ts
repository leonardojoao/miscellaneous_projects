// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET,
      process.env.YT_REDIRECT_URI,
    );
  }

  getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/youtube.upload'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // garante refresh_token
      prompt: 'consent', // força pedir consentimento
      scope: scopes,
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens; // refresh_token estará aqui
  }
}
