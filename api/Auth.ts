import apiClient from "./apiClient";

export interface AuthResponse {
  message: string;
  user: {
    user_id: string;
    username: string;
  };
  token: string;
}

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
