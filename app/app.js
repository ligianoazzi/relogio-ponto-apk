angular.module('myApp',['ui.router', 'ngMaterial', 'ngAria', 'ngAnimate']);

var url = "http://localhost";
var url_web = "http://www.ergoseg.com.br";
url = url_web; // Para editar local comente esta linha

angular.module('myApp')
.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('registrar');

// Essa rota possui validação em sua controller - cadastroCartaoPontoController
// para acesso de um ip externo
	$stateProvider
        .state('registrar', {
            url          : '/registrar',
            templateUrl  : 'app/templates/cadastro-cartao-ponto.html',
            controller   : 'CadastroCartaoPontoController'
        });

        $stateProvider
		.state('erro', {
			url          : '/erro',
            template     : "<div><h1>Acesso Externo Negado</h1></div>"
		});
});

angular.module('myApp')
.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
        .primaryPalette('teal',
        {
            'default': '800',
            'hue-1'  : '300',
            'hue-2'  : '500',
            'hue-3'  : '600',
        })
        .accentPalette('amber',
        {
            'default' : '500',
            'hue-1' : '500',
            'hue-2' : '900',
        })
        .warnPalette('red', {
            'default' : '500'
        })
        .backgroundPalette('grey');

});


angular.module("myApp")
.factory("CadastroCartaoPontoFactory", function CadastroCartaoPontoFactory($http) {
  return {
	    buscarColaboradoresPonto: function() {
			return $http.get(
				url+"/comercial/Operacional/index.php/operacional/cadastro/cadastroCartaoPontoController/buscarColaboradoresPonto");
		},
	    inserirRegistroPonto: function(dados) {
			return $http({
				method : 'POST',
				url : url+"/comercial/Operacional/index.php/operacional/cadastro/cadastroCartaoPontoController/inserirRegistroPonto/",
				data: dados,
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		}
	}
});


angular.module("myApp")
.controller("CadastroCartaoPontoController",  function($scope, $http, $mdDialog, $timeout, $location, CadastroCartaoPontoFactory) {

	$scope.url_web = url_web;
	$scope.colaboradores = [];
    $scope.registrosRecentes = [];
    $scope.contador = 0;

    $scope.buscarColaboradoresPonto = function () {
        CadastroCartaoPontoFactory
        .buscarColaboradoresPonto()
        .then(function(result){
            if(result.data == "Acesso Negado") {
                $location.path( "/erro" );
            }
            else{
                $scope.colaboradores = result.data.naoRegistrados;
                $scope.registrosRecentes = result.data.registrosRecentes;
            }
        });
    };

    $scope.alternarLista = function() {
        $scope.mostrarRecentes = $scope.mostrarRecentes ? false : true;
    }

    $scope.configDialogRegistroPonto = function(event, dados) {

		$mdDialog.show({
			restrict			: 'E',
		    controller          : "DialogRegistroPontoController",
		    templateUrl         : "app/templates/dialog-cofirmar-ponto.html",
		    targetEvent         : event,
		    parent 				: angular.element(document.body),
		    clickOutsideToClose : false,
		    locals              : { dados:dados },
		})
		.then(function(dados){
            $scope.horaRegistrada = dados.horaRegistrada; 
            $scope.buscarColaboradoresPonto();

            $mdDialog.show({
                controller: function($mdDialog, $timeout) {
                    var dialog = this;
                    this.esconder = function() {
                        $mdDialog.hide();
                    }
                    $timeout(dialog.esconder, 1500);
                    

                },
                template    : '<md-dialog aria-label="Aviso">' +
                               '  <md-dialog-content>'+
                               '    <div class="md-dialog-content">'+
                               '  <span class="md-headline">Registrado! </span>'+
                               '<span style=\'color:red\' class=\'md-headline\'>'+$scope.horaRegistrada+'</span>' +
                               '    </md-card>'+
                               '  </div>' +
                               '</md-dialog>',
                targetEvent : event
              });

            
        }, function(){});
    }

    $scope.buscarColaboradoresPonto();

    $scope.formatarTempo = function(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

});

angular.module("myApp")
.controller("DialogRegistroPontoController", function($scope, $mdDialog, dados, $timeout, CadastroCartaoPontoFactory) {
    
    $scope.senha = "";
    $scope.dados = dados;
    $scope.dataNascimento = "";

    $scope.cancel = function(){
        $mdDialog.cancel(); 
    };

    $scope.verificarSenha = function() {
        if($scope.dataNascimento == $scope.senha) {
        	CadastroCartaoPontoFactory
            .inserirRegistroPonto($scope.dados)
        	.then(function(result) {
                $timeout($mdDialog.hide(result.data), 200);
        	});
        }
        else{
            $timeout(function() {
                $scope.senha = ""}, 200);
        }
    };

    $scope.digitar = function() {
        if($scope.senha.length == 4) {
            $scope.verificarSenha();
        }
   
    }

    $scope.setDataNascimento = function() {
    	var data = $scope.dados.dt_nascimento.split("-");
    	$scope.dataNascimento =  data[2]+data[1];
    }

    $scope.setDataNascimento();

});
