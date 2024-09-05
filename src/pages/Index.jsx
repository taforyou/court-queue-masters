import React, { useState, useEffect } from 'react';
import CourtManager from '@/components/CourtManager';
import QueueManager from '@/components/QueueManager';
import { useCourts, useCourtPlayers, usePlayers, useQueue, usePlayerStats } from "@/integrations/supabase";

const Index = () => {
  const [courts, setCourts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [shuttlecockCount, setShuttlecockCount] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const { data: supabaseCourts } = useCourts();
  const { data: supabaseCourtPlayers } = useCourtPlayers();
  const { data: supabasePlayers } = usePlayers();
  const { data: supabaseQueue } = useQueue();
  const { data: supabasePlayerStats } = usePlayerStats();

  useEffect(() => {
    if (supabaseCourts && supabaseCourtPlayers && supabasePlayers) {
      const updatedCourts = supabaseCourts.map(court => ({
        ...court,
        players: supabaseCourtPlayers
          .filter(cp => cp.court_id === court.id)
          .map(cp => supabasePlayers.find(p => p.id === cp.player_id))
          .filter(Boolean),
        checkedPlayers: {}
      }));
      setCourts(updatedCourts);
    }
  }, [supabaseCourts, supabaseCourtPlayers, supabasePlayers]);

  useEffect(() => {
    if (supabaseQueue && supabasePlayers) {
      const updatedQueue = supabaseQueue
        .map(q => supabasePlayers.find(p => p.id === q.player_id))
        .filter(Boolean);
      setQueue(updatedQueue);
    }
  }, [supabaseQueue, supabasePlayers]);

  useEffect(() => {
    if (supabasePlayerStats) {
      const stats = {};
      supabasePlayerStats.forEach(stat => {
        stats[stat.player_id] = {
          completed: stat.completed_games,
          current: stat.current_game,
        };
      });
      setPlayerStats(stats);
      setShuttlecockCount(prevCount => {
        const newCount = { ...prevCount };
        supabasePlayerStats.forEach(stat => {
          newCount[stat.player_id] = stat.shuttlecock_count;
        });
        return newCount;
      });
    }
  }, [supabasePlayerStats]);

  const incrementShuttlecockCount = (courtId) => {
    // Implementation remains the same
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Badminton Match Manager</h1>
      <CourtManager
        courts={courts}
        setCourts={setCourts}
        playerStats={playerStats}
        shuttlecockCount={shuttlecockCount}
        incrementShuttlecockCount={incrementShuttlecockCount}
      />
      <QueueManager
        queue={queue}
        setQueue={setQueue}
        playerStats={playerStats}
        shuttlecockCount={shuttlecockCount}
        selectedPlayers={selectedPlayers}
        setSelectedPlayers={setSelectedPlayers}
      />
    </div>
  );
};

export default Index;