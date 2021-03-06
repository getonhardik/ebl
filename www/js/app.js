// Ionic Starter App
// 'app' is the name of this angular module (also set in a <body> attribute in index.html)

angular.module('app',[
    'ionic', 'ngCordova','ngCordovaOauth','ngOpenFB', 'pascalprecht.translate','ionic-ratings',
    'app.controllers', 'app.filters', 'ionicLazyLoad','slickCarousel'	,'sw2.ionic.password-show-hide','ionic.service.core','ionic.service.push'
])
.constant('shopSettings',{
   
   
   payPalSandboxId : 'AdjksaEs2_YzWFOl0hpAD4chm_v_nbOQNmoeD1fMftDf5o3Md-FMcZW7P4DNDf9hsU70Zq3QV-T65Crv',
   payPalProductionId : 'patel.kalpeshbeit2010-facilitator@gmail.com',
   payPalEnv: 'PayPalEnvironmentSandbox',   // for testing  production for production
   payPalShopName : 'MyShopName',
//   payPalMerchantPrivacyPolicyURL : 'http://pr.veba.co/~shubantech/ebranch',
//   payPalMerchantUserAgreementURL : 'http://pr.veba.co/~shubantech/ebranch'
   payPalMerchantPrivacyPolicyURL : 'http://demo.ebranchsolutions.com/',
   payPalMerchantUserAgreementURL : 'http://demo.ebranchsolutions.com/'
   
   
   
    
})
.factory('PaypalService', ['$q', '$ionicPlatform', 'shopSettings', '$filter', '$timeout', function ($q, $ionicPlatform, shopSettings, $filter, $timeout) {



        var init_defer;
        /**
         * Service object
         * @type object
         */
        var service = {
            initPaymentUI: initPaymentUI,
            createPayment: createPayment,
            configuration: configuration,
            onPayPalMobileInit: onPayPalMobileInit,
            makePayment: makePayment
        };


        /**
         * @ngdoc method
         * @name initPaymentUI
         * @methodOf app.PaypalService
         * @description
         * Inits the payapl ui with certain envs. 
         *
         * 
         * @returns {object} Promise paypal ui init done
         */
        function initPaymentUI() {

            init_defer = $q.defer();
            $ionicPlatform.ready().then(function () {

                var clientIDs = {
                    "PayPalEnvironmentProduction": shopSettings.payPalProductionId,
                    "PayPalEnvironmentSandbox": shopSettings.payPalSandboxId
                };
				console.log(clientIDs);
                PayPalMobile.init(clientIDs, onPayPalMobileInit);
            });

            return init_defer.promise;

        }


        /**
         * @ngdoc method
         * @name createPayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Creates a paypal payment object 
         *
         * 
         * @returns {object} PayPalPaymentObject
         */
        function createPayment(total, name,currency,sale) {
                console.log("Total:"+total+"Name:"+name);
            // "Sale  == >  immediate payment
            // "Auth" for payment authorization only, to be captured separately at a later time.
            // "Order" for taking an order, with authorization and capture to be done separately at a later time.
            var payment = new PayPalPayment("" + total, ""+currency, "" + name, ""+sale);
            return payment;
        }
        /**
         * @ngdoc method
         * @name configuration
         * @methodOf app.PaypalService
         * @description
         * Helper to create a paypal configuration object
         *
         * 
         * @returns {object} PayPal configuration
         */
        function configuration() {
            // for more options see `paypal-mobile-js-helper.js`
			 console.log(shopSettings);
            var config = new PayPalConfiguration({merchantName: shopSettings.payPalShopName, merchantPrivacyPolicyURL: shopSettings.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: shopSettings.payPalMerchantUserAgreementURL});
            return config;
        }

        function onPayPalMobileInit() {
            $ionicPlatform.ready().then(function () {
                // must be called
				 console.log(shopSettings.payPalEnv);
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender(shopSettings.payPalEnv, configuration(), function () {

                    $timeout(function () {
                        init_defer.resolve();
                    });

                });
            });
        }

        /**
         * @ngdoc method
         * @name makePayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Performs a paypal single payment 
         *
         * 
         * @returns {object} Promise gets resolved on successful payment, rejected on error 
         */
        function makePayment(total, name,currency,sale) {



            var defer = $q.defer();
            total = $filter('number')(total, 2);
			 console.log(total);
            $ionicPlatform.ready().then(function () {
                PayPalMobile.renderSinglePaymentUI(createPayment(total, name,currency,sale), function (result) {
                    $timeout(function () {
                        defer.resolve(result);
                    });
                }, function (error) {
                    $timeout(function () {
                        defer.reject(error);
                    });
                });
            });

            return defer.promise;
        }

        return service;
    }])
        .service('User_data', function () {
            return {};
        })
 .factory('commonFunction', function() {
        return {
            foo: function() {
                alert("I'm foo!");
            },
            doDeletewishlist : function (p_id,idflag,$rootScope,$ionicPopup) {
				$rootScope.showLoading();
               
                 var u_id = getStorage('user_id');
                var params = {
                    user_id: u_id,
                    product_id: p_id
                };

                $rootScope.service.get('removeWishlist', params, function (res) {
                    $rootScope.hideLoading();

                    $rootScope.wishlist_detail = res.data.items;
                    angular.extend($rootScope.wishlist_detail, res.data.items);
                    if(idflag == 'big_wishlist_'){
                        $('.'+idflag+p_id).attr('src','img/icon-23.png');
                    }else{
                    $('.'+idflag+p_id).attr('src','img/save-25.png');
                    }
 $('.'+idflag+p_id).attr('rel','add');
                    return;
                });
            },
            doWhishlistAdd : function (p_id,idflag,$rootScope,$ionicPopup) {
            //var p_id = $('#product_w_id').val();            
            var u_id = getStorage('user_id');	
			if(u_id == null || u_id == ''){
				$ionicPopup.alert( 
				{
						title: 'error',
						subTitle: 'Login first',
						okType: 'buttonhk'
					}
				);		
			}else{
				var params = {
					product: p_id,
					user_id: u_id,
				};
				$rootScope.showLoading();
				$rootScope.service.get('addwishlist', params, function (res) {
					console.log(res);
					if (res.status == 'error') {
						$ionicPopup.alert( 
						{
								title: 'error',
								subTitle: res.message,
								okType: 'buttonhk'
							}
						);

						return;
					}
					if (res.status == 'success' || res.status == 'SUCCESS') {
						$rootScope.hideLoading();
                                            if(idflag == 'big_wishlist_'){
                                                $('.'+idflag+p_id).attr('src','img/icon-28.png');
                                            }else{
                                            $('.'+idflag+p_id).attr('src','img/icon-25.png');
                                            }

                                        
                                        $('.'+idflag+p_id).attr('rel','remove');
						return;
					}
			
            	});           
			}
        }
        };
    })        
        .run(function ($ionicPlatform,$rootScope,$ionicPopup,$cordovaSocialSharing, $http, $ionicPopup,$ionicLoading,ngFB,commonFunction) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default
                /*if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }*/
                $rootScope.showLoading = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="spiral"></ion-spinner>'
                });
             };
            $rootScope.hideLoading = function () {
                $ionicLoading.hide();
            };
                 $rootScope.toggleWishlish = function (p_id,idflag) {
                     console.log(p_id);
                  var typeWish=$('.'+idflag+p_id).attr('rel');
                  console.log(typeWish);
                  if(typeWish=='remove'){
                        commonFunction.doDeletewishlist(p_id,idflag,$rootScope,$ionicPopup);
                  }else{
                       commonFunction.doWhishlistAdd(p_id,idflag,$rootScope,$ionicPopup);
                  }
                 };
                $rootScope.sharewithfriend = function (share_url) {
//                    alert(123);
//                    alert(share_url);
                    $rootScope.showLoading();
                    var message = "Ebranch";
                    var link = share_url;
                    $cordovaSocialSharing.share(message, null,null,link);
                    $rootScope.hideLoading();
                };
                 
                ngFB.init({appId: '419763941691558'});
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
            
            Service($rootScope, $http, $ionicPopup);
        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider,$ionicAppProvider) {
            
            $ionicConfigProvider.backButton.text('Back').icon('ion-chevron-left');
            $ionicConfigProvider.scrolling.jsScrolling(false);
            $ionicConfigProvider.tabs.position('bottom');
            $ionicConfigProvider.form.checkbox('square');
            $ionicConfigProvider.views.transition('none');  //('fade-in')

            $ionicAppProvider.identify({
                app_id: '91de857a',
                api_key: '0e978dd843d20c1573e81aea041db25a1e3b6ada6a34620e',
                dev_push: true
            });

            $stateProvider
                    .state('app', {
                        cache: false,
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('app.home', {
                        cache: false,
                        url: '/home', //首页
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/home.html',
                                controller: 'HomeCtrl'
                            }
                        }
                    })
                    .state('app.test_push', {
                        cache: false,
                        url: '/test_push', //首页
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/test_push.html',
                                controller: 'test_pushCtrl'
                            }
                        }
                    })
                    .state('app.lists', {
                        url: '/lists/:cmd',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/lists.html',
                                controller: 'ListsCtrl'
                            }
                        }
                    })
