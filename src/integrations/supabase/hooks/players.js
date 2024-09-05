import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### players

| name       | type                     | format  | required |
|------------|--------------------------|---------|----------|
| id         | uuid                     | string  | true     |
| name       | text                     | string  | true     |
| created_at | timestamp with time zone | string  | false    |
*/

export const usePlayers = () => useQuery({
    queryKey: ['players'],
    queryFn: () => fromSupabase(supabase.from('players').select('*')),
});

export const useAddPlayer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newPlayer) => fromSupabase(supabase.from('players').insert([newPlayer])),
        onSuccess: () => {
            queryClient.invalidateQueries('players');
        },
    });
};

export const useUpdatePlayer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('players').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('players');
        },
    });
};

export const useDeletePlayer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('players').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('players');
        },
    });
};