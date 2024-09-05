import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### player_stats

| name              | type    | format  | required |
|-------------------|---------|---------|----------|
| id                | int8    | integer | true     |
| player_id         | uuid    | string  | false    |
| completed_games   | int8    | integer | false    |
| current_game      | int8    | integer | false    |
| shuttlecock_count | numeric | number  | false    |

Foreign Key Relationships:
- player_id references players.id
*/

export const usePlayerStats = () => useQuery({
    queryKey: ['player_stats'],
    queryFn: () => fromSupabase(supabase.from('player_stats').select('*')),
});

export const useAddPlayerStat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newPlayerStat) => fromSupabase(supabase.from('player_stats').insert([newPlayerStat])),
        onSuccess: () => {
            queryClient.invalidateQueries('player_stats');
        },
    });
};

export const useUpdatePlayerStat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('player_stats').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('player_stats');
        },
    });
};

export const useDeletePlayerStat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('player_stats').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('player_stats');
        },
    });
};