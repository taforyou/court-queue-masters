import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Feather } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePlayers, useAddPlayer, useQueue, useAddToQueue, useDeleteFromQueue } from "@/integrations/supabase";

const QueueManager = ({ queue, setQueue, playerStats, shuttlecockCount, selectedPlayers, setSelectedPlayers }) => {
  const [playerName, setPlayerName] = React.useState('');
  const { toast } = useToast();
  const { data: supabasePlayers } = usePlayers();
  const addPlayer = useAddPlayer();
  const { data: supabaseQueue } = useQueue();
  const addToQueue = useAddToQueue();
  const deleteFromQueue = useDeleteFromQueue();

  const addPlayerToQueue = async () => {
    if (playerName.trim().length >= 2) {
      // Add player to Supabase
      const { data: newPlayer } = await addPlayer.mutateAsync({ name: playerName });
      await addToQueue.mutateAsync({ player_id: newPlayer[0].id });

      // Update local state
      setQueue(prevQueue => [...prevQueue, { id: newPlayer[0].id, name: playerName }]);
      setPlayerName('');
    } else {
      toast({
        title: "Invalid Name",
        description: "Name must be at least 2 characters long.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addPlayerToQueue();
    }
  };

  const handlePlayerSelection = (player) => {
    setSelectedPlayers(prev => 
      prev.includes(player) 
        ? prev.filter(p => p !== player)
        : [...prev, player]
    );
  };

  const removePlayerFromQueue = async (playerToRemove) => {
    // Remove from Supabase
    const queueItemId = supabaseQueue.find(q => q.player_id === playerToRemove.id)?.id;
    if (queueItemId) {
      await deleteFromQueue.mutateAsync(queueItemId);
    }

    // Update local state
    setQueue(prevQueue => prevQueue.filter(player => player.id !== playerToRemove.id));
    setSelectedPlayers(prevSelected => prevSelected.filter(player => player.id !== playerToRemove.id));
  };

  return (
    <Card className="mt-6 sm:mt-8">
      <CardHeader>
        <CardTitle>Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter player name (min 2 characters)"
              className="flex-grow"
            />
            <Button onClick={addPlayerToQueue} disabled={playerName.trim().length < 2} className="w-full sm:w-auto">Add to Queue</Button>
          </div>
        </div>
        <ul className="space-y-2">
          {queue.map((player, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`queue-player-${index}`}
                checked={selectedPlayers.includes(player)}
                onCheckedChange={() => handlePlayerSelection(player)}
              />
              <label htmlFor={`queue-player-${index}`} className="flex-grow flex items-center justify-between">
                <span>{player.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-center">
                    <Feather className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500">{shuttlecockCount[player.id] || 0}</span>
                  </div>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                    playerStats[player.id]?.current > 0
                      ? 'bg-blue-500 text-white'
                      : playerStats[player.id]?.completed > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {playerStats[player.id]?.completed || 0}
                  </span>
                </div>
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePlayerFromQueue(player)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QueueManager;