import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Index = () => {
  const [courts, setCourts] = useState([
    { id: 1, players: [], checkedPlayers: {} },
    { id: 2, players: [], checkedPlayers: {} },
  ]);
  const [queue, setQueue] = useState([]);
  const [playerName, setPlayerName] = useState('');

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
        return { ...court, players: remainingPlayers, checkedPlayers: {} };
      }
      return court;
    }));
  };

  const addPlayersToCourt = (courtId) => {
    if (queue.length >= 4) {
      const playersToAdd = queue.slice(0, 4);
      const newQueue = queue.slice(4);
      setCourts(courts.map(court => {
        if (court.id === courtId) {
          return { ...court, players: playersToAdd };
        }
        return court;
      }));
      setQueue(newQueue);
    }
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
          <ol>
            {queue.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
