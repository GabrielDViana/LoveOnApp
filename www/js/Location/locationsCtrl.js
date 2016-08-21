angular.module('starter')

.controller('locationsCtrl', function($ionicPopup ,$scope, $state, $stateParams,
  $rootScope, $ionicLoading, serviceLogin, factoryLocations, factoryCheckins,
  factoryLocation, factoryCheckin, $cordovaGeolocation, $ionicPlatform) {

  $scope.allLocations = function() {
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });
    origin = {};
    origin.latitude = $scope.lat;
    origin.longitude = $scope.long;
    factoryLocations.get({
      latitude:$scope.lat,
      longitude:$scope.long
    }, function(locations) {
      $ionicLoading.hide();
      $rootScope.locations = locations;
      console.log($rootScope.locations);
      $ionicLoading.hide();
      $state.go('app.locations');
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Falha de comunicação com o banco'
      });
    })
  }
  $scope.checkins = function(auth_token) {
    factoryFavorites.get({
      auth_token: auth_token
    }, function(location) {
      $ionicLoading.hide();
      $rootScope.locations = location;
      console.log($rootScope.locations);
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Falha de comunicação com o banco'
      });
    })
  };

  $scope.viewLocation = function(params) {
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });
    params.user_token = $rootScope.user.token;
    factoryLocation.save(params, function(location) {
      $ionicLoading.hide();
      console.log(location);
      $rootScope.loc = location;
      console.log("local", location);
      $state.go('app.location');
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Erro ao carregar localização!'
      });
    })

  };

  $scope.doCheckin = function(location) {
    var checkin = {};
    checkin.user_token = serviceLogin.getUser().token;
    checkin.location_token = location.token;
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });
    factoryCheckin.save(checkin, function(checkin) {
      $ionicLoading.hide();
      $scope.viewLocation(location);
      console.log("BF create", checkin);
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Não foi possível fazer check-in nesta localização.'
      });
    });
  }

  DEFAULT_PAGE_SIZE_STEP = 5;

  $scope.currentPage = 1;
  $scope.pageSize = $scope.currentPage * DEFAULT_PAGE_SIZE_STEP;

  $scope.loadNextPage = function(){
    $scope.currentPage++;
    $scope.pageSize = $scope.currentPage * DEFAULT_PAGE_SIZE_STEP;
  }

  $ionicPlatform.ready(function() {

       $ionicLoading.show({
           template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Adquirindo localização!'
       });

       var posOptions = {
           enableHighAccuracy: true,
           timeout: 3000,
           maximumAge: 0
       };
       $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
           $scope.lat  = position.coords.latitude;
           $scope.long = position.coords.longitude;
           $ionicLoading.hide();
           console.log(position.coords);
       }, function(err) {
           $ionicLoading.hide();
           console.log(err);
       });
   });
})
