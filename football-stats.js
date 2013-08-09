var fs = require('fs');

var matchesJSON = fs.readFileSync('matches.json');

var matches = JSON.parse(matchesJSON);

var gamesPlayed = 0;
var playedCounts = {};
var playedTogether = {};
var playerWins = {};
var playerLosses = {};

matches.forEach(function(match) {
  if (match.teams[0].score == null || match.teams[1].score == null) {
		return;
	}

	gamesPlayed++;

	var winningTeam = null;
	var loosingTeam = null;
	if (match.teams[0].score > match.teams[1].score) {
		winningTeam = match.teams[0];
		loosingTeam = match.teams[1];
	}
	else if (match.teams[0].score < match.teams[1].score) {
		winningTeam = match.teams[0];
		loosingTeam = match.teams[1];	
	}

	if (winningTeam == null) {
		return;
	}

	winningTeam.players.forEach(function(player) {
		if (!playerWins.hasOwnProperty(player)) {
			playerWins[player] = 0;
		}

		playerWins[player]++;
	});

	loosingTeam.players.forEach(function(player) {
		if (!playerLosses.hasOwnProperty(player)) {
			playerLosses[player] = 0;
		}

		playerLosses[player]++;
	});

	match.teams.forEach(function(match) {
		for (var currentPlayer = 0; currentPlayer < match.players.length; currentPlayer++) {
			// calculates how many times each player plays
			if (!playedCounts.hasOwnProperty(match.players[currentPlayer])) {
				playedCounts[match.players[currentPlayer]] = 0;
			}
			playedCounts[match.players[currentPlayer]]++;

			// calculate who plays togehter the most
			for (var otherPlayer = currentPlayer + 1; otherPlayer < match.players.length; otherPlayer++) {
				if (match.players[currentPlayer] > match.players[otherPlayer]) {
					var playerCombo = match.players[currentPlayer] + ' + ' + match.players[otherPlayer];
				}
				else {
					var playerCombo = match.players[otherPlayer] + ' + ' + match.players[currentPlayer];
				}

				if (!playedTogether.hasOwnProperty(playerCombo)) {
					playedTogether[playerCombo] = 0;
				}

				playedTogether[playerCombo]++;
			}
		}
	});
});

console.log('Games played: ' + matches.length);
console.log('Wins by player: ' + JSON.stringify(playerWins));
console.log('Losses by player: ' + JSON.stringify(playerLosses));
console.log('How many times has each player played: ' + JSON.stringify(playedCounts));
console.log('Who played together the most: ' + JSON.stringify(playedTogether));
