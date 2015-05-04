(function() {
   angular.module('webJCL.AuthenticationModal',['ui.bootstrap'])
   .controller('AuthenticationModalController', AuthenticationModalController);

   AuthenticationModalController.$inject = ['$scope', '$modalInstance', 'loginID', 'password', 'willRunJob'];

   function AuthenticationModalController($scope, $modalInstance, loginID, password, willRunJob) {
      $scope.loginID = loginID;
      $scope.password = password;
      $scope.willRunJob = willRunJob;

      $scope.ok = function() {
         $modalInstance.close({
            loginID: $scope.loginID,
            password: $scope.password,
            remember: Boolean($scope.remember),
         });
      }

      $modalInstance.rendered.then(function(){
         $('#loginID').focus().select();
      });

      $scope.cancel = function() {
         $modalInstance.dismiss('cancel');
      }
   }

})();