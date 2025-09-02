import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  private oauth2Client;

  constructor() {
    console.log('CLIENT_ID:', process.env.YT_CLIENT_ID);
    console.log('CLIENT_SECRET:', process.env.YT_CLIENT_SECRET);
    console.log('REDIRECT_URI:', process.env.YT_REDIRECT_URI);

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
