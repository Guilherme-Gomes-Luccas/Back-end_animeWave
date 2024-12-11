import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth-guard';
import { Request, Response } from 'express';
import { User } from 'src/models/userInterface';
import { updateUserData } from 'src/models/userModel';
import { generateAccessToken } from './config/generateAccessToken';
import { generateRefreshToken } from './config/generateRefreshToken';

@Controller('auth/google')
export class LoginGoogleController {
  @UseGuards(GoogleAuthGuard)
  @Get('login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.access_token = accessToken;
    user.refresh_token = refreshToken;

    await updateUserData(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      maxAge: 3600000,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      maxAge: 3600000,
      path: '/'
    });

    res.status(200).redirect('https://front-end-anime-wave.vercel.app/home');
  }
}
