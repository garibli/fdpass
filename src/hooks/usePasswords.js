import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export function usePasswords() {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPasswords = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setPasswords(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPasswords(); }, [fetchPasswords]);

  const addPassword = async (entry) => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('passwords')
      .insert([{ ...entry, user_id }])
      .select()
      .single();
    if (error) throw error;
    setPasswords(prev => [data, ...prev]);
    return data;
  };

  const updatePassword = async (id, updates) => {
    const { data, error } = await supabase
      .from('passwords')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setPasswords(prev => prev.map(p => p.id === id ? data : p));
    return data;
  };

  const deletePassword = async (id) => {
    const { error } = await supabase
      .from('passwords')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setPasswords(prev => prev.filter(p => p.id !== id));
  };

  return { passwords, loading, error, addPassword, updatePassword, deletePassword, refetch: fetchPasswords };
}
