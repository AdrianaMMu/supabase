// src/types.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

export type Category = {
  title: string;
  content: string;
  images: string[]; 
  visible: boolean;
  fixed: boolean;
};

export type Relato = {
  id: string;
  title: string;
  countries: { code: string; name: string }[];
  month?: string;
  season?: string;
  emojiseason?: string;
  child_ages: number[];
  locations: string[];
  categories: Record<string, Category>;
  categories_order: string[];
  visibility: Record<string, boolean>;
  user_id: string;
  created_at: string;
  resumo_image?: string;
  images?: string[]; 
  view_count?: number;      // ← adicione aqui
};

export type CustomUser = SupabaseUser & {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  premium?: boolean;
};

export type RelatoFeed = {
  id: string;
  title: string;
  countries: { code: string; name: string }[];
  month?: string;
  season?: string;
  emojiseason?: string;
  locations?: string[];
  created_at: string;
  user: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
};

export type RelatoGuardado = {
  id: string;
  user_id: string;
  relato_id: string;
  created_at: string;
};

export type RelatoComAutor = Relato & {
  user: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
  // view_count já vem de Relato, não precisa repetir aqui
};
