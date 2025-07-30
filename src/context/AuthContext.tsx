import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';

export type CustomUser = SupabaseUser & {
  name?: string;
  avatar_url?: string;
};

interface AuthContextProps {
  user: CustomUser | null;
  setAuth: (authUser: CustomUser | null) => void;
}

const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);

  // exatamente como antes: busca perfil e faz setUser()
  const hydrateProfile = async (supabaseUser: SupabaseUser) => {
    const { data: perfil, error } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', supabaseUser.id)
      .single();

    if (error || !perfil) {
      console.warn('⚠️ Erro ao buscar perfil, usando dados do auth:', error?.message);
      setUser({ ...supabaseUser });
    } else {
      setUser({
        ...supabaseUser,
        name: perfil.name,
        avatar_url: perfil.avatar_url,
      });
    }
  };

  useEffect(() => {
    // 1) Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) hydrateProfile(session.user);
    });

    // 2) Listener de mudanças de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) hydrateProfile(session.user);
        else setUser(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const setAuth = (authUser: CustomUser | null) => setUser(authUser);

  return (
    <AuthContext.Provider value={{ user, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
