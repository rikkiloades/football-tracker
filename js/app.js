App = Ember.Application.create({
	matches: [],
	players: [],
	ready: function() {
		this.computePlayerStats();
	},
	computePlayerStats: function() {
		var players = {};

		function getPlayer(name)
		{
			if (players.hasOwnProperty(name)) {
				return players[name];
			}

			var newPlayer = App.Player.create({
				name: name,
				results: [],
				goalsFor: 0,
				goalsAgainst: 0
			});

			players[name] = newPlayer;

			return newPlayer;
		}

		this.matches.forEach(function(match) {
			match.teams[0].players.forEach(function(playerName) {
				var player = getPlayer(playerName);

				player.incrementProperty('goalsFor', match.teams[0].score);
				player.incrementProperty('goalsAgainst', match.teams[1].score);
				
				if (match.teams[0].score > match.teams[1].score) {
					player.get('results').push('win');
				}
				else if (match.teams[0].score < match.teams[1].score) {
					player.get('results').push('loss');
				}
				else {
					player.get('results').push('draw');
				}
			});

			match.teams[1].players.forEach(function(player) {
				var player = getPlayer(player);

				player.incrementProperty('goalsFor', match.teams[1].score);
				player.incrementProperty('goalsAgainst', match.teams[0].score);
				
				if (match.teams[1].score > match.teams[0].score) {
					player.get('results').push('win');
				}
				else if (match.teams[1].score < match.teams[0].score) {
					player.get('results').push('loss');
				}
				else {
					player.get('results').push('draw');
				}
			});
		});

		for (var i in players ) {
			this.players.unshift(players[i]);
		}
	}
});

App.Player = Ember.Object.extend({
	lastFiveResults: function() {
		return this.get('results').slice(-5);
	}.property('results'),
	matches: function() {
		return this.get('results').length;
	}.property('results'),
	wins: function() {
		var wins = 0;
		this.get('results').forEach(function(result) {
			if (result == 'win') {
				wins++;
			}
		});

		return wins;
	}.property('results'),
	losses: function() {
		var losses = 0;
		this.get('results').forEach(function(result) {
			if (result == 'loss') {
				losses++;
			}
		});

		return losses;
	}.property('results'),
	draws: function() {
		var draws = 0;
		this.get('results').forEach(function(result) {
			if (result == 'draw') {
				draws++;
			}
		});

		return draws;
	}.property('results'),
	points: function() {
		var points = 0;

		points += this.get('wins') * 3;
		points += this.get('draws') * 1;

		return points;
	}.property('wins', 'draws'),
	goalsDiff: function() {
		return this.get('goalsFor') - this.get('goalsAgainst');
	}.property('goalsFor', 'goalsAgainst'),
	goalsPerGame: function() {
		return this.get('goalsFor') / this.get('matches');
	}.property('matches', 'goalsFor')
});

App.Router.map(function() {
 	this.resource('matches', {path: '/'}, function() {
 		this.resource('match', {path: '/matches/:match_id'});
 	});

 	this.resource('players');

 	this.resource('stats');
});

App.MatchesRoute = Ember.Route.extend({
	model: function() {
		return App.matches;
	}
});

App.MatchesIndexRoute = Ember.Route.extend({
  redirect: function () {
    var firstItem = this.modelFor('matches').get('lastObject');
    console.log(firstItem);
    this.replaceWith('match', firstItem);
  }
});

App.MatchRoute = Ember.Route.extend({
	model: function(params) {
		var match = Ember.A(App.matches).findBy('id', parseInt(params.match_id));
		return match;
	}
});

App.PlayersRoute = Ember.Route.extend({
	model: function() {
		return App.players;
	}
});

App.PlayerRoute = Ember.Route.extend({
	model: function(params) {
		var match = Ember.A(App.players).findBy('id', parseInt(params.player_id));
		return match;
	}
});

App.StatsController = Ember.ObjectController.extend({
	// plays per month per player, graphed (punchcard)
	// score graphed over time
	// home vs away scores graphed
	// played together the most
	// player counts per match over time

	mostWins: function() {
		var mostWins = null;
		App.get('players').forEach(function(player) {
			if (mostWins === null) {
				mostWins = player;
				return;
			}

			if (mostWins.get('wins') < player.get('wins')) {
				mostWins = player;
			}
		});

		return mostWins;
	}.property('App.players.@each.wins'),

	mostDraws: function() {
		var mostDraws = null;
		App.get('players').forEach(function(player) {
			if (mostDraws === null) {
				mostDraws = player;
				return;
			}

			if (mostDraws.get('draws') < player.get('draws')) {
				mostDraws = player;
			}
		});

		return mostDraws;
	}.property('App.players.@each.draws'),

	mostLosses: function() {
		var mostLosses = null;
		App.get('players').forEach(function(player) {
			if (mostLosses === null) {
				mostLosses = player;
				return;
			}

			if (mostLosses.get('losses') < player.get('losses')) {
				mostLosses = player;
			}
		});

		return mostLosses;
	}.property('App.players.@each.losses'),

	bestGoalDiff: function() {
		var bestGoalDiff = null;
		App.get('players').forEach(function(player) {
			if (bestGoalDiff === null) {
				bestGoalDiff = player;
				return;
			}

			if (bestGoalDiff.get('goalsDiff') < player.get('goalsDiff')) {
				bestGoalDiff = player;
			}
		});

		return bestGoalDiff;
	}.property('App.players.@each.goalsDiff'),

	worstGoalDiff: function() {
		var worstGoalDiff = null;
		App.get('players').forEach(function(player) {
			if (worstGoalDiff === null) {
				worstGoalDiff = player;
				return;
			}

			if (worstGoalDiff.get('goalsDiff') > player.get('goalsDiff')) {
				worstGoalDiff = player;
			}
		});

		return worstGoalDiff;
	}.property('App.players.@each.goalsDiff')
});

Ember.Handlebars.helper('fxdate', function(value, options) {
	return moment(value, 'YYYY-MM-DD HH:mm:ss').format('Do MMM');
});

Ember.Handlebars.helper('fxtime', function(value, options) {
	return moment(value, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
});

Ember.Handlebars.helper('fxpct', function(value, options) {
	return Math.round(parseFloat(value) * 100) + '%';
});

Ember.Handlebars.helper('fxround', function(value, options) {
	return Math.round(value);
});
