export function setUserIdLS(id: string | null) {
  if (id) localStorage.setItem("userId", id);
  else localStorage.removeItem("userId");

  window.dispatchEvent(new CustomEvent("auth:user-changed", {
    detail: { userId: id },
  }));
}

export function getUserIdLS() {
  return localStorage.getItem("userId");
}
