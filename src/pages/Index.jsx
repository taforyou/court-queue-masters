import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

const Index = () => {
  const [courts, setCourts] = useState([
    { id: 1, players: [], checkedPlayers: {} },
    { id: 2, players: [], checkedPlayers: {} },
  ]);
  const [queue, setQueue] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [playerName, setPlayerName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerCountToAdd, setPlayerCountToAdd] = useState(2);

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

  const addPlayerToQueue = () => {
    if (playerName.trim() !== '') {
      setQueue([...queue, playerName]);
      setPlayerStats(prev => ({...prev, [playerName]: 0}));
      setPlayerName('');
    }
  };

  const removePlayersFromCourt = (courtId, count) => {
    setCourts(courts.map(court => {
      if (court.id === courtId) {
        let removedPlayers;
        let remainingPlayers;
        if (count === 2) {
          const checkedIndices = Object.entries(court.checkedPlayers)
            .filter(([_, isChecked]) => isChecked)
            .map(([index]) => parseInt(index));
          removedPlayers = checkedIndices.map(index => court.players[index]);
          remainingPlayers = court.players.filter((_, index) => !checkedIndices.includes(index));
        } else {
          removedPlayers = court.players.slice(0, count);
          remainingPlayers = court.players.slice(count);
        }
        setQueue(prevQueue => [...prevQueue, ...removedPlayers]);
        setPlayerStats(prev => {
          const newStats = {...prev};
          removedPlayers.forEach(player => {
            newStats[player] = (newStats[player] || 0) + 1;
          });
          return newStats;
        });
        return { ...court, players: remainingPlayers, checkedPlayers: {} };
      }
      return court;
    }));
  };

  const addPlayersToCourt = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    const availableSlots = 4 - court.players.length;
    let playersToAdd = [];

    if (selectedPlayers.length === 0) {
      // If no players are selected, use first-come-first-serve
      playersToAdd = queue.slice(0, availableSlots);
    } else {
      // Use selected players, but limit to available slots
      playersToAdd = selectedPlayers.slice(0, availableSlots);
    }

    if (playersToAdd.length > 0) {
      setCourts(courts.map(c => {
        if (c.id === courtId) {
          return { ...c, players: [...c.players, ...playersToAdd] };
        }
        return c;
      }));

      setQueue(queue.filter(player => !playersToAdd.includes(player)));
      setSelectedPlayers([]);
    }
  };

  const handlePlayerSelection = (player) => {
    setSelectedPlayers(prev => 
      prev.includes(player) 
        ? prev.filter(p => p !== player)
        : [...prev, player]
    );
  };

  const removePlayerFromQueue = (playerToRemove) => {
    setQueue(prevQueue => prevQueue.filter(player => player !== playerToRemove));
    setSelectedPlayers(prevSelected => prevSelected.filter(player => player !== playerToRemove));
    setPlayerStats(prev => {
      const newStats = {...prev};
      delete newStats[playerToRemove];
      return newStats;
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">Badminton Match Manager</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Join Queue</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="flex-grow"
          />
          <Button onClick={addPlayerToQueue}>Join Queue</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courts.map((court) => (
          <Card key={court.id}>
            <CardHeader>
              <CardTitle>Court {court.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold">Current Players:</h3>
                <ul>
                  {court.players.map((player, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`player-${court.id}-${index}`}
                        checked={court.checkedPlayers[index] || false}
                        onCheckedChange={() => handleCheckboxChange(court.id, index)}
                      />
                      <label htmlFor={`player-${court.id}-${index}`}>{player}</label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-x-2">
                <Button
                  onClick={() => removePlayersFromCourt(court.id, 2)}
                  disabled={getCheckedPlayersCount(court) !== 2}
                >
                  Remove 2 Players
                </Button>
                <Button onClick={() => removePlayersFromCourt(court.id, 4)}>
                  Remove All Players
                </Button>
                <Button onClick={() => addPlayersToCourt(court.id)}>
                  Add Players from Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Players to add:</Label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4].map((count) => (
                <Button
                  key={count}
                  variant={playerCountToAdd === count ? "default" : "outline"}
                  onClick={() => setPlayerCountToAdd(count)}
                >
                  {count} Player{count !== 1 ? 's' : ''}
                </Button>
              ))}
            </div>
          </div>
          <ul>
            {queue.map((player, index) => (
              <li key={index} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`queue-player-${index}`}
                  checked={selectedPlayers.includes(player)}
                  onCheckedChange={() => handlePlayerSelection(player)}
                />
                <label htmlFor={`queue-player-${index}`} className="flex-grow flex items-center">
                  {player}
                  <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${playerStats[player] > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {playerStats[player] || 0}
                  </span>
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
    </div>
  );
};

export default Index;
