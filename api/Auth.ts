import { AuthResponse } from "@/types/game";
import apiClient from "./apiClient";

export async function registerUser(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await apiClient.post("users/register", {
    username,
    password,
  });

  return res.data;
}

export async function loginUser(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await apiClient.post("/users/login", {
    username,
    password,
  });

  return res.data;
}
