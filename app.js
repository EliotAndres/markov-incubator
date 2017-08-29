var app = angular.module('app', []);


app
  .directive('twitter', [
    function() {
      return {
        link: function(scope, element, attr) {
          setTimeout(function() {
            twttr.widgets.createShareButton(
              attr.url,
              element[0],
              function(el) {}, {
                count: 'none',
                text: attr.text
              }
            );
          });
        }
      }
    }
  ])
  .controller('MainController', function MainController($scope, $http, $q) {
    $scope.step = 0;
    $scope.loading = true;

    $scope.setStep = function (step) {
      $scope.step = step;
    };

    $scope.generate = function () {
      while (true) {
        var generated = $scope.text.makeSmallSentence(130, 70);

        if (generated.indexOf('DASTARTUP') != -1) {
          $scope.pitch = generated.replace(new RegExp('DASTARTUP', 'g'), 'My Startup');
          break;
        }
      }

    };

    $http({method: 'GET', responseType: 'text', url: 'dataset.txt'})
      .then(function (response) {
        $scope.text = new Text(response.data);
        $scope.loading = false;
        $scope.generate();
      });

  });