//                    .state('app.certDownload', {
//                        url: '/certDownload', //�?书下载，其实就是内容管�?�
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/certDownload.html',
//                                controller: 'certCtrl'
//                            }
//                        }
//                    })
                    .state('app.orderDetails', {
                        cache: false,
                        url: '/orderDetails', //附近�?销商列表
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/orderDetails.html',
                                controller: 'orderDetailsCtrl'
                            }
                        }
                    })
					.state('app.paypal', {
                        url: '/paypal', //附近�?销商列表
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/paypal.html',
                                controller: 'paypalCtrl'
                            }
                        }
                    })
					.state('app.checkout', {
                                            cache: false,
                        url: '/checkout', //附近�?销商列表
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/checkout.html',
                                controller: 'checkoutCtrl'
                            }
                        }
                    })
					.state('app.orderdata', {
                        url: '/orderdata/:orderid', //附近�?销商列表
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/orderdata.html',
                                controller: 'orderdataCtrl'
                            }
                        }
                    })
					
//                    .state('app.searchAgent', {
//                        url: '/searchAgent', //附近�?销商
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/searchAgent.html',
//                                controller: 'SearchAgentCtrl'
//                            }
//                        }
//                    })
//                    .state('app.agents', {
//                        url: '/agents', //附近�?销商列表
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/agents.html',
//                                controller: 'AgentsCtrl'
//                            }
//                        }
//                    })
//                    .state('app.survey', {
//                        url: '/survey', //问�?�调查
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/survey.html'
//                            }
//                        }
//                    })
                    .state('app.register', {
                        cache: false,
                        url: '/register',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/register.html',
                                controller: 'registerCtrl'
                            }
                        }
                    })
                    .state('app.login', {
                        url: '/login',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/login.html',
                                controller: 'loginCtrl'
                            }
                        }
                    })

