import { compatAuth as web3Auth } from './web3/auth';
import * as supabaseAuth from './supabase/auth';
import { USE_WEB3_AUTH } from './web3/config';

// Export auth functions that automatically use the right implementation
export const signUp = USE_WEB3_AUTH ? web3Auth.signUp : supabaseAuth.signUp;
export const signIn = USE_WEB3_AUTH ? web3Auth.signIn : supabaseAuth.signIn;
export const signOut = USE_WEB3_AUTH ? web3Auth.signOut : supabaseAuth.signOut;
export const getCurrentUser = USE_WEB3_AUTH ? web3Auth.getCurrentUser : supabaseAuth.getCurrentUser;
export const resetPassword = USE_WEB3_AUTH ? web3Auth.resetPassword : supabaseAuth.resetPassword;
export const updatePassword = USE_WEB3_AUTH ? web3Auth.updatePassword : supabaseAuth.updatePassword;