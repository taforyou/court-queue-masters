import { supabase } from './supabase.js';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth.jsx';

import {
  useCourtPlayers,
  useAddCourtPlayer,
  useUpdateCourtPlayer,
  useDeleteCourtPlayer
} from './hooks/court_players.js';

import {
  useCourts,
  useAddCourt,
  useUpdateCourt,
  useDeleteCourt
} from './hooks/courts.js';

import {
  usePlayerStats,
  useAddPlayerStat,
  useUpdatePlayerStat,
  useDeletePlayerStat
} from './hooks/player_stats.js';

import {
  usePlayers,
  useAddPlayer,
  useUpdatePlayer,
  useDeletePlayer
} from './hooks/players.js';

import {
  useQueue,
  useAddToQueue,
  useUpdateQueueItem,
  useDeleteFromQueue
} from './hooks/queue.js';

export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  useCourtPlayers,
  useAddCourtPlayer,
  useUpdateCourtPlayer,
  useDeleteCourtPlayer,
  useCourts,
  useAddCourt,
  useUpdateCourt,
  useDeleteCourt,
  usePlayerStats,
  useAddPlayerStat,
  useUpdatePlayerStat,
  useDeletePlayerStat,
  usePlayers,
  useAddPlayer,
  useUpdatePlayer,
  useDeletePlayer,
  useQueue,
  useAddToQueue,
  useUpdateQueueItem,
  useDeleteFromQueue
};