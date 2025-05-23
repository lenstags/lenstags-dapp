import { STORAGE_KEY, basicClient } from './api';
import { ethers, utils } from 'ethers';

import { refresh as refreshMutation } from './api';

export function trimString(string, length) {
  if (!string) return null;
  return string.length < length ? string : string.substr(0, length - 1) + '...';
}

export function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export async function refreshAuthToken() {
  try {
    const token = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!token) return;

    console.log('basicClient ', basicClient);
    const authData = await basicClient
      .mutation(refreshMutation, {
        refreshToken: token.refreshToken
      })
      .toPromise();

    if (!authData.data) return;

    const { accessToken, refreshToken } = authData.data.refresh;
    const exp = parseJwt(refreshToken).exp;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken,
        refreshToken,
        exp
      })
    );

    return {
      accessToken
    };
  } catch (err) {
    console.log('error:', err);
  }
}

export function getSigner() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
}

export function splitSignature(signature) {
  return utils.splitSignature(signature);
}

export function generateRandomColor() {
  let maxVal = 0xffffff; // 16777215
  let randomNumber = Math.random() * maxVal;
  randomNumber = Math.floor(randomNumber);
  randomNumber = randomNumber.toString(16);
  let randColor = randomNumber.padStart(6, 0);
  return `#${randColor.toUpperCase()}`;
}
