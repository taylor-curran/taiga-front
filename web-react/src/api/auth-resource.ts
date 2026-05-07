/**
 * Auth resource module.
 *
 * Mirrors the HTTP surface of `app/coffee/modules/auth.coffee` and the
 * register/recover/verify endpoints exposed by the Taiga REST API.
 */
import { getJson, postJson } from "./client";
import {
  AuthenticatedUser,
  ChangePasswordFromRecoveryPayload,
  LoginPayload,
  PasswordRecoveryPayload,
  RegisterPayload,
  User,
} from "./types";
import { resolveUrl } from "./urls";

export const authResource = {
  login(payload: LoginPayload): Promise<AuthenticatedUser> {
    return postJson<AuthenticatedUser, LoginPayload>(resolveUrl("auth"), {
      type: payload.type ?? "normal",
      ...payload,
    });
  },

  register(
    payload: RegisterPayload,
    type: "public" | "private" = "public",
  ): Promise<AuthenticatedUser> {
    return postJson<AuthenticatedUser, RegisterPayload>(
      resolveUrl("auth-register"),
      { ...payload, type },
    );
  },

  refresh(refresh: string): Promise<{ auth_token: string; refresh: string }> {
    return postJson<
      { auth_token: string; refresh: string },
      { refresh: string }
    >(resolveUrl("refresh"), { refresh });
  },

  forgotPassword(payload: PasswordRecoveryPayload): Promise<void> {
    return postJson<void, PasswordRecoveryPayload>(
      resolveUrl("users-password-recovery"),
      payload,
    );
  },

  changePasswordFromRecovery(
    payload: ChangePasswordFromRecoveryPayload,
  ): Promise<void> {
    return postJson<void, ChangePasswordFromRecoveryPayload>(
      resolveUrl("users-change-password-from-recovery"),
      payload,
    );
  },

  changePassword(payload: {
    current_password?: string;
    password: string;
  }): Promise<void> {
    return postJson(resolveUrl("users-change-password"), payload);
  },

  changeEmail(payload: { email_token: string }): Promise<void> {
    return postJson(resolveUrl("users-change-email"), payload);
  },

  cancelAccount(payload: { cancel_token: string }): Promise<void> {
    return postJson(resolveUrl("users-cancel-account"), payload);
  },

  exportProfile(): Promise<unknown> {
    return postJson(resolveUrl("users-export"));
  },

  sendVerificationEmail(): Promise<void> {
    return postJson(resolveUrl("user-send-verification-email"));
  },

  getMe(): Promise<User> {
    return getJson<User>(resolveUrl("user-me"));
  },

  getInvitation(token: string): Promise<unknown> {
    return getJson(`${resolveUrl("invitations")}/${token}`);
  },
};
