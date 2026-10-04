import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    try {
      const list = await api.listUsers();
      const map = {};
      (Array.isArray(list) ? list : []).forEach((u) => {
        map[u.id] = {
          id: u.id,
          name: u.name,
          email: u.email,
          color: u.color,
          role: u.role,
          avatarUrl: u.avatar || null,
        };
      });
      setUsers(map);
    } catch {
      /* ignore when not authenticated */
    }
  }, []);

  // بازیابی نشست از توکن ذخیره‌شده
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.me();
        if (cancelled) return;
        setCurrentUser({
          id: me.id,
          name: me.name,
          email: me.email,
          color: me.color,
          role: me.role,
          avatarUrl: me.avatar || null,
        });
        await refreshUsers();
      } catch {
        setToken(null);
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [refreshUsers]);

  async function login(email, password) {
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      const u = data.user;
      setCurrentUser({
        id: u.id,
        name: u.name,
        email: u.email,
        color: u.color,
        role: u.role,
        avatarUrl: u.avatar || null,
      });
      await refreshUsers();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || "ورود ناموفق بود." };
    }
  }

  async function signup({ name, email, password }) {
    try {
      const data = await api.register({ name, email, password });
      setToken(data.token);
      const u = data.user;
      setCurrentUser({
        id: u.id,
        name: u.name,
        email: u.email,
        color: u.color,
        role: u.role,
        avatarUrl: u.avatar || null,
      });
      await refreshUsers();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || "ثبت‌نام ناموفق بود." };
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setToken(null);
    setCurrentUser(null);
    setUsers({});
  }

  async function updateUserRole(id, role) {
    try {
      const u = await api.updateRole(id, role);
      setUsers((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          role: u.role,
        },
      }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function updateProfile(patch) {
    if (!currentUser) return { ok: false, error: "وارد نشده‌اید." };
    try {
      // بک‌اند فیلد avatar می‌گیرد نه avatarUrl
      const body = {};
      if (patch.name !== undefined) body.name = patch.name;
      if (patch.color !== undefined) body.color = patch.color;
      if (patch.avatarUrl !== undefined) body.avatar = patch.avatarUrl;
      const u = await api.updateMe(body);
      const next = {
        id: u.id,
        name: u.name,
        email: u.email,
        color: u.color,
        role: u.role,
        avatarUrl: u.avatar || null,
      };
      setCurrentUser(next);
      setUsers((prev) => ({ ...prev, [u.id]: next }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      await api.changePassword({ currentPassword, newPassword });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function inviteMember({ name, email, role }) {
    try {
      const data = await api.inviteUser({ name, email, role });
      const u = data.user;
      setUsers((prev) => ({
        ...prev,
        [u.id]: {
          id: u.id,
          name: u.name,
          email: u.email,
          color: u.color,
          role: u.role,
          avatarUrl: u.avatar || null,
        },
      }));
      return { ok: true, tempPassword: data.tempPassword };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // برای دمو: ورود سریع با ایمیل‌های seed (رمز 1234)
  async function loginAsDemo(email) {
    return login(email, "1234");
  }

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "Vazirmatn, sans-serif" }}>
        در حال بارگذاری…
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        login,
        signup,
        logout,
        updateUserRole,
        updateProfile,
        changePassword,
        inviteMember,
        loginAsDemo,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth باید داخل AuthProvider باشد.");
  return ctx;
}
