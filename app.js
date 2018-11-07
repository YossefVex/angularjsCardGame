var myGameApp = angular.module('myGameApp', []);

myGameApp.controller('gameController', ['$scope', '$timeout','$interval', '$http', function($scope,$timeout, $interval, $http){
$scope.timerSec = 10
$scope.msg = "hello world"
// players
$scope.current = 0;
function Player(id, score) {
  this.id = id;
  this.score = score;
  this.time = new Date();
  this.matches = "";
}
$scope.playersList = [];
// cards
$scope.cards = {}
$scope.cardFlipped = []

$scope.modalBool = false


$scope.Timer = null;
// counter => countdown timer, 10s
$scope.counter = $scope.timerSec;
var mytimeout;
$scope.onTimeout = function(){
    if($scope.counter>0){
      $scope.counter--;
      mytimeout = $timeout($scope.onTimeout,1000);
    } else if($scope.counter==0){
      $scope.stopTimeout()
      $scope.flipBack('timer')
      switchCurentPlayer()
    }
}
$scope.stopTimeout = function(){
    $timeout.cancel(mytimeout);
    $scope.counter = $scope.timerSec;
}
// var mytimeout = $timeout($scope.onTimeout,1000);

// card clicked action
$scope.flipCard = function(index){
  if($scope.cards[index].flipped==false){
    // check that max of 2 cards flipped at the moment
    $scope.cardFlipped.length > 1 ? '':$scope.cards[index].flipped = true
    $scope.cardFlipped.push(index);
    if ($scope.cardFlipped.length==2) {
      // debugger
      $scope.stopTimeout()
      // if pair is good
      if($scope.checkCardsMatch()){
        $scope.playersList[$scope.current].score ++;
        $scope.cardFlipped = []
      } else {
           $scope.flipBack('flipCard')
      }
      if(($scope.playersList[0].score + $scope.playersList[1].score)==4){
        $scope.playersList[0].matches = new Date();
        $scope.playersList[1].matches = new Date();
        $scope.modalBool = true
        $scope.sendScores()
      } else
        switchCurentPlayer()
      }

  }
}
  $scope.sendScores = function(){
    console.log($scope.playersList)
    $http.post('https://dev-bot.pico.buzz/memory', $scope.playersList).then(function(res){
      console.log("finish", res)
    })
  }
function switchCurentPlayer(){
  $scope.current = ($scope.current == 0) ? 1 : 0;
  $scope.onTimeout();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
$scope.flipBack = function(sender){
  var action = function(){
    if(typeof $scope.cards[$scope.cardFlipped[0]]!='undefined')
      $scope.cards[$scope.cardFlipped[0]].flipped = false
    if(typeof $scope.cards[$scope.cardFlipped[1]]!='undefined')
      $scope.cards[$scope.cardFlipped[1]].flipped = false
      $scope.cardFlipped = [];
  }
  if(sender=='timer'){action()}else
  $timeout( function(){
    console.log($scope.cardFlipped, sender);
    action()
  }, 2000)
}
// check the 2 cards flipped
$scope.checkCardsMatch = function(){
  return $scope.cards[$scope.cardFlipped[0]].pair_id == $scope.cards[$scope.cardFlipped[1]].id
}


// ****** Start ******* //
// get the cards
  $http.get('https://dev-bot.pico.buzz/memory').then(function(res){
  $scope.cards = res.data.data.images
    for(var i = 0; i<res.data.data.images.length; i++){
      $scope.cards[i].flipped = false
    }
    console.log($scope.cards);
  });
// init players
  for (var i = 0; i < 2; i++) {
    $scope.playersList.push(new Player(i,0))
  }

  $scope.onTimeout();

}]);


myGameApp.config(function(){


});

myGameApp.run(function(){


});
