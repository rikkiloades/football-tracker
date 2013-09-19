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

			var newPlayer = App.Player.create({name: name});

			players[name] = newPlayer;

			return newPlayer;
		}

		this.matches.forEach(function(match) {
			match.teams[0].players.forEach(function(player) {
				var player = getPlayer(player);

				player.goalsFor += match.teams[0].score;
				player.goalsAgainst += match.teams[1].score;
				player.matches++;

				if (match.teams[0].score > match.teams[1].score) {
					player.wins++;
				}
				else if (match.teams[0].score < match.teams[1].score) {
					player.losses++;
				}
				else {
					player.draws++;
				}
			});

			match.teams[1].players.forEach(function(player) {
				var player = getPlayer(player);

				player.goalsFor += match.teams[0].score;
				player.goalsAgainst += match.teams[1].score;
				player.matches++;

				if (match.teams[0].score > match.teams[1].score) {
					player.wins++;
				}
				else if (match.teams[0].score < match.teams[1].score) {
					player.losses++;
				}
				else {
					player.draws++;
				}
			});
		});

		for (var i in players ) {
			this.players.unshift(players[i]);
		}
	}
});

App.Player = Ember.Object.extend({
	name: '',
	matches: 0,
	wins: 0,
	losses: 0,
	draws: 0,
	points: function() {
		var points = 0;

		points += this.get('wins') * 3;
		points += this.get('draws') * 1;

		return points;
	}.property('wins', 'draws'),
	pointsPerGame: function() {
		return this.get('points') / this.get('matches');
	}.property('matches', 'points'),
	winRatio: function() {
		return this.get('wins') / this.get('matches');
	}.property('matches', 'wins'),
	goalsFor: 0,
	goalsAgainst: 0,
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
