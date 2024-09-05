import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### queue

| name      | type                     | format  | required |
|-----------|--------------------------|---------|----------|
| id        | int8                     | integer | true     |
| player_id | uuid                     | string  | false    |
| joined_at | timestamp with time zone | string  | false    |

Foreign Key Relationships:
- player_id references players.id
*/

export const useQueue = () => useQuery({
    queryKey: ['queue'],
    queryFn: () => fromSupabase(supabase.from('queue').select('*')),
});

export const useAddToQueue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newQueueItem) => fromSupabase(supabase.from('queue').insert([newQueueItem])),
        onSuccess: () => {
            queryClient.invalidateQueries('queue');
        },
    });
};

export const useUpdateQueueItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('queue').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('queue');
        },
    });
};

export const useDeleteFromQueue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('queue').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('queue');
        },
    });
};