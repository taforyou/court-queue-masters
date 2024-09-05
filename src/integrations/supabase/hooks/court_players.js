import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### court_players

| name      | type                     | format   | required |
|-----------|--------------------------|----------|----------|
| id        | int8                     | integer  | true     |
| court_id  | int8                     | integer  | false    |
| player_id | uuid                     | string   | false    |
| joined_at | timestamp with time zone | string   | false    |

Foreign Key Relationships:
- court_id references courts.id
- player_id references players.id
*/

export const useCourtPlayers = () => useQuery({
    queryKey: ['court_players'],
    queryFn: () => fromSupabase(supabase.from('court_players').select('*')),
});

export const useAddCourtPlayer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newCourtPlayer) => fromSupabase(supabase.from('court_players').insert([newCourtPlayer])),
        onSuccess: () => {
            queryClient.invalidateQueries('court_players');
        },
    });
};

export const useUpdateCourtPlayer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('court_players').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('court_players');
        },
    });
};

export const useDeleteCourtPlayer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('court_players').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('court_players');
        },
    });
};