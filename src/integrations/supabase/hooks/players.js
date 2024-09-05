import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) {
        if (error.code === '23505') {
            throw new Error('A player with this name already exists.');
        }
        throw new Error(error.message);
    }
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
        mutationFn: async (newPlayer) => {
            // Check if player already exists
            const { data: existingPlayers } = await supabase
                .from('players')
                .select('id')
                .eq('name', newPlayer.name)
                .limit(1);

            if (existingPlayers && existingPlayers.length > 0) {
                return existingPlayers[0];
            }

            // If player doesn't exist, insert new player
            return fromSupabase(supabase.from('players').insert([newPlayer]).select());
        },
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