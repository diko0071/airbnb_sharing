'use server';

import ApiService from "../services/apiService";
import { cookies } from "next/headers";


export async function handleActivityStatus(is_verified: boolean) {
  cookies().set('user_is_verified', is_verified.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

export async function handleLogin(userId: string, accessToken: string, refreshToken: string, is_verified: boolean) {
  cookies().set('session_userid', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });

  cookies().set('session_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
    path: '/'
  });

  cookies().set('session_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  try {
    const userResponse = await ApiService.get('/api/user/data');
    cookies().set('user_is_verified', userResponse.is_active.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    cookies().set('user_is_verified', 'false', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
  }
}

export async function resetAuthCookies() {
  cookies().set('session_userid', '', { maxAge: 0, path: '/' });
  cookies().set('session_access_token', '', { maxAge: 0, path: '/' });
  cookies().set('session_refresh_token', '', { maxAge: 0, path: '/' });
  cookies().set('user_is_verified', '', { maxAge: 0, path: '/' });
}

export async function getUserId() {

  const userId = cookies().get('session_userid')?.value;
  return userId ? userId : null;
}

export async function getAccessToken() {
  let accessToken = cookies().get('session_access_token')?.value;
  return accessToken ? accessToken : null;
}

export async function getRefreshToken() {
  let refreshToken = cookies().get('session_refresh_token')?.value;
  return refreshToken ? refreshToken : null;
}

export async function getIsVerified() {
  let isVerified = cookies().get('user_is_verified')?.value;
  return isVerified ? isVerified : null;
}

export async function handleRefresh() {

  const refreshToken = await getRefreshToken();

  try {
    const response = await ApiService.post('/api/auth/token/refresh/', JSON.stringify({ refresh: refreshToken }));
    if (response.access) {
      cookies().set('session_access_token', response.access, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60,
        path: '/'
      });

      return response.access;
    } else {
      resetAuthCookies();
    }
  } catch (error) {
    resetAuthCookies();
  }

  try {
    const userResponse = await ApiService.get('/api/user/data');
    cookies().set('user_is_verified', userResponse.is_active.toString(), {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
  } catch (error) {
    return null;
  }

  return null;
}