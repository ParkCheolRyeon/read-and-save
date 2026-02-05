const AUTH_KEY = "auth";

export function validateCredentials(id: string, password: string): boolean {
  return id === "pcr" && password === "1q2w3e4r!@#";
}

export function setAuth(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_KEY, "ok");
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "ok";
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_KEY);
  }
}
