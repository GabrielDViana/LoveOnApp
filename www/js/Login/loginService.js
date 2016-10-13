angular.module('starter')

.service('serviceLogin', function() {

  var user = {}

  var setUser = function(name, email, token, gender, id, email_confirmed, avatar, search_female, search_male) {
    user.name = name,
    user.email = email,
    user.token = token,
    user.gender = gender,
    user.id = id,
    user.email_confirmed = email_confirmed,
    user.avatar = avatar,
    user.search_male = search_male,
    user.search_female = search_female
  }

  var getUser = function() {
    return user;
  }

  return {
    setUser: setUser,
    getUser: getUser
  }

})

.service('serviceLoginSocial', function() {

  var user = {}

  var setUser = function(name, email, id_social) {
    user.name = name,
    user.email = email,
    user.id_social = id_social,
    user.password = id_social,
    user.password_confirmation = id_social
  }

  var getUser = function() {
    return user;
  }

  return {
    setUser: setUser,
    getUser: getUser
  }

})

.service('serviceRegisterSocial', function() {

  var user = {}

  var setUser = function(name, email, id_social, gender, avatar) {
    user.name = name,
    user.email = email,
    user.id_social = id_social,
    user.password = id_social,
    user.password_confirmation = id_social
    user.gender = gender,
    user.avatar = avatar
  }

  var getUser = function() {
    return user;
  }

  return {
    setUser: setUser,
    getUser: getUser
  }

})
