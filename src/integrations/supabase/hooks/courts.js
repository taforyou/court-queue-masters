import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### courts

| name | type | format  | required |
|------|------|---------|----------|
| id   | int8 | integer | true     |
| name | text | string  | true     |
*/

export const useCourts = () => useQuery({
    queryKey: ['courts'],
    queryFn: () => fromSupabase(supabase.from('courts').select('*')),
});

export const useAddCourt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newCourt) => fromSupabase(supabase.from('courts').insert([newCourt])),
        onSuccess: () => {
            queryClient.invalidateQueries('courts');
        },
    });
};

export const useUpdateCourt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('courts').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('courts');
        },
    });
};

export const useDeleteCourt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('courts').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('courts');
        },
    });
};