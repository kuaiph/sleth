/**

Copyright (c) 2015 Joris Bontje
Copyright (c) 2012 Clint Bellanger

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


Sounds by Brandon Morris (CC-BY 3.0)
Art by Clint Bellanger (CC-BY 3.0)

*/

"use strict";

var app = angular.module('slots', ['slots.game', 'slots.reels', 'slots.sounds']);

app.constant('config', {
    FPS: 60,

    reel_count: 3,
    row_count: 3,
    reel_positions: 32,
    symbol_size: 32,

    reel_pixel_length: 1024, // reel_positions * symbol_size
    stopping_distance: 528,
    max_reel_speed: 32,
    spinup_acceleration: 2,
    spindown_acceleration: 1,
    starting_credits: 100
});

app.controller("SlotsController", ['$scope', '$interval', 'config', 'game', 'sounds', function($scope, $interval, config, game, sounds) {

    //  sync with blockchain
    $scope.credits = config.starting_credits;

    $interval(function() {
        game.logic();
    }, 1000 / config.FPS);

    $scope.generateEntropy = function() {
        $scope.entropy = Math.floor(Math.random() * Math.pow(32, 3));
    };

    //---- Input Functions ---------------------------------------------

    $scope.handleKey = function(evt) {
      if (evt.keyCode == 32) { // spacebar
        if (game.state == game.STATE_SPINMAX) {
            $scope.stop();
            return;
        }
        if (game.state != game.STATE_REST) return;

        if ($scope.credits >= 5) $scope.spin(5);
        else if ($scope.credits >= 3) $scope.spin(3);
        else if ($scope.credits >= 1) $scope.spin(1);

      }
    };

    $scope.spin = function(line_choice) {
      if (game.state != game.STATE_REST) return;
      if ($scope.credits < line_choice) return;

      $scope.credits -= line_choice;
      game.spin(line_choice);
      $scope.generateEntropy();
    };

    $scope.stop = function() {
        if (game.state != game.STATE_SPINMAX) return;

        // calculate the final results now, so that spindown is ready
        game.set_stops($scope.entropy);
    };

    $scope.$on('slots:reward', function(evt, reward) {
        /*if (reward.payout > 0) {
            sounds.playWin();
        }*/
        console.log('REWARD', reward);
        $scope.credits += reward.payout;
        $scope.reward = reward;
    });

}]);
