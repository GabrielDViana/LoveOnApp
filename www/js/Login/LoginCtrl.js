angular.module('starter')

.controller('LoginCtrl', function($ionicPopup ,$scope, $state, factoryLogout,
  $rootScope, $ionicLoading, factoryRegister, factoryLogin, serviceLogin,
  serviceLoginSocial, serviceRegisterSocial, factoryConfirmEmail, $timeout,
  factoryUpdate, $cordovaCamera, $cordovaImagePicker, $ionicPopover, $ionicModal,
  ionicDatePicker) {


  $scope.currentDate = "";
  var birthday = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, $scope.currentDate = new Date(val));
      },
      from: new Date(1900, 1, 1),
      to: new Date(1998, 9, 1),
      inputDate: new Date(1998, 1, 1),
      closeOnSelect: true,
      templateType: 'popup'
    };

  $scope.openDatePicker = function(){
    ionicDatePicker.openDatePicker(birthday);
  };

  $scope.galleryHelp = function () {
    $ionicPopup.alert({
      title: 'Ajuda',
      template: 'Para deletar uma imagem da sua galeria\n'+
        'aperte e segure em cima da imagem desejada.\n'+
        'Sua ação só será executada\n'+
        'quando você apertar o botão salvar.'
    });
  }
  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  var toDataURL = function(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback(dataURL);
      return dataURL
    };
    img.src = src;
  }
  var ref = new Firebase("https://loveonapp.firebaseio.com");
  $scope.loginFacebook = function() {
    $ionicLoading.show({
      template: 'Carregando seus dados... <ion-spinner icon="android"></ion-spinner>'
    });
      ref.authWithOAuthPopup("facebook", function(error, authData) {
        if (error) {
          $ionicPopup.alert({
            title: 'Ops!',
            template: 'Login cancelado!'
          });
          $ionicLoading.hide();
        } else {
          toDataURL("https://graph.facebook.com/"+ authData.facebook.id +"/picture?width=400&height=00", function(base64Img) {
            $scope.fbimage = (base64Img.slice(22, base64Img.length));
            $rootScope.$apply();
          });
          $timeout(function () {
            console.log("Data from Firebase:", authData);

            serviceLogin.setUser(
              authData.facebook.displayName,
              authData.facebook.email,
              authData.facebook.id,
              authData.facebook.cachedUserProfile.gender,
              $scope.fbimage
            );
            serviceRegisterSocial.setUser(
              authData.facebook.displayName,
              authData.facebook.email,
              authData.facebook.id,
              authData.facebook.cachedUserProfile.gender,
              $scope.fbimage,
              authData.facebook.cachedUserProfile.birthday
            );
            console.log("Usr:", serviceRegisterSocial.getUser());
            factoryRegister.save(serviceRegisterSocial.getUser(), function(user) {
              $ionicLoading.hide();
              var user ={};
              user.email = serviceRegisterSocial.getUser().email;
              user.id_social = serviceRegisterSocial.getUser().id_social;
              user.password = serviceRegisterSocial.getUser().password;
              $scope.loginEmail(user,"Google");
            }, function(error) {
              var user ={};
              user.email = serviceRegisterSocial.getUser().email;
              user.id_social = serviceRegisterSocial.getUser().id_social;
              user.password = serviceRegisterSocial.getUser().password;
              $scope.loginEmail(user,"Google");
              $ionicLoading.hide();
            });
            console.log("User:", $rootScope.user);
          }, 3500);
        }
      }, {
        remember: "sessionOnly",
        scope: "email, user_friends, user_birthday, user_photos"
      });
    }
    $scope.loginGoogle = function() {
      $ionicLoading.show({
        template: 'Carregando seus dados... <ion-spinner icon="android"></ion-spinner>'
      });
        ref.authWithOAuthPopup("google", function(error, authData) {
          if (error) {
            $ionicPopup.alert({
              title: 'Ops!',
              template: 'Login cancelado!'
            });
            $ionicLoading.hide();
            console.log("Login Failed!", error);
          } else {
            toDataURL(authData.google.profileImageURL, function(base64Img) {
              $scope.fbimage = (base64Img.slice(22, base64Img.length));
              $rootScope.$apply();
            });
            $timeout(function () {
              console.log("Data from Firebase:", authData);

              serviceLogin.setUser(
                authData.google.displayName,
                authData.google.email,
                authData.google.id,
                authData.google.cachedUserProfile.gender,
                $scope.fbimage
              );
              serviceRegisterSocial.setUser(
                authData.google.displayName,
                authData.google.email,
                authData.google.id,
                authData.google.cachedUserProfile.gender,
                $scope.fbimage
              );
              console.log("Usr:", serviceRegisterSocial.getUser());
              factoryRegister.save(serviceRegisterSocial.getUser(), function(user) {
                $ionicLoading.hide();
                var user ={};
                user.email = serviceRegisterSocial.getUser().email;
                user.id_social = serviceRegisterSocial.getUser().id_social;
                user.password = serviceRegisterSocial.getUser().password;
                $scope.loginEmail(user, "Facebook");
              }, function(error) {
                var user ={};
                user.email = serviceRegisterSocial.getUser().email;
                user.id_social = serviceRegisterSocial.getUser().id_social;
                user.password = serviceRegisterSocial.getUser().password;
                $scope.loginEmail(user, "Facebook");
                $ionicLoading.hide();
              });
            }, 1500);
          }
        }, {
          remember: "sessionOnly",
          scope: "email, profile"
        });
      }

    $scope.reloadUser=function(state){
      var user={};
      $state.go(state);

      user.email = serviceRegisterSocial.getUser().email;
      user.id_social = serviceRegisterSocial.getUser().id_social;
      user.password = serviceRegisterSocial.getUser().password;
      console.log(user);
      factoryLogin.get(user, function(user) {
        console.log("update", user);
        serviceLogin.setUser(
          user.name,
          user.email,
          user.token,
          user.gender,
          user.id,
          user.email_confirmed,
          user.avatar
        );
        $ionicLoading.hide();
        $rootScope.user = user;
        $rootScope.matches = user.matches;
        for (var i = 0; i < user.matches.length; i++) {
          $rootScope.matches[i].roomId=user.matches_token[i].token;
        }
        $rootScope.galleryitems=[];
        for (var i = 0; i < user.gallery.length; i++) {
          $rootScope.galleryitems.push({
            src: user.gallery[i],
            sub: ''
          });
        }

        $ionicLoading.hide();
      }, function(error) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Erro!',
          template: 'Falha ao atualizar dados'
        });
      })
    };
    $scope.selImages = function() {
       var options = {
         maximumImagesCount: 10,
         width: 800,
         height: 800,
         quality: 80
       };

       $cordovaImagePicker.getPictures(options)
         .then(function (results) {
             for (var i = 0; i < results.length; i++) {
                window.plugins.Base64.encodeFile(results[i], function(base64){
                   // Save images in Base64
                   $rootScope.user.gallery.push(base64);
                });

             }
             $timeout(function() {
               if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                 $scope.$apply();
               }
             }, 1000)
         }, function(error) {
             // error getting photos
         });

     };


  $scope.datePickerCallback = function (val) {
    if (!val) {
      console.log('Date not selected');
    } else {
      console.log('Selected date is : ', val);
    }
  };

  $scope.loginEmail = function(user, social) {
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });
    factoryLogin.get(user, function(user) {
      if(!user.account_blocked) {
        serviceLogin.setUser(
          user.name,
          user.email,
          user.token,
          user.gender,
          user.id,
          user.email_confirmed,
          user.avatar
        );
        $ionicLoading.hide();
        $rootScope.user = user;
        $rootScope.matches = user.matches;
        for (var i = 0; i < user.matches.length; i++) {
          $rootScope.matches[i].roomId=user.matches_token[i].token;
        }
        $rootScope.galleryitems=[];
        for (var i = 0; i < user.gallery.length; i++) {
          $rootScope.galleryitems.push({
            src: user.gallery[i],
            sub: ''
          });
        }

        $rootScope.username = user.name;
        console.log("Logado", $rootScope.user);
        console.log(user.email_confirmed);
        if(!user.email_confirmed) {
          $state.go('app.primeiraTelaEdit');
        } else {
          $state.go('app.profile');
        }
        $ionicLoading.hide();
        $rootScope.isLogged = true;
      }else{
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Atenção!',
          template: 'Essa conta foi bloqueada por não respeitar os termos de uso, estaremos entrando em contato. Por favor verifique seu e-mail.'
        });
      }
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Falha ao carregar dados, verifique sua conta já foi criada com o '+social
      });
    })
  }

  $scope.logout = function() {
    $ionicLoading.show({
      template: 'Saindo... <ion-spinner icon="android"></ion-spinner>'
    });
    $scope.closePopover();
    factoryLogout.save(serviceLogin.getUser(), function(user) {
      serviceLogin.setUser(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );
      $ionicLoading.hide();
      $state.go('app.home');
    }, function(error) {
      $ionicLoading.hide();
    })
  }

  $scope.registerEmail = function(user) {
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });

    factoryRegister.save(user, function(user) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Sucesso!',
        template: 'Cadastro efetuado com sucesso!'
      });
      $state.go('app.home');
      console.log("BF create", user);
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Cadastro falhou, verifique os dados ou se o email ja foi cadastrado'
      });
    });
  }

  $scope.confirmEmail = function(confirm_token) {
    $ionicLoading.show({
      template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
    });
    factoryConfirmEmail.get({
      confirm_token: confirm_token
    }, function(user) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Sucesso!',
        template: 'Cadastro efetuado com sucesso!'
      });
      $state.go('app.primeiraTelaEdit');
      console.log("BF create", user);
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Cadastro falhou, verifique os dados ou se o email ja foi cadastrado'
      });
    });
  }

  $scope.updateProfile = function(user) {
    // $ionicLoading.show({
    //   template: 'Atualizando seu perfil... <ion-spinner icon="android"></ion-spinner>'
    // });
    user.avatar = $rootScope.user.avatar;
    user.gallery = $rootScope.user.gallery;
    factoryUpdate.update({
      token: serviceLogin.getUser().token
    }, {
      user: user
    }, function(user) {
      $ionicLoading.hide();
      console.log(user);
    }, function(error) {
      $ionicLoading.hide();
      alert("erro", error.message);
    });
  }
  $scope.images = [];
  $scope.imagens = [];
  $scope.alterarFoto = function() {

    function setOptions(srcType) {
      var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true //Corrects Android orientation quirks
      }
      return options;
    }

    function createNewFileEntry(imgUri) {
      window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", {
          create: true,
          exclusive: false
        }, function(fileEntry) {

          // Do something with it, like write to it, upload it, etc.
          // writeFile(fileEntry, imgUri);
          console.log("got file: " + fileEntry.fullPath);
          // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

      }, onErrorResolveUrl);
    }


    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
      $ionicLoading.show({
        template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
      });


      $timeout(function() {


        $ionicLoading.hide();
        $scope.$apply();
        $rootScope.user.avatar = imageUri;

      }, 1000)


    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");

    }, options);


  }

  $scope.newPicture = function() {

    function setOptions(srcType) {
      var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true
      }
      return options;
    }

    function createNewFileEntry(imgUri) {
      window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", {
          create: true,
          exclusive: false
        }, function(fileEntry) {

          // Do something with it, like write to it, upload it, etc.
          // writeFile(fileEntry, imgUri);
          console.log("got file: " + fileEntry.fullPath);
          // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

      }, onErrorResolveUrl);
    }


    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
      $ionicLoading.show({
        template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
      });


      $timeout(function() {


        $ionicLoading.hide();
        $scope.$apply();
        $rootScope.galleryitems.push({
          src: "data:image/png;base64,"+ imageUri,
          sub: ''
        })
        var user = {};
        $rootScope.user.gallery.push("data:image/png;base64,"+ imageUri);
        user.gallery = $rootScope.user.gallery;
        console.log(imageUri);
        factoryUpdate.update({
          token: serviceLogin.getUser().token
        }, {
          user: user
        }, function(user) {

          console.log(user);
        }, function(error) {
          alert("erro", error.message);
        });

      }, 1000)


    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");

    }, options);


  }

  $scope.newPictureLib = function() {

    function setOptions(srcType) {
      var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.PICTURE
      }
      return options;
    }

    function createNewFileEntry(imgUri) {
      window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", {
          create: true,
          exclusive: false
        }, function(fileEntry) {

          // Do something with it, like write to it, upload it, etc.
          // writeFile(fileEntry, imgUri);
          console.log("got file: " + fileEntry.fullPath);
          // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

      }, onErrorResolveUrl);
    }


    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
      $ionicLoading.show({
        template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
      });


      $timeout(function() {


        $ionicLoading.hide();
        $scope.$apply();
        $rootScope.galleryitems.push({
          src: "data:image/png;base64,"+ imageUri,
          sub: ''
        })
        var user = {};
        $rootScope.user.gallery.push("data:image/png;base64,"+ imageUri);
        user.gallery = $rootScope.user.gallery;
        console.log(imageUri);
        factoryUpdate.update({
          token: serviceLogin.getUser().token
        }, {
          user: user
        }, function(user) {

          console.log(user);
        }, function(error) {
          alert("erro", error.message);
        });

      }, 1000)


    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");

    }, options);


  }

  $scope.changeBackground = function() {

    function setOptions(srcType) {
      var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true //Corrects Android orientation quirks
      }
      return options;
    }

    function createNewFileEntry(imgUri) {
      window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", {
          create: true,
          exclusive: false
        }, function(fileEntry) {

          // Do something with it, like write to it, upload it, etc.
          // writeFile(fileEntry, imgUri);
          console.log("got file: " + fileEntry.fullPath);
          // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

      }, onErrorResolveUrl);
    }


    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
      $ionicLoading.show({
        template: 'Carregando... <ion-spinner icon="android"></ion-spinner>'
      });


      $timeout(function() {


        $ionicLoading.hide();
        $scope.$apply();
        var user = {};
        $rootScope.user.background = imageUri;
        user.background = $rootScope.user.background;
        factoryUpdate.update({
          token: serviceLogin.getUser().token
        }, {
          user: user
        }, function(user) {

          console.log(user);
        }, function(error) {
          alert("erro", error.message);
        });

      }, 1000)


    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");

    }, options);


  }

  $scope.removeItem = function (index) {
     $rootScope.user.gallery.splice(index, 1);
     $rootScope.galleryitems.splice(index, 1);
   };

   $ionicModal.fromTemplateUrl('templates/modalCamera.html', {
     scope: $scope,
     animation: 'slide-in-up'
   }).then(function(modal) {
     $scope.modal = modal;
   });
   $scope.openModal = function() {
     $scope.modal.show();
   };
   $scope.closeModal = function() {
     $scope.modal.hide();
   };
});