//                    .state('app.women', {
//                        url: '/women',
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/women.html',
//                                controller: 'womenCtrl'
//                            }
//                        }
//                    })
                    .state('app.address_book', {
                        url: '/address_book',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/address_book.html',
                                controller: 'address_bookCtrl',
                                cache: false
                            }
                        }
                    })
                    .state('app.wishlist', {
                        cache: false,
                        url: '/wishlist',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/wishlist.html',
                                controller: 'wishlistCtrl'
                            }
                        }
                    })
                    .state('app.daily_deals', {
                        url: '/daily_deals',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/daily_deals.html',
                                controller: 'daily_dealsCtrl'
                            }
                        }
                    })
					.state('app.about_us', {
                        url: '/about_us',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/about_us.html',
                                controller: 'about_usCtrl'
                            }
                        }
                    })
                    .state('app.editaddressbook', {
                        url: '/editaddressbook',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/editaddressbook.html',
                                controller: 'editaddressbookCtrl'
                            }
                        }
                    })
                    .state('app.my_account', {
                        cache: false,
                        url: '/my_account',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/my_account.html',
                                controller: 'my_accountCtrl'
                            }
                        }
                    })
                    .state('app.leave_feedback', {
                        url: '/leave_feedback',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/leave_feedback.html',
                                controller: 'leave_feedbackCtrl'
                            }
                        }
                    })					
                    .state('app.CategoryList', {
                        cache: false,
                        url: '/categoryList/:categoryid/:name',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/categorylist.html',
                                controller: 'CategoryListCtrl'
                            }
                        }
                    })
                    .state('app.CategoryProductList', {
                        url: '/CategoryProductList/:categoryid/:name', //????
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/categoryproductlist.html',
                                controller: 'CategoryProductListCtrl'
                            }
                        }
                    })
                    .state('app.contact', {
                        url: '/contact',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/contact.html',
                                controller: 'contactCtrl'
                            }
                        }
                    })

                    .state('app.forgotPwd', {
                        url: '/forgotPwd',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/forgotPwd.html',
                                controller: 'forgotPwdCtrl'
                            }
                        }
                    })
                    .state('app.setting', {
                        url: '/setting',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/setting.html',
                                controller: 'settingCtrl'
                            }
                        }
                    })
                    .state('app.productDetail', {
                        url: '/productDetail/:productid',
                cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/productDetail.html',
                                controller: 'productDetailCtrl'
                            }
                        }
                    })
                    .state('app.searchResult', {
                        cache: false,
                        url: '/searchResult',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/searchResult.html',
                                controller: 'SearchResultCtrl'
                            }
                        }
                    })
                    .state('app.searchAdv', {
                        cache: false,
                        url: '/searchAdv', //高级查询
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/searchAdv.html',
                                controller: 'SearchAdvCtrl'
                            }
                        }
                    })
                    .state('app.cart', {
                        cache: false,
                        url: '/cart',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/cart.html',
                                controller: 'cartCtrl'
                            }
                        }
                    })
                    .state('app.frame', {
                        url: '/frame/:page',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/frame.html',
                                controller: 'FrameCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/home');

            $translateProvider.translations('ar_SA', ar_SA);
            $translateProvider.translations('uz_PK', uz_PK);
            $translateProvider.translations('en_US', en_US);
            if (Config.getLocale() == 'arabic') {
                $translateProvider.preferredLanguage('ar_SA');

            } else if (Config.getLocale() == 'UZ') {
                $translateProvider.preferredLanguage('uz_PK');

            } else {
                $translateProvider.preferredLanguage('en_US');
            }
        })

        .directive('onFinishRender', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function () {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            }

        });

window.onerror = function (e, file, line) {
    if (!Config.debug) {
        return;
    }
    alert([e, file, line].join(', '));
};


function setStorage(key, value) {
    localStorage.setItem(key, value);
}

function getStorage(key) {
    return localStorage.getItem(key);
}

function removeStorage(key) {
    localStorage.removeItem(key);
}

function explode(sep, string) {
    var res = string.split(sep);
    return res;
}

function urlencode(data) {
    return encodeURIComponent(data);
}

window.onload = function(){
 if ( Config.getLocale()=='arabic' || Config.getLocale()=='UZ') {
	 document.getElementById('lang_css').href = 'css/lang_sa.css';
 }
}