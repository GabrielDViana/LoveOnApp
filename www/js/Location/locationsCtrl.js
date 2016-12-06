angular.module('starter')

.controller('locationsCtrl', function($ionicPopup ,$scope, $state, $stateParams,
  $rootScope, $ionicLoading, serviceLogin, factoryLocations, factoryCheckins,
  factoryLocation, factoryCheckin, $cordovaGeolocation, $ionicPlatform) {

  $scope.noLocationAlert = function() {
    $ionicPopup.alert({
      title: 'Verifique seu GPS!',
      template: 'Por favor, ligue seu GPS para que possamos mostrar os locais próximos. Ou verifique se está próximo de algum dos locais disponíveis.'
    });
  }

  $scope.allLocations = function() {
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });
    origin = {};
    origin.latitude = $rootScope.lat;
    origin.longitude = $rootScope.long;
    // $ionicPopup.alert({
    //   title: 'Info!',
    //   template: 'Latitude: '+$rootScope.lat +'\n Longitude' +$rootScope.long
    // });
    factoryLocations.get({
      latitude:$rootScope.lat,
      longitude:$rootScope.long
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
        template: 'Falha de comunicação com o banco de dados'
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
        template: 'Falha de comunicação com o banco de dados'
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
    checkin.user_token = $rootScope.user.token;
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
        template: 'Não foi possível acessar essa localização!'
      });
      $state.go('app.locations');
    });
  }

  DEFAULT_PAGE_SIZE_STEP = 4;

  $scope.currentPage = 1;
  $scope.pageSize = $scope.currentPage * DEFAULT_PAGE_SIZE_STEP;

  $scope.loadNextPage = function(){
    $scope.currentPage++;
    $scope.pageSize = $scope.currentPage * DEFAULT_PAGE_SIZE_STEP;
  }

  var posOptions = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      $rootScope.lat  = position.coords.latitude
      $rootScope.long = position.coords.longitude
    }, function(err) {
      // error
    });


  var watchOptions = {
    timeout : 3000,
    enableHighAccuracy: false // may cause errors if true
  };

  var watch = $cordovaGeolocation.watchPosition(watchOptions);
  watch.then(
    null,
    function(err) {
      // $ionicPopup.alert({
      //    title: 'GPS não disponivel!',
      //    template: 'Por favor, ligue seu GPS para que possamos mostrar os locais próximos.'
      //  });
    },
    function(position) {
      $rootScope.lat  = position.coords.latitude
      $rootScope.long = position.coords.longitude
  });
})
