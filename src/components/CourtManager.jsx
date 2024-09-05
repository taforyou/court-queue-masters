import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Feather, PlusCircle } from "lucide-react";
import { useCourts, useCourtPlayers, useAddCourtPlayer, useDeleteCourtPlayer } from "@/integrations/supabase";

const CourtManager = ({ courts, setCourts, playerStats, shuttlecockCount, incrementShuttlecockCount }) => {
  const { data: supabaseCourts } = useCourts();
  const { data: supabaseCourtPlayers } = useCourtPlayers();
  const addCourtPlayer = useAddCourtPlayer();
  const deleteCourtPlayer = useDeleteCourtPlayer();

  const handleCheckboxChange = (courtId, playerIndex) => {
    setCourts(courts.map(court => {
      if (court.id === courtId) {
        const newCheckedPlayers = { ...court.checkedPlayers };
        newCheckedPlayers[playerIndex] = !newCheckedPlayers[playerIndex];
        return { ...court, checkedPlayers: newCheckedPlayers };
      }
      return court;
    }));
  };

  const getCheckedPlayersCount = (court) => {
    return Object.values(court.checkedPlayers).filter(Boolean).length;
  };

  const removePlayersFromCourt = async (courtId, count) => {
    const court = courts.find(c => c.id === courtId);
    let playersToRemove;
    if (count === 2) {
      const checkedIndices = Object.entries(court.checkedPlayers)
        .filter(([_, isChecked]) => isChecked)
        .map(([index]) => parseInt(index));
      playersToRemove = checkedIndices.map(index => court.players[index]);
    } else {
      playersToRemove = court.players.slice(0, count);
    }

    // Remove players from Supabase
    for (const player of playersToRemove) {
      const courtPlayerId = supabaseCourtPlayers.find(cp => cp.court_id === courtId && cp.player_id === player.id)?.id;
      if (courtPlayerId) {
        await deleteCourtPlayer.mutateAsync(courtPlayerId);
      }
    }

    // Update local state
    setCourts(prevCourts => {
      return prevCourts.map(c => {
        if (c.id === courtId) {
          return {
            ...c,
            players: c.players.filter(p => !playersToRemove.includes(p)),
            checkedPlayers: {}
          };
        }
        return c;
      });
    });
  };

  const addPlayersToCourt = async (courtId, playersToAdd) => {
    // Add players to Supabase
    for (const player of playersToAdd) {
      await addCourtPlayer.mutateAsync({ court_id: courtId, player_id: player.id });
    }

    // Update local state
    setCourts(prevCourts => prevCourts.map(c => {
      if (c.id === courtId) {
        return { ...c, players: [...c.players, ...playersToAdd] };
      }
      return c;
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {courts.map((court) => (
        <Card key={court.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">Court {court.id}</CardTitle>
            <div className="flex items-center space-x-2">
              <Feather className="h-4 w-4 text-gray-500" />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => incrementShuttlecockCount(court.id)}
                disabled={court.players.length !== 2 && court.players.length !== 4}
              >
                <PlusCircle className="h-4 w-4 text-green-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold">Current Players:</h3>
              <ul>
                {court.players.map((player, index) => (
                  <li key={index} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`player-${court.id}-${index}`}
                        checked={court.checkedPlayers[index] || false}
                        onCheckedChange={() => handleCheckboxChange(court.id, index)}
                      />
                      <label htmlFor={`player-${court.id}-${index}`}>{player.name}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-center">
                        <Feather className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">{shuttlecockCount[player.id]?.toFixed(2) || '0.00'}</span>
                      </div>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        playerStats[player.id]?.current === 2
                          ? 'bg-yellow-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {(playerStats[player.id]?.completed || 0) + (playerStats[player.id]?.current || 0)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => removePlayersFromCourt(court.id, 2)}
                disabled={getCheckedPlayersCount(court) !== 2}
                className="flex-grow sm:flex-grow-0"
              >
                Remove 2 Players
              </Button>
              <Button onClick={() => removePlayersFromCourt(court.id, 4)} className="flex-grow sm:flex-grow-0">
                Remove All Players
              </Button>
              <Button onClick={() => addPlayersToCourt(court.id, [])} className="flex-grow sm:flex-grow-0">
                Add Players from Queue
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourtManager;