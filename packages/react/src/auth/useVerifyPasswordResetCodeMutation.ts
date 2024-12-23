import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  type AuthError,
  verifyPasswordResetCode,
  type Auth,
} from "firebase/auth";

type AuthUseMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void
> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;

export function useVerifyPasswordResetCodeMutation(
  auth: Auth,
  options?: AuthUseMutationOptions<string, AuthError, string>
) {
  return useMutation<string, AuthError, string>({
    ...options,
    mutationFn: (code: string) => verifyPasswordResetCode(auth, code),
  });
}