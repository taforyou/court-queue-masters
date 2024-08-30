import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Feather } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [courts, setCourts] = useState([
    { id: 1, players: [], checkedPlayers: {} },
    { id: 2, players: [], checkedPlayers: {} },
  ]);
  const [queue, setQueue] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [playerName, setPlayerName] = useState('');
  const [playerTimestamps, setPlayerTimestamps] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const { toast } = useToast();

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

  const sortQueue = (updatedQueue, currentPlayerStats, currentPlayerTimestamps) => {
    return updatedQueue.sort((a, b) => {
      const statsA = currentPlayerStats[a]?.completed || 0;
      const statsB = currentPlayerStats[b]?.completed || 0;
      if (statsA === 0 && statsB === 0) {
        return currentPlayerTimestamps[a] - currentPlayerTimestamps[b];
      }
      if (statsA === 0) return -1;
      if (statsB === 0) return 1;
      if (statsA !== statsB) {
        return statsA - statsB;
      }
      return currentPlayerTimestamps[a] - currentPlayerTimestamps[b];
    });
  };

  const updateQueueAndSort = (updatedQueue, currentPlayerStats, currentPlayerTimestamps) => {
    const sortedQueue = sortQueue(updatedQueue, currentPlayerStats, currentPlayerTimestamps);
    setQueue(sortedQueue);
  };

  const addPlayerToQueue = () => {
    if (playerName.trim().length >= 2) {
      const timestamp = Date.now();
      setPlayerTimestamps(prev => {
        const updatedTimestamps = {...prev, [playerName]: timestamp};
        setPlayerStats(prevStats => {
          const updatedStats = {...prevStats, [playerName]: { completed: 0, current: 0 }};
          setQueue(prevQueue => {
            const updatedQueue = [...prevQueue, playerName];
            updateQueueAndSort(updatedQueue, updatedStats, updatedTimestamps);
            return updatedQueue;
          });
          return updatedStats;
        });
        return updatedTimestamps;
      });
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

  const removePlayersFromCourt = (courtId, count) => {
    setCourts(prevCourts => {
      const updatedCourts = prevCourts.map(court => {
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

          const currentTime = Date.now();

          setPlayerStats(prev => {
            const newStats = {...prev};
            // Update stats for all players on the court
            court.players.forEach(player => {
              newStats[player] = {
                completed: (newStats[player]?.completed || 0) + 1,
                current: 0
              };
            });
            // Set current to 1 for remaining players
            remainingPlayers.forEach(player => {
              newStats[player].current = 1;
            });
            return newStats;
          });

          setPlayerTimestamps(prev => {
            const newTimestamps = {...prev};
            removedPlayers.forEach((player, index) => {
              newTimestamps[player] = currentTime + index;
            });
            return newTimestamps;
          });

          setQueue(prevQueue => {
            const updatedQueue = [...prevQueue, ...removedPlayers];
            setPlayerStats(latestPlayerStats => {
              setPlayerTimestamps(latestPlayerTimestamps => {
                updateQueueAndSort(updatedQueue, latestPlayerStats, latestPlayerTimestamps);
                return latestPlayerTimestamps;
              });
              return latestPlayerStats;
            });
            return updatedQueue;
          });

          return { ...court, players: remainingPlayers, checkedPlayers: {} };
        }
        return court;
      });

      return updatedCourts;
    });
  };

  const addPlayersToCourt = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    const availableSlots = 4 - court.players.length;
    let playersToAdd = [];

    if (selectedPlayers.length === 0) {
      playersToAdd = queue.slice(0, availableSlots);
    } else {
      playersToAdd = selectedPlayers.slice(0, availableSlots);
    }

    if (playersToAdd.length > 0) {
      setCourts(prevCourts => prevCourts.map(c => {
        if (c.id === courtId) {
          return { ...c, players: [...c.players, ...playersToAdd] };
        }
        return c;
      }));

      setPlayerStats(prevStats => {
        const newStats = {...prevStats};
        playersToAdd.forEach(player => {
          newStats[player] = {
            ...newStats[player],
            current: 1
          };
        });
        return newStats;
      });

      setQueue(prevQueue => {
        const updatedQueue = prevQueue.filter(player => !playersToAdd.includes(player));
        setPlayerStats(latestPlayerStats => {
          setPlayerTimestamps(latestPlayerTimestamps => {
            updateQueueAndSort(updatedQueue, latestPlayerStats, latestPlayerTimestamps);
            return latestPlayerTimestamps;
          });
          return latestPlayerStats;
        });
        return updatedQueue;
      });
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
    setQueue(prevQueue => {
      const updatedQueue = prevQueue.filter(player => player !== playerToRemove);
      setPlayerStats(prevStats => {
        const newStats = {...prevStats};
        delete newStats[playerToRemove];
        setPlayerTimestamps(prevTimestamps => {
          const newTimestamps = {...prevTimestamps};
          delete newTimestamps[playerToRemove];
          updateQueueAndSort(updatedQueue, newStats, newTimestamps);
          return newTimestamps;
        });
        return newStats;
      });
      return updatedQueue;
    });
    setSelectedPlayers(prevSelected => prevSelected.filter(player => player !== playerToRemove));
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Badminton Match Manager</h1>

      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Join Queue</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your name (min 2 characters)"
            className="flex-grow"
          />
          <Button onClick={addPlayerToQueue} disabled={playerName.trim().length < 2} className="w-full sm:w-auto">Join Queue</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
                    <li key={index} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`player-${court.id}-${index}`}
                          checked={court.checkedPlayers[index] || false}
                          onCheckedChange={() => handleCheckboxChange(court.id, index)}
                        />
                        <label htmlFor={`player-${court.id}-${index}`}>{player}</label>
                      </div>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        playerStats[player]?.current === 2
                          ? 'bg-yellow-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {(playerStats[player]?.completed || 0) + (playerStats[player]?.current || 0)}
                      </span>
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
                <Button onClick={() => addPlayersToCourt(court.id)} className="flex-grow sm:flex-grow-0">
                  Add Players from Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {queue.map((player, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`queue-player-${index}`}
                  checked={selectedPlayers.includes(player)}
                  onCheckedChange={() => handlePlayerSelection(player)}
                />
                <label htmlFor={`queue-player-${index}`} className="flex-grow flex items-center justify-between">
                  <span>{player}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center">
                      <Feather className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">0</span>
                    </div>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      playerStats[player]?.current > 0
                        ? 'bg-blue-500 text-white'
                        : playerStats[player]?.completed > 0
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {playerStats[player]?.completed || 0}
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
    </div>
  );
};

export default Index;
