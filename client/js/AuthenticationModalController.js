(function() {
   angular.module('webJCL.AuthenticationModal',['ui.bootstrap'])
   .controller('AuthenticationModalController', AuthenticationModalController);

   AuthenticationModalController.$inject = ['$scope', '$modalInstance', 'loginID', 'password'];

   function AuthenticationModalController($scope, $modalInstance, loginID, password) {
      $scope.loginID = loginID;
      $scope.password = password;

      $scope.ok = function() {
         $modalInstance.close({
            loginID: $scope.loginID,
            password: $scope.password,
         });
      }

      $modalInstance.rendered.then(function(){
         console.log('opened');
         $('#loginID').focus().select();
      });

      $scope.cancel = function() {
         $modalInstance.dismiss('cancel');
      }
   }

})();