import { supabase } from '@/src/lib/supabase';

export async function guardarRelato(userId: string, relatoId: string) {
  const { data, error } = await supabase
    .from('relatos_guardados')
    .insert({ user_id: userId, relato_id: relatoId });

  if (error) {
    console.error('Erro ao guardar relato:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function buscarRelatosGuardados(userId: string) {
  const { data, error } = await supabase
    .from('relatos_guardados')
    .select(`
      id,
      created_at,
      relato:relatos (
        id,
        title,
        season,
        month,
        emojiseason,
        countries,
        locations,
        created_at,
        users (
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar relatos guardados:', error.message);
    return [];
  }

  return data;
}

export async function removerRelatoGuardado(userId: string, relatoId: string) {
  const { error } = await supabase
    .from('relatos_guardados')
    .delete()
    .eq('user_id', userId)
    .eq('relato_id', relatoId);

  if (error) {
    console.error('Erro ao remover relato guardado:', error.message);
    return { success: false, error };
  }

  return { success: true };
}

