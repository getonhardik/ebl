	
angular.module('app.controllers', [])
        // �?��?�
        .controller('AppCtrl', function ($scope, $rootScope,
                $ionicModal, $ionicSlideBoxDelegate,$cordovaEmailComposer,
                $ionicTabsDelegate, $ionicLoading,
                $ionicPopup, $timeout, $state,
                $ionicSideMenuDelegate, $translate,
                $ionicPlatform, $ionicHistory) {
                    
            $translate(Object.keys(ar_SA)).then(function (translations) {
                $scope.translations = translations;
                $rootScope.translations = $scope.translations;
            });
//            $scope.lang_type='';
            $scope.dynamic_menus = {};
            $rootScope.service.get('menus', {}, function (results) {
                $scope.dynamic_menus = results;
               // console.log($scope.dynamic_menus);
            });
            $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();

            // Loading
            $scope.showLoading = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="spiral"></ion-spinner>'
                });
            };
            $scope.hideLoading = function () {
                $ionicLoading.hide();
            };

            // Alert dialog
            $scope.showAlert = function (_title, _content) {
                $ionicPopup.alert({
                    title: _title,
                    template: _content,
                    okType: 'button-assertive'
                });
            };

            $scope.menuClose = function (lang_type) {
                //alert(lang_type);
                if(lang_type == 'eng'){
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else{
                    $ionicSideMenuDelegate.toggleRight(false);
                }    
            };

            //首次欢迎页



            // 登录
            $scope.showLogin = function () {
                $scope.loginData = {};
                if (Config.getRememberme()) {
                    $scope.loginData.rememberme = true;
                    $scope.loginData.username = Config.getUsername();
                    $scope.loginData.password = Config.getPassword();
                }

                var popupLogin = $ionicPopup.show({
                    templateUrl: 'templates/login.html',
                    title: $scope.translations.login_title,
                    cssClass: 'login-container',
                    scope: $scope,
                    buttons: [
                        {text: $scope.translations.cancel},
                        {
                            text: $scope.translations.login,
                            type: 'button-assertive',
                            onTap: function (e) {
                                e.preventDefault();
                                if (!$scope.loginData.username || !$scope.loginData.password) {
                                    return;
                                }
                                $scope.showLoading();
                                $rootScope.service.get('login', $scope.loginData, function (res) {
                                    $scope.hideLoading();

                                    if (res.code || res.message) {
                                        $ionicPopup.alert(
                                        {
                                            title: 'Login',
                                            subTitle: res.message || res.code,
//                                            okType: 'buttonhk'
                                        }
                                        );
//                                        alert(res.message || res.code);
                                        return;
                                    }
                                    $scope.user = res;
                                    setStorage('user_id', res.id);
                                    Config.setRememberme($scope.loginData.rememberme);
                                    if ($scope.loginData.rememberme) {
                                        Config.setUsername($scope.loginData.username);
                                        Config.setPassword($scope.loginData.password);
                                    }
                                    else {
                                        Config.setUsername('');
                                        Config.setPassword('');
                                    }
                                    $scope.hideLogin();
                                });
                            }
                        }
                    ]
                });
                $scope.hideLogin = function () {
                    popupLogin.close();
                };
            };
            // 自动登录

            $scope.autoLogin = function () {
                $scope.loginData = {};
                var $username = Config.getUsername();
                if (Config.getRememberme() && $username.length > 0) {
                    $scope.loginData.username = Config.getUsername();
                    $scope.loginData.password = Config.getPassword();
                    $scope.showLoading();
                    console.log($scope.loginData);
                    $rootScope.service.get('login', $scope.loginData, function (res) {
                        $scope.login_status = true;
                        $scope.hideLoading();
                        if (res.code || res.message) {
                            //alert(res.message || res.code);
                            return;
                        }
                        setStorage('user_id', res.id);
                        $scope.user = res;
                    });
                }
            };

            // 获�?�用户信�?�
            $scope.getUser = function () {
                $scope.sessionData = {};
                $scope.sessionData.user_id = getStorage('user_id');
                $rootScope.service.get('user', $scope.sessionData, function (user) {
                    $scope.user = typeof user === 'object' ? user : null;
                });
            };
            $scope.getUser();
            if (!$scope.user) {
                $scope.autoLogin();
            }
            ;
            // 退出登录
            $scope.doLogout = function () {
                $scope.showLoading();
                $rootScope.service.get('logout', $scope.getUser);
                removeStorage('user_id');
                Config.setUsername('');
                Config.setPassword('');
                $timeout($scope.hideLoading(), 1000);
            };

            // 退出应用
            $scope.showExit = function () {
                $ionicPopup.confirm({
                    title: $scope.translations.confirm,
                    template: $scope.translations.exit_tip,
                    okType: 'button-assertive',
                    buttons: [
                        {text: $scope.translations.cancel},
                        {
                            text: $scope.translations.ok,
                            onTap: function (e) {
                                e.preventDefault();
                                navigator.app.exitApp();
                            }
                        }
                    ]
                });
            };

            $ionicPlatform.registerBackButtonAction(function () {
                if ($ionicHistory.currentStateName() === 'app.home') {
                    $scope.showExit();
                } else {
                    navigator.app.backHistory();
                }
            }, 100);

            // �?��?�索选项
            //text,textarea,date,boolean,multiselect,select,price,media_image,weee
            $rootScope.service.get('searchAdvField', {}, function (results) {
                var fields = [];

                for (var key in results) {
                    fields.push(results[key]);
                }
                $scope.searchFields = fields;
            });
        })



        // 注册

        .controller('loginCtrl', function ($scope, $rootScope, $ionicPopup, $timeout, $state, ngFB,$location,$translate) {
            $scope.loginData = {};
            if (Config.getRememberme()) {
                $scope.loginData.rememberme = true;
                $scope.loginData.username = Config.getUsername();
                $scope.loginData.password = Config.getPassword();
            }
            $scope.backtohome =function(){
                $location.path('/app/home');return;
            }
            //end �?�?
            $scope.show_hide_pw = function () {
                if ($('#show_hide_pw').is(":checked"))
                {
                    $("#password").attr("type", "text");
                } else {
                    $("#password").attr("type", "password");
                }
            };
            $scope.fbLogin = function () {
                ngFB.login({scope: 'email,read_stream,publish_actions'}).then(
                        function (response) {
                            console.log(response);
                            if (response.status === 'connected') {
                                console.log('Facebook login succeeded');
                                ngFB.api({
                                    path: '/me',
                                    params: {fields: 'id,first_name,last_name,email'}
                                }).then(
                                        function (user) {
                                            console.log(user);
                                            $scope.socialData = user;

                                            $rootScope.service.get('socialLogin', $scope.socialData, function (res) {
                                                $scope.hideLoading();
console.log('res is ');
console.log(res);
                                                if (res.status == true) {
                                                    $rootScope.user_data = res;
                                                    $scope.user = res;
                                                    setStorage('user_id', res.id);
                                                    $scope.getUser();
                                                    $state.go('app.home');
                                                    return;
                                                }

                                                $ionicPopup.alert(
                                                        {
                                                            title: 'error',
                                                            subTitle: res.errors,
                                                            okType: 'buttonhk'
                                                        }
                                                );
                                                //alert( res.errors);
                                            });
                                        },
                                        function (error) {

                                            $ionicPopup.alert(
                                                    {
                                                        title: 'Facebook error',
                                                        subTitle: error.error_description,
                                                        okType: 'buttonhk'
                                                    }
                                            );
                                            //alert('Facebook error: ' + error.error_description);
                                        });
                                //$scope.closeLogin();
                            } else {
                                $ionicPopup.alert(
                                        {
                                            title: 'Facebook error',
                                            subTitle: 'Facebook login failed',
                                            okType: 'buttonhk'
                                        }
                                );
                                //alert('Facebook login failed');
                            }
                        });
            };
            $scope.LoginwithFacebook = function () {
                console.log("clicked");
                $cordovaOauth.facebook("419763941691558", ["email"]).then(function (result) {
                    console.log(result);

                    alert("Auth Success..!!" + result);
                }, function (error) {
                    alert("Auth Failed..!!" + error);
                });
            };
            $scope.doLogin = function () {
                if (!$scope.loginData.username || !$scope.loginData.password) {

                    $ionicPopup.alert(
                            {
                                title: 'error',
                                subTitle: $translate.instant('Please_enter_username_password'),
                                okType: 'buttonhk'
                            }
                    );
                    //alert('Please enter username and password');
                    return;
                }
                $scope.showLoading();
                $rootScope.service.get('login', $scope.loginData, function (res) {
                    $scope.hideLoading();
                    console.log(res);

                    if (res.code || res.message) {

                        $ionicPopup.alert(
                                {
                                    title: 'error',
                                    subTitle: res.message,
                                    okType: 'buttonhk'
                                }
                        );
                        //alert(res.message || res.code);
                        return;
                    }
                    setStorage('user_name', res.name);
                    setStorage('user_email', res.email);
                    $scope.user = res;
                    setStorage('user_id', res.id);
                    Config.setRememberme($scope.loginData.rememberme);
                    if ($scope.loginData.rememberme) {
                        Config.setUsername($scope.loginData.username);
                        Config.setPassword($scope.loginData.password);
                    }
                    else {
                        Config.setUsername('');
                        Config.setPassword('');
                    }
                    $scope.getUser();
                    $state.go('app.home');
                    return;

                });
            };
        })
        .controller('wishlistCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaSocialSharing, $ionicPopup,$translate) {			
            var u_id = getStorage('user_id');
            var params = {
                user_id: u_id,
            };
            $scope.doDeletewishlist = function (p_id) {
				$scope.showLoading();
                //alert(p_id);
                var params = {
                    user_id: u_id,
                    product_id: p_id
                };

                $rootScope.service.get('removeWishlist', params, function (res) {
                    $scope.hideLoading();
					$ionicPopup.alert(
                            {
                                title: 'Success',
                                subTitle: res.message,
                                okType: 'buttonhk'
                            }
                    );
                    //alert(res.message);
                    $scope.wishlist_detail = res.data.items;
                    angular.extend($scope.wishlist_detail, res.data.items);
                    return;
                });
            };

            $rootScope.service.get('getwishlist', params, function (results) {
                console.log(results.items);
                $scope.wishlist_detail = results.items;
            });

        })
        .controller('address_bookCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicPopup,$translate) {
            //alert(123456789);
            var u_id = getStorage('user_id');
            $rootScope.address_detail = {};
            var params = {
                user_id: u_id,
            };
            $scope.doDeleteaddrbook = function () {
                $scope.showLoading();
                var params = {
                    user_id: u_id,
                };

                $rootScope.service.get('deleteAddress', params, function (results) {
                    $scope.hideLoading();
                    $ionicPopup.alert(
                            {
                                title: 'success',
                                subTitle: $translate.instant('Successfuly_deleted'),
                                okType: 'buttonhk'
                            }
                    );
                    //alert("Successfuly deleted");
                    $rootScope.address_detail = {};
                    angular.extend($rootScope.address_detail, $rootScope.address_detail);
                });
            }
            console.log("KP1");
            $rootScope.service.get('getAddress', params, function (results) {
                // console.log(results.data[0]);
                console.log("KP");
                $rootScope.address_detail = results.data[0];
                //console.log($scope.address_detail);
                // angular.extend($scope.address_detail, results.data[0]);
            });

        })

        .controller('daily_dealsCtrl', function ($scope, $rootScope, $state, $stateParams) {
            $rootScope.service.get('dailyDeals', function (results) {
                //console.log('deals is');
                console.log(results);
                $scope.lists = results;
            });
        })
        .controller('test_pushCtrl', function ($scope, $rootScope, $state, $stateParams,$ionicUser,$ionicPush,$translate) {
            
            $scope.identifyUser = function () {
                var user = $ionicUser.get();
                if (!user.user_id) {
                //alert(123);
                    // Set your user_id here, or generate a random one.
                    user.user_id = $ionicUser.generateGUID();
                }
                ;

                // Metadata
                angular.extend(user, {
                    name: 'Simon',
                    bio: 'Author of Devdactic'
                });

                // Identify your user with the Ionic User Service
                $ionicUser.identify(user).then(function () {
                    $scope.identified = true;
                    console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
                });
            };
            
            
            // Registers a device for push notifications
            $scope.pushRegister = function () {
                console.log('Ionic Push: Registering user');

                // Register with the Ionic Push service.  All parameters are optional.
                $ionicPush.register({
                    canShowAlert: true, //Can pushes show an alert on your screen?
                    canSetBadge: true, //Can pushes update app icon badges?
                    canPlaySound: true, //Can notifications play a sound?
                    canRunActionsOnWake: true, //Can run actions outside the app,
                    onNotification: function (notification) {
                        // Handle new push notifications here
                        return true;
                    }
                });
            };
            
            
        })
       .controller('about_usCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaEmailComposer) {

        })

        .controller('contactCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaEmailComposer,$ionicModal,$ionicPopup,$sce,$translate) {	
                                $scope.contactDetail = {};
                                console.log($scope.url);
                                $rootScope.service.get('contactDetail',function (res) {
                                    console.log("lat long");
                                    console.log(res);
                                    $scope.contactDetail = res.contactDetails;
                                    $scope.url = $sce.trustAsResourceUrl('https://www.google.com/maps/embed/v1/place?q='+res.contactDetails.coordinates.lat+','+res.contactDetails.coordinates.lng+'&key=AIzaSyBGoLQWOqGYdeojb1kaDyEsedZ8u9G9vzQ');
                                    
                                    
                                    //$scope.mapDetail =  $sce.trustAs(res.contactDetails);
                                });
				$ionicModal.fromTemplateUrl('templates/myform.html', {
				scope: $scope,
				animation: 'slide-in-up'
				}).then(function(modal) {
				$scope.modal = modal;
				});
				$scope.openModal = function(){
				$scope.modal.show();
				}
				$scope.closeModal = function(){
				$scope.modal.hide();
				}
				
				// $scope.scanBarcode = function() {
				$scope.carica = function() {
					$scope.showLoading();	
					var name = $('#name').val();
					var email = $('#email').val();
					var telephone = $('#telephone').val();
					var comment = $('#comment').val();
					
					if(name == ''){
						$scope.hideLoading();	
						$ionicPopup.alert(
							{	title: 'Error',subTitle: $translate.instant('please_enter_name'),okType: 'buttonhk'}
						);							
						return;
					}
					
					var atpos = email.indexOf("@");
					var dotpos = email.lastIndexOf(".");
					
					if(email == ''){
						$scope.hideLoading();	
						$ionicPopup.alert(
							{	title: 'Error',subTitle: $translate.instant('please_enter_email_id'),okType: 'buttonhk'}
						);	
						return;
					}else if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length) {
						$scope.hideLoading();	
						$ionicPopup.alert(
							{	title: 'Error',subTitle: $translate.instant('not_valid_email_address'),okType: 'buttonhk'}
						);
						return false;
					}
					if(telephone == ''){
						$scope.hideLoading();	
						$ionicPopup.alert(
							{	title: 'Error',subTitle: $translate.instant('please_enter_telephone'),okType: 'buttonhk'}
						);	
						return;
					}
					if(comment == ''){
						$scope.hideLoading();	
						$ionicPopup.alert(
							{	title: 'Error',subTitle: $translate.instant('please_enter_comment'),okType: 'buttonhk'}
						);	
						return;
					}
					
					
					var params = {
						name: name,
						email: email,
						telephone: telephone,
						comment: comment
					};
					
					$rootScope.service.get('contactUs', params, function (res) {					
						
						if(res.status == 'true'){
							$scope.modal.hide();
							$scope.hideLoading();
							$ionicPopup.alert(
								{
									title: 'success',
									subTitle: res.message,
									okType: 'buttonhk'
								}
							);							
						}else{
							$scope.hideLoading();
							$ionicPopup.alert(
								{
									title: 'fail',
									subTitle: $translate.instant('message_not_send'),
									okType: 'buttonhk'
								}
							);							
						}
						
					});
                                        
				}

        })
        .controller('editaddressbookCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaEmailComposer,$translate) {
            $scope.editaddrbookData = {};
            var u_id = getStorage('user_id');
            var params = {
                user_id: u_id,
            };

            $rootScope.service.get('getAddress', params, function (results) {
                console.log(results.data[0]);
                $scope.address_detail = results.data[0];
                $scope.editaddrbookData = {
                    firstname: $scope.address_detail.firstname,
                    lastname: $scope.address_detail.lastname,
                    street: $scope.address_detail.street,
                    city: $scope.address_detail.city,
                    region: $scope.address_detail.region,
                    postcode: $scope.address_detail.postcode,
                    telephone: $scope.address_detail.telephone

                }

            });
            $scope.doEditaddrbook = function () {

                $scope.editaddrbookData.user_id = getStorage('user_id');
                // console.log($scope.editaddrbookData);
                $rootScope.service.get('editAddress', $scope.editaddrbookData, function (res) {
                    angular.extend($rootScope.address_detail, $scope.editaddrbookData);
                    $state.go('app.address_book',{reload: true});

                    return;
                });

            }
        })
        .controller('leave_feedbackCtrl', function ($scope, $rootScope, $state, $stateParams) {
            //alert($stateParams.name);

        })
        .controller('my_accountCtrl', function ($scope, $rootScope, $state, $ionicPopup, $cordovaSocialSharing, $ionicPlatform,$translate) {
            console.log(getStorage('user_id'));
            if(getStorage('user_id') == null){
                $state.go('app.login');
                return;
            }
            console.log($rootScope.user_data);
            $scope.name = getStorage('user_name');
            $scope.email = getStorage('user_email');
            $scope.rateUs = function () {
                if ($ionicPlatform.is('ios')) {
                    window.open('itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id511364723?ls=1&mt=8'); // or itms://
                } else if ($ionicPlatform.is('android')) {
                    window.open('market://details?id=aicog2017.mobile.app', '_system');
                }
            }


        })
        .controller('CategoryListCtrl', function ($scope, $rootScope, $ionicPopup,$state, $stateParams, $translate,$window,$location) {        
            //alert($stateParams.name);
    $scope.catListname = $stateParams.name;
			$scope.listTitle = {
                daily_sale: 'latest_promotions',
                'new': 'common_products',
                cert_download: 'cert_download'
            }[$stateParams.cmd];
            $scope.listPge = 1;
            $scope.hasInit = false;
            $scope.loadOver = false;
            $scope.Math = window.Math;
            if ($stateParams.cmd === 'daily_sale') {
                $scope.lineClass = 'one-line';
            }

            var getList = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }

                var params = {
                    limit: 100,
                    page: $scope.listPge,
                    cat_id: $stateParams.categoryid,
                    cmd: 'submenu'
                };

                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists) {
                    console.log("list");
                    console.log(lists);

                    if (func === 'load') {
                        if (Array.isArray(lists) && lists.length) {
                            $scope.lists = $scope.lists.concat(lists);
                        } else {
                            $scope.loadOver = true;
                        }
                    } else {
                        $scope.hasInit = true;
                        $scope.lists = lists;
                        if (!localStorage['symbol']) {
                            localStorage['symbol'] = lists[0].symbol;
                        }
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                });

                $scope.hideLoading();
            };


            $scope.doRefresh = function () {
                getList('refresh', function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };

            getList('refresh');
            $scope.hideLoading();

        })

        .controller('CategoryProductListCtrl', function ($scope, $rootScope, $ionicPopup, $stateParams, $translate, $cordovaSocialSharing) {
//alert($stateParams.name);
            $scope.subcatname = $stateParams.name;
            $scope.listTitle = {
                daily_sale: 'latest_promotions',
                'new': 'common_products',
                cert_download: 'cert_download'
            }[$stateParams.cmd];
            $scope.listPge = 1;
            $scope.product_index = 1;
            $scope.hasInit = false;
            $scope.loadOver = false;
            $scope.Math = window.Math;
            if ($stateParams.cmd === 'daily_sale') {
                $scope.lineClass = 'one-line';
            }
			
			
			var u_id = getStorage('user_id');
			        
            var getList = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }

                var params = {
                    limit: 20,
                    page: $scope.listPge,
                    cat_id: $stateParams.categoryid,
					customerid: u_id,
                    cmd: 'by_category'
                };
                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists) {
                    if (func === 'load') {
                        if (Array.isArray(lists) && lists.length) {
                            
                            $scope.lists = $scope.lists.concat(lists);
                            console.log($scope.lists);
                        } else {
                            
                            $scope.loadOver = true;
                        }
                    } else {
                        //alert(123);
                        $scope.hasInit = true;
                        $scope.lists = lists;
                        if (!localStorage['symbol']) {
                            localStorage['symbol'] = lists[0].symbol;
                        }
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                });

                $scope.hideLoading();
            };
            
            $scope.doRefresh = function () {
                getList('refresh', function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            $scope.loadMore = function () {
                if (!$scope.hasInit || $scope.loadOver) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                }
                getList('load', function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };

            getList('refresh');
        })

        .controller('registerCtrl', function ($scope, $rootScope, $ionicPopup, $timeout, $state,$translate) {
            $scope.registerData = {};

            $scope.show_hide_pw = function () {
                //alert(123);
                if ($('#show_hide_pwr').is(":checked"))
                {
                    $("#passwordr").attr("type", "text");
                } else {
                    $("#passwordr").attr("type", "password");
                }
            };

            $scope.showPrivacy = function () {
                var popupPrivacy = $ionicPopup.show({
                    templateUrl: 'templates/privacy.html',
                    title: $scope.translations.term_privacy,
                    cssClass: 'privacy-container',
                    scope: $scope,
                    buttons: [
                        {text: $scope.translations.ok,
                            type: 'button-assertive'},
                    ]
                });
            };
            //end �?�?
            $scope.doRegister = function () {
                if (!$scope.registerData.firstname) {
                    $ionicPopup.alert({
                        title: 'error',
                        subTitle: $translate.instant("first_name_is_required"),
//                        subTitle: 'First name is required.',
                        okType: 'buttonhk'
                    });
                    return;
                }
                if (!$scope.registerData.middlename) {
                    $ionicPopup.alert({
                        title: 'error',
                        subTitle: $translate.instant("middle_name_is_required"),                        
//                        subTitle: 'Middle name is required.',
                        okType: 'buttonhk'
                    });
                    return;
                }
                if (!$scope.registerData.lastname) {
                    $ionicPopup.alert({
                        title: 'error',
                        subTitle: $translate.instant("last_name_is_required"),                        
//                        subTitle: 'Last name is required.',
                        okType: 'buttonhk'
                    });
                    return;
                }
                if (!$scope.registerData.email) {
                    $ionicPopup.alert({
                        title: 'error',
                        subTitle: $translate.instant("email_is_required"),                        
//                        subTitle: 'Email is required.',
                        okType: 'buttonhk'
                    });
                    return;
                }
                if (!$scope.registerData.password) {
                    $ionicPopup.alert({
                        title: 'error',
                        subTitle: $translate.instant("password_is_required"),                        
//                        subTitle: 'Password is required.',
                        okType: 'buttonhk'
                    });
                    return;
                }
                /*            if ($scope.registerData.password !== $scope.registerData.confirmation) {
                 alert($scope.translations.need_confirm_pwd );
                 return;
                 }
                 
                 if ($scope.validationCode !== $scope.registerData.validation_Code) {
                 alert( $scope.translations.need_confirm_vali );
                 return;
                 }
                 */
                $scope.fbRLogin = function () {
                    ngFB.login({scope: 'email,read_stream,publish_actions'}).then(
                            function (response) {
                                console.log(response);
                                if (response.status === 'connected') {
                                    console.log('Facebook login succeeded');
                                    ngFB.api({
                                        path: '/me',
                                        params: {fields: 'id,first_name,last_name,email'}
                                    }).then(
                                            function (user) {
                                                console.log(user);
                                                $scope.socialData = user;

                                                $rootScope.service.get('socialLogin', $scope.socialData, function (res) {
                                                    $scope.hideLoading();

                                                    if (res.status == true) {
                                                        $scope.user = res;
                                                        setStorage('user_id', res.id);
                                                        $scope.getUser();
                                                        $state.go('app.home');
                                                        return;
                                                    }
                                                    $ionicPopup.alert(
                                                            {
                                                                title: 'error',
                                                                subTitle: res.errors,
                                                                okType: 'buttonhk'
                                                            }
                                                    );
                                                    //alert( res.errors);
                                                });
                                            },
                                            function (error) {
                                                $ionicPopup.alert(
                                                        {
                                                            title: 'error',
                                                            subTitle: error.error_description,
                                                            okType: 'buttonhk'
                                                        }
                                                );
                                                //alert('Facebook error: ' + error.error_description);
                                            });
                                    //$scope.closeLogin();
                                } else {
                                    alert('Facebook login failed');
                                }
                            });
                };
                $scope.showLoading();
                $rootScope.service.get('register', $scope.registerData, function (res) {
                    $scope.hideLoading();

                    if (res.status == true) {
                        $ionicPopup.alert(
                                {
                                    title: 'success',
                                    subTitle: $translate.instant('register_successfully_done'),
                                    okType: 'buttonhk'
                                }
                        );
                        //alert('Register Successfully Done');
                        $scope.getUser();
                        $state.go('app.home');
                        return;
                    }

                    $ionicPopup.alert(
                            {
                                title: 'error',
                                subTitle: res.errors,
                                okType: 'buttonhk'
                            }
                    );

                });
            };
        })



        // 忘记密�?
        .controller('forgotPwdCtrl', function ($scope, $rootScope, $timeout, $state,$translate) {
            $scope.pwdData = {};
            ;
            $scope.hideLogin;

            $scope.myBack = function () {
                $state.go('app.home');
                $scope.showLogin();
            };

            $scope.getPwd = function () {
                if (!$scope.pwdData.email) {

                    alert($scope.translations.enter_email);
                    return;
                }
                $scope.showLoading();
                $rootScope.service.get('forgotpwd', $scope.pwdData, function (res) {
                    $scope.hideLoading();
                    if (res.code == '0x0000') {
                        alert($scope.translations.success + '\n\r' + res.message);
                        popupForgotPwd.close();
                        return;
                    }
                    alert($scope.translations.error_code + res.code + '\n\r' + res.message);
                });
            };
        })

        // 设置
        .controller('settingCtrl', function ($scope, $rootScope, $translate, $ionicHistory,$ionicPopup) {
            // 网站列表信�?�
            $scope.getWebsite = function () {
                $rootScope.service.get('website', function (website) {
                    $scope.languages = [];
                    for (var l in website['1'].webside['1'].view) {
                        $scope.languages.push(website['1'].webside['1'].view[l]);
                    }
                });
            };
            $scope.getWebsite();

            $scope.locale = Config.getLocale();

            $scope.changeLocale = function () {
                $scope.locale = this.language.store_code;
                if($scope.locale=='arabic'){
				   $translate.use('ar_SA');
				   document.getElementById('lang_css').href = 'css/lang_sa.css';
			}else {
				   $translate.use('en_US');
				   document.getElementById('lang_css').href = 'css/lang_en.css';
			}
                Config.setLocale($scope.locale);
                $rootScope.service.get('menus', {}, function (results) {
                    angular.extend($scope.dynamic_menus, results);
                    
                });
                $ionicPopup.alert(
                        {
                            title: 'Success',
                            subTitle: $translate.instant('lang_change_alert'),
                            okType: 'buttonhk'
                        }
                );

                $ionicHistory.clearCache();
//                window.location='';
            };
        })

        // 列表
        .controller('ListsCtrl', function ($scope, $rootScope, $stateParams, $translate) {
			
			$scope.showLoading();
			
            $scope.listTitle = {
                daily_sale: 'latest_promotions',
                'new': 'common_products',
                cert_download: 'cert_download'
            }[$stateParams.cmd];
            $scope.listPge = 1;
            $scope.hasInit = false;
            $scope.loadOver = false;
            if ($stateParams.cmd === 'daily_sale') {
                $scope.lineClass = 'one-line';
            }

            var getList = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }

                var params = {
                    limit: 20,
                    page: $scope.listPge,
                    cmd: $stateParams.cmd || 'catalog'
                };

                $rootScope.service.get('products', params, function (lists) {
                    if (func === 'load') {
                        if (Array.isArray(lists) && lists.length) {
                            $scope.lists = $scope.lists.concat(lists);
                        } else {
                            $scope.loadOver = true;
                        }
                    } else {
                        $scope.hasInit = true;
                        $scope.lists = lists;
                        if (!localStorage['symbol']) {
                            localStorage['symbol'] = lists[0].symbol;
                        }
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                });

                $scope.hideLoading();
            };

            $scope.doRefresh = function () {
                getList('refresh', function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            $scope.loadMore = function () {
                if (!$scope.hasInit || $scope.loadOver) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                }
                getList('load', function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };

            getList('refresh');
        })

        // 产�?详情
        .controller('productDetailCtrl', function ($scope, $rootScope, $timeout,
                $stateParams, $ionicPopup, $translate,
                $ionicSlideBoxDelegate, $ionicScrollDelegate,
                $cordovaSocialSharing, $ionicSideMenuDelegate) {
            
            console.log("State parames:"+$stateParams.productid);
			$scope.showLoading();
            
			$scope.qty = 1;
            $scope.totalPrice = 0;
			$scope.rate_price=1;
			$scope.rate_quality=1;
			$scope.rate_value=1;						
			
			$scope.ratingsObject = {
				iconOn : 'ion-ios-star',
				iconOff : 'ion-ios-star-outline',
				iconOnColor: 'rgb(255, 198, 0)',
				iconOffColor:  'rgb(255, 0, 0)',
				rating:  0,
				minRating:0,
				callback: function(rating) {
				  $scope.ratingsCallback(rating);
				}
		  	};
	
			$scope.ratingsCallback = function(rating) {
				$scope.rate_price = rating;
				console.log('Selected rating is : ', rating);
			};
			
			
			$scope.ratingsObject2 = {
				iconOn : 'ion-ios-star',
				iconOff : 'ion-ios-star-outline',
				iconOnColor: 'rgb(255, 198, 0)',
				iconOffColor:  'rgb(255, 0, 0)',
				rating:  0,
				minRating:0,
				callback: function(rating2) {
				  $scope.ratingsCallback2(rating2);
				}
		  	};
	
			$scope.ratingsCallback2 = function(rating2) {
				$scope.rate_quality = rating2;
				console.log('Selected rating is2 : ', rating2);
			};
			
			$scope.ratingsObject3 = {
				iconOn : 'ion-ios-star',
				iconOff : 'ion-ios-star-outline',
				iconOnColor: 'rgb(255, 198, 0)',
				iconOffColor:  'rgb(255, 0, 0)',
				rating:  0,
				minRating:0,
				callback: function(rating3) {
				  $scope.ratingsCallback3(rating3);
				}
		  	};
	
			$scope.ratingsCallback3 = function(rating3) {
					$scope.rate_value = rating3;
					console.log('Selected rating is3 : ', rating3);
			};

										
            $scope.updateSlider = function () {
                $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
            };

            // 物车商�?数�?
            $rootScope.service.get('cartGetQty', {
                product: $stateParams.productid
            }, function (res) {
                $rootScope.items_qty = res.items_qty;
            });

            // 商�?详情
			$scope.showLoading();
			var u_id = getStorage('user_id');
            var params = {
                customerid: u_id,
				productid: $stateParams.productid
            };
			
            $rootScope.service.get('productDetail', params, function (results) {
//                console.log("test");
//                console.log(results);
                                $scope.share_url = results.url_key;
                                if(results.is_in_stock){
                                    $scope.stock_detail = '';
                                    
                                }else{
                                    $scope.stock_detail_css = 'display:block !important';
                                    $scope.stock_detail = 'Out Of Stock';
                                }
				$rootScope.total_reviews_count=results.total_reviews_count;
                                $scope.additionalattr = results.addtionatt;
                                console.log(results.attributeOptions);
				$rootScope.reviews=results.reviews;
                  
               angular.forEach(results.productOption, function(value, key) {
  console.log(value);

  
  if(value.attribute_code=="shoe_size"){
      $scope.shoe_select = 1;
      $scope.dbs = results.attributeOptions.shoe_size;
                $scope.setSelected = function (id) {
                    $scope.db = id;
		    $scope.selected = id;					
                }

  }

  if(value.attribute_code=="size"){
     $scope.shoe_select = 2;
      $scope.dbs = results.attributeOptions.size;
                $scope.setSelected = function (id) {
                    $scope.db = id;
		    $scope.selected = id;					
                }

  }
  if(value.attribute_code=="color"){
       $scope.dbs2 = results.attributeOptions.color;
                $scope.setSelected2 = function (id) {
                    $scope.db2 = id;
		    $scope.selected2 = id;
              	}
  }    
});
               
                

               
                $scope.product = results;
                    //console.log($scope.product);
                $scope.totalPrice = +$scope.product.final_price_with_tax;
                $scope.oldPrice = +$scope.product.regular_price_with_tax;

                //�?�商�?选项
                if (results.has_custom_options) {
                    $rootScope.service.get('productOption', {
                        productid: $stateParams.productid
                    }, function (option) {
                        $scope.productOption = option;
                        $timeout($scope.updatePrice, 0);
                    });
                }
                $scope.hideLoading();
            });

			$scope.showReview = function() {				
				$scope.toggleGroup(2);
				var myDiv = document.getElementById('reviewcontainer');
				myDiv.scrollTop = 0;
						
			}

			//rating
			$scope.carica = function() {	
						
				var u_id = getStorage('user_id');	
				if(u_id == null || u_id == ''){
					$ionicPopup.alert( 
					{
							title: 'error',
							subTitle: $translate.instant('login_first'),
							okType: 'buttonhk'
						}
					);		
				}else{
					$scope.showLoading();	
					var title = $('#title').val();
					var review = $('#review').val();
					var productid = $('#productid').val();
					
					var params = {
						customerid: u_id,
						productid: productid,
						rate_price: $scope.rate_price,
						rate_quality: $scope.rate_quality,
						rate_value: $scope.rate_value,
						title: title,
						review: review,
					};
					
										
					
					$rootScope.service.get('rateAndReview', params, function (res) {
						$scope.hideLoading();			
						if(res.code == '0'){	
							$rootScope.total_reviews_count=res.data.total_reviews_count;
						 //angular.extend($rootScope.total_reviews_count, res.data.total_reviews_count);
						 //angular.extend($rootScope.reviews, res.data.reviews);		
						 $rootScope.reviews = res.data.reviews;
						 $('#title').val('') ;
						 $('#review').val('');
						 /*
						 $scope.ratingsObject = {rating:  1}
						 $scope.ratingsCallback2(0);
						 $scope.ratingsCallback2(0);
						 $scope.ratingsCallback3(0);*/
						 //console.log($scope.product.total_reviews_count);						 
							$ionicPopup.alert(
								{
									title: 'success',
									subTitle: res.message,
									okType: 'buttonhk'
								}
							);	
												
						}else{
							$ionicPopup.alert(
								{
									title: 'fail',
									subTitle: res.message,
									okType: 'buttonhk'
								}
							);							
						}
						
					});
				}
			
			}
		
			
            
             $rootScope.service.get('productoptions', {
                productid: $stateParams.productid
            }, function (lists) {
                $scope.productoptions = lists;
            });
            // 商�?图片
            $rootScope.service.get('productImg', {
                product: $stateParams.productid
            }, function (lists) {
                console.log('images');
                console.log(lists);
                $scope.productImg = lists;
            });

           

            // 全�?幕图片
            $scope.imageFullscreen = function () {
                var toggle = 1;

                $scope.getCurrentSlideIndex = function () {
                    return $ionicSlideBoxDelegate.currentIndex();
                };
                $scope.updateFullscreenSlider = function () {
                    $ionicSlideBoxDelegate.$getByHandle('image-fullscreen-viewer').update();
                };
                $scope.zoomProductImg = function () {
                    if (toggle === 1) {
                        toggle = 2;
                        $ionicScrollDelegate.$getByHandle('image-scroll').zoomTo(toggle);
                    } else {
                        toggle = 1;
                        $ionicScrollDelegate.$getByHandle('image-scroll').zoomTo(toggle);
                    }
                };
                $scope.noZoom = function () {
                    $ionicScrollDelegate.$getByHandle('image-scroll').zoomTo(1);
                };

                //直接用template，会出现图片无法垂直居中的问题
                var myt = '<ion-content overflow-scroll="true">'
                        + '<ion-slide-box delegate-handle="image-fullscreen-viewer" on-slide-changed="noZoom()" show-pager="true" active-slide="'
                        + $ionicSlideBoxDelegate.currentIndex()
                        + '"><ion-slide ng-repeat="img in productImg" ng-init="updateFullscreenSlider()">'
                        + '<ion-scroll overflow-scroll="true" delegate-handle="image-scroll" zooming="true" direction="xy" locking="false" scrollbar-x="false" scrollbar-y="false" min-zoom="1" id="scrolly"  style="width: 100%; height: 100%;">'
                        + '<img id="zoomImg" class="fullwidth" ng-src="{{img.url}}"  on-double-tap="zoomProductImg()">'
                        + '<span></span>'
                        + '</ion-scroll>'
                        + '</ion-slide></ion-slide-box>';
                +'</ion-content>';
                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: myt,
                    cssClass: 'popupFullscreen',
                    scope: $scope,
                    buttons: [
                        {text: 'X',
                            type: 'button-dark', },
                    ]
                });
                /*
                 $ionicPopup.show({
                 templateUrl: 'templates/productImg.html',
                 cssClass: 'popupFullscreen',
                 scope: $scope,
                 buttons: [
                 {
                 text: 'X',
                 type: 'button-dark'
                 }
                 ]
                 });
                 */
            };

            // 增�?数�?�?作
            $scope.qtyAdd = function () {
                $scope.qty++;
            };
            $scope.qtyMinus = function () {
                if ($scope.qty > 1) {
                    $scope.qty--;
                }
            };
            $scope.$watch('qty', function () {
                $timeout($scope.updatePrice, 0);
            });

            // 选择列表
            $scope.selectOptions = {};
            $scope.selectOption = function (name) {
                $scope.selectOptions[name + this.$parent.option.option_id] = this.item.option_type_id;
                $timeout($scope.updatePrice, 0);
            };

            $scope.updatePrice = function () {
                if (!$scope.product) {
                    return;
                }
                $scope.totalPrice = +$scope.product.final_price_with_tax;
                $scope.oldPrice = +$scope.product.regular_price_with_tax;
                // field
                $('[ng-switch-when="field"]').find('[data-price]').each(function () {
                    $scope.totalPrice += +$(this).data('price');
                    $scope.oldPrice += +$(this).data('price');
                });
                //drop_down
                $('[ng-switch-when="drop_down"] select').each(function () {
                    $scope.totalPrice += +$(this).find(':selected').data('price') || 0;
                    $scope.oldPrice += +$(this).find(':selected').data('price') || 0;
                });
                // check
                $('[ng-switch-when="checkbox"] input:checked').each(function () {
                    $scope.totalPrice += +$(this).data('price') || 0;
                    $scope.oldPrice += +$(this).data('price') || 0;
                });
                // radio
                $('[ng-switch-when="radio"] span.selected').each(function () {
                    $scope.totalPrice += +$(this).data('price') || 0;
                    $scope.oldPrice += +$(this).data('price') || 0;
                });
                // qty
                $scope.totalPrice *= $scope.qty;
                $scope.oldPrice *= $scope.qty;
            };

            // 增加到购物车
            $scope.doCartAdd = function () {
//                alert($stateParams.productid);
				$scope.showLoading();
                var queryString = $('#product_addtocart_form').formParams();
                console.log(queryString);
                if (!($scope.qty > 1)) {
                    $scope.qty = 1;
                }
                $rootScope.service.get('cartAdd', queryString, function (res) {
                    $scope.hideLoading();
					if (res.result == 'error') {
                        $ionicPopup.alert({
                        title: 'error',
                        subTitle: res.message,
                        okType: 'buttonhk'
                        });
                        return;
                    }
                    if (res.result == 'success') {
                        $scope.hideLoading();
						$ionicPopup.alert({
                        title: 'Success',
                        subTitle: $translate.instant('successfully_added'),
                        okType: 'buttonhk'
                        });
                        $rootScope.items_qty = res.items_qty;
                        return;
                    }
                });
            };
           
            $scope.Math = window.Math;
            $scope.groups = [];
            for (var i = 0; i < 1; i++) {
                $scope.groups[i] = {
                    name: i,
                    items: []
                };
                for (var j = 0; j < 1; j++) {
                    $scope.groups[i].items.push(i + '-' + j);
                }
            }

            /*
             * if given group is the selected group, deselect it
             * else, select the given group
             */
            $scope.toggleGroup = function (group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function (group) {
                return $scope.shownGroup === group;
            };

			var u_id = getStorage('user_id');

            $stateParams = '';
            $scope.listTitle = {}[$stateParams.cmd];
            $scope.listPge = 1;
            $scope.hasInit = false;
            $scope.loadOver = false;

			$scope.dataLoaded2 = false;
            
            var getList = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }
                var params = {
                    limit: 5,
                    page: $scope.listPge,
					customerid: u_id,
                    cmd: $stateParams.cmd || 'new'
                };
                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists_new) {
                    $scope.hasInit = true;
//                    console.log('lists_new');
                    console.log(lists_new);
                    $scope.lists_new = lists_new;
                    $timeout(function () {
                        $scope.dataLoaded2 = true;
                    });

                });
                $scope.hideLoading();
            };
            getList('refresh');

            

        })

        // home中，�?�banner，快速�?�索
        .controller('HomeCtrl', function ($scope, $rootScope, $state, $ionicSlideBoxDelegate,$ionicSideMenuDelegate, $timeout,$ionicPopup,$stateParams,$cordovaSocialSharing,commonFunction,$translate) {
            $rootScope.items_qty=parseInt($rootScope.items_qty) || 0;
           
      $scope.toggleSlideMenu = function () {
       
          if(Config.getLocale()=='default'){
                console.log('move lft');
               $ionicSideMenuDelegate.toggleLeft();
           }else{
                console.log('move right');
               $ionicSideMenuDelegate.toggleRight();
              
           }  
          };
            
                    console.log($rootScope.items_qty);
                    $scope.searchData = {};
            $rootScope.service.get('cartGetQty', {
                product: $stateParams.productid
            }, function (res) {
 //               $rootScope.items_qty = res.items_qty;
//                $scope.items_qty = res.items_qty;
            });
									            
            /*khunt*/
            $scope.Math = window.Math;
            $scope.loading1 = true;
            $stateParams = '';
            $scope.listTitle = {}[$stateParams.cmd];
            $scope.listPge = 1;
            $scope.hasInit = false;
            $scope.loadOver = false;

            $scope.dataLoaded1 = false;
            $scope.dataLoaded2 = false;
            $scope.dataLoaded3 = false;
            $scope.dataLoaded4 = false;
			
			var u_id = 0;
			var u_id = getStorage('user_id');
		 var params = {
                    block: 'mobile-app-home-banner1',
                };
                $rootScope.service.get('getBannerBlock', params, function (lists_catalog) {
                    $scope.banners1 = lists_catalog;
                }); 
                 var params = {
                    block: 'mobile-app-home-banner2',
                };
                $rootScope.service.get('getBannerBlock', params, function (lists_catalog) {
                    $scope.banners2 = lists_catalog;
                }); 
            var getList = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }
                var params = {
                    limit: 5,
                    page: $scope.listPge,
					customerid: u_id,
                    cmd: $stateParams.cmd || 'new'
                };
                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists_new) {
//                    console.log('test');
//                    console.log(lists_new);
                    $scope.hasInit = true;
                    $scope.lists_new = lists_new;
                    $timeout(function () {
                        $scope.dataLoaded2 = true;
                    });

                });
                $scope.hideLoading();
            };
            getList('refresh');

            var getList2 = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }
                var params = {
                    limit: 5,
                    page: $scope.listPge,
					customerid: u_id,
                    cmd: $stateParams.cmd || 'best_seller',
                    user_id:getStorage('user_id'),
                };
                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists_best) {
                    $scope.hasInit = true;
                    $scope.lists_best = lists_best;
                    $timeout(function () {
                        $scope.dataLoaded3 = true;
                    });
                });
                $scope.hideLoading();
            };
            getList2('refresh');

            var getList3 = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }
                var params = {
                    limit: 5,
                    page: $scope.listPge,
					customerid: u_id,
                    cmd: $stateParams.cmd || 'daily_sale'
                };
                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists_daily) {
                    $scope.hasInit = true;
                    $scope.lists_daily = lists_daily;
                    $scope.loading1 = false;
                    $timeout(function () {
                        $scope.dataLoaded1 = true;
                    });
                });
                $scope.hideLoading();
            };
            getList3('refresh');

            var getList4 = function (func, callback) {
                if (func === 'load') {
                    $scope.listPge++;
                } else {
                    $scope.listPge = 1;
                }
                var params = {
                    limit: 5,
                    page: $scope.listPge,
					customerid: u_id,
                    cmd: $stateParams.cmd || 'catalog'
                };
                $timeout(function () {
                    $('#menu_bar').removeClass('hide');
                },1000);

                $scope.showLoading();
                $rootScope.service.get('products', params, function (lists_catalog) {
                    
                    $scope.hasInit = true;
                    $scope.lists_catalog = lists_catalog;
                    $timeout(function () {
                        $scope.dataLoaded4 = true;
                    });
                });
                $scope.hideLoading();
            };
            getList4('refresh');

            //daily_sale
            /*end khunt*/
            //快速�?�索
            $scope.onSearch = function () {
                if (!$scope.searchData.text) {
                    return;
                }
                $rootScope.search = {
                    type: 'search',
                    params: {
                        q: $scope.searchData.text
                    }
                };
                $state.go('app.searchResult');
            };
            
                        
           
            
        })

        // 高级�?�索
        .controller('SearchAdvCtrl', function ($scope, $rootScope, $state,$translate) {
            $scope.searAdvData = {};
            $scope._xingzhuang = '';
            // �?�目录选项
            $rootScope.service.get('menus', {}, function (results) {
                var cat_field = [];

                for (var key in results) {
                    cat_field.push(results[key]);
                }
                $scope.cat_field = cat_field;
            });
            $scope._xingzhuang = '';
            $scope.optionChange = function () {
                if (this.field.code === 'a_xingzhuang') {
                    var $shape = $('select[name="' + this.field.code + '"]'),
                            shape = $.trim($shape.find('option:selected').text());

                    if (shape == $scope.translations.All) {
                        $scope._xingzhuang = '';
                    } else {
                        $scope._xingzhuang = '(' + shape + ')';
                    }
                }
            };

            $scope.onReset = function () {
                $scope._xingzhuang = '';
            };

     		 var u_id = getStorage('user_id');	
            $scope.onSearch = function () {
                var params = $('#searAdv').formParams();
				params['customerid'] = u_id;
//                params['a_guige'] = params['a_guige'].substring(7);
                $rootScope.search = {
                    type: 'searchAdv',
                    params: params
                };
                $state.go('app.searchResult');
            };
        })

        // �?�索结果
        .controller('SearchResultCtrl', function ($scope, $rootScope,$translate) {
			
            if (!$rootScope.search) {
                return;
            }
            if ($rootScope.search.type === 'search') {
                $scope.searchTitle = $scope.translations.quick_search +
                        $scope.translations.colon + $rootScope.search.params.q;
            } else {
                $scope.searchTitle = $scope.translations.product_searchadv;
            }

            $scope.page = 1;
            var getList = function (func, callback) {
                if (func === 'load') {
                    $scope.page++;
                } else {
                    $scope.page = 1;
                }
                $rootScope.search.params.page = $scope.page;
                $rootScope.service.get($rootScope.search.type, $rootScope.search.params, function (results) {
                    if (func === 'load') {
                        if (Array.isArray(results.productlist) && results.productlist.length) {
                            $scope.results = $scope.results.concat(results.productlist);
                        } else {
                            $scope.loadOver = true;
                        }
                    } else {
                        $scope.hasInit = true;
                        if (Array.isArray(results.productlist) && results.productlist.length) {
                            $scope.results = results.productlist;
                        } else {
                            $scope.noProductFound = true;
                        }
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            };
			
						
			$scope.doWhishlistAdd = function (p_id) {
                var u_id = getStorage('user_id');
                var params = {
                    product: p_id,
                    user_id: u_id,
                };
                $scope.showLoading();
                $rootScope.service.get('addwishlist', params, function (res) {
                    console.log(res);
                    if (res.status == 'error') {
                        $scope.hideLoading();
                        $ionicPopup.alert({
                        title: 'Error',
                        subTitle:res.message,
                        okType: 'buttonhk'
                    });
                        return;
                    }
                    if (res.status == 'SUCCESS') {
                        $scope.hideLoading();
                        $('#wishlist_'+p_id).attr('src','img/icon-24.png');
                        $rootScope.items_qty = res.items_qty;
                        return;
                    }
                });
            };
			
			

            $scope.doRefresh = function () {
                getList('refresh', function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            $scope.loadMore = function () {
                if (!$scope.hasInit || $scope.loadOver) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                }
                getList('load', function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };
            getList('refresh');
        })

        // �?书下载
        .controller('certCtrl', function ($scope, $rootScope,$translate) {
            // �?��?书列表选项
            $rootScope.service.get('certGet', {}, function (results) {
                var certList = [];

                for (var key in results.articlelist) {
                    certList.push(results.articlelist[key]);
                }
                $scope.certList = certList;
            });
        })
        // 购物车
		.controller('cartCtrl', function ($scope, $rootScope,$state, $stateParams, $timeout,$ionicPopup,$translate) {
            // �?��?书列表选项
            $rootScope.service.get('cart', {}, function (results) {
                var cartList = [];

                console.log(results);
                for (var key in results.cart_items) {
                    cartList.push(results.cart_items[key]);
                }
                $scope.cartList = cartList;
                var subtotal = 0;
                $scope.symbol = localStorage['symbol'];
                $.each(results.cart_items, function( index, value ) {
                    subtotal = subtotal + (value.item_price * value.qty);
                });
                $scope.subtotal_value = subtotal;
                $scope.tax_value = 0.00;
                $scope.grandTotal_value = $scope.subtotal_value + $scope.tax_value;
            });
            
			$scope.qty = 1;
			$rootScope.service.get('cartGetQty', {
                product: $stateParams.productid
            }, function (res) {
                $rootScope.items_qty = res.items_qty;
            });
			
			$scope.qtyAdd = function () {
                $scope.qty++;
            };
            $scope.qtyMinus = function () {
                if ($scope.qty > 1) {
                    $scope.qty--;
                }
            };
            $scope.$watch('qty', function () {
                $timeout($scope.updatePrice, 0);
            });
			
			
            $scope.doRemoveFromCart = function(item_id){
                console.log("item id is "+item_id);
                var params = {
                    cart_item_id: item_id,
                };
                $scope.showLoading();
                $rootScope.service.get('removecart',params , function (results) {
                    console.log("results are" +results);
                    $scope.hideLoading();
                    $ionicPopup.alert({
                        title: 'Success',
                        subTitle: $translate.instant("successfully_removed"),
                        okType: 'buttonhk'
                    });
                    $state.reload();
                    console.log('reload completed');
                    return;
                });
            }
             $scope.doaddwishlistformcart = function (item_id,p_id) {
                var u_id = getStorage('user_id');
                var params = {
                    product: p_id,
                    user_id: u_id,
                };
                $scope.showLoading();
                $rootScope.service.get('addwishlist', params, function (res) {
                    console.log(res);
                    if (res.status == 'error') {
                        $scope.hideLoading(); 
                        $ionicPopup.alert(
                                {
                                    title: 'Error',
                                    subTitle: res.message,
	                                okType: 'buttonhk'
                                }
                        );
                        return;
                    }
                    if (res.status == 'SUCCESS') {
                        $scope.hideLoading();                       
                        $rootScope.items_qty = res.items_qty;
                        var params = {
                            cart_item_id: item_id,
                        };
                        $rootScope.service.get('removecart',params , function (results) {
                            $state.reload();
                            return;
                        });                        
                        return;
                    }
                        });
            };
			
			
			$scope.Math = window.Math;
            $scope.groups = [];
            for (var i = 0; i < 1; i++) {
                $scope.groups[i] = {
                    name: i,
                    items: []
                };
                for (var j = 0; j < 1; j++) {
                    $scope.groups[i].items.push(i + '-' + j);
                }
            }
		  $scope.toggleGroup = function(group) {
			if ($scope.isGroupShown(group)) {
			  $scope.shownGroup = null;
			} else {
			  $scope.shownGroup = group;
			}
		  };
		  $scope.isGroupShown = function(group) {
			return $scope.shownGroup === group;
		  };
            
        })
        // 附近�?销商
        .controller('SearchAgentCtrl', function ($scope, $rootScope, $state,$translate) {
            $scope.searchData = {
                //address: $scope.translations.current_position,
                address: '广州',
                radius: 200
            };

            $scope.onSearch = function () {
                if (!$scope.searchData.address) {
                    return;
                }
                var myGeo = new BMap.Geocoder();
                myGeo.getPoint($scope.searchData.address, function (point) {
                    if (point) {
                        $rootScope.agent = {
                            title: $scope.searchData.address,
                            params: $.extend({}, {
                                radius: $scope.searchData.radius
                            }, point)
                        };
                        $state.go('app.agents');
                    } else {
                        $ionicPopup.alert({
                            title: 'Error',
                            subTitle: $scope.translations.position_not_found,
                            okType: 'buttonhk'
                        });

//                        alert($scope.translations.position_not_found);
                    }
                });
            };
        })

        .controller('AgentsCtrl', function ($scope, $rootScope, $ionicPopup, $timeout,$translate) {
            if (!$rootScope.agent) {
                return;
            }
            $scope.titleText = $rootScope.agent.title;
            $rootScope.service.get('searchAgent', $rootScope.agent.params, function (res) {
                $scope.agentList = res;
            });

            $scope.showAgent = function () {
                $scope.agent = this.agent;
                $ionicPopup.show({
                    templateUrl: 'templates/agent.html',
                    title: this.agent.store_name,
                    cssClass: 'agent-container',
                    scope: $scope,
                    buttons: [{
                            text: $scope.translations.ok,
                            type: 'button-assertive',
                        }, ]
                });
            };

            $scope.showMap = function () {
                if (!$('#map').length) {
                    setTimeout($scope.showMap, 100);
                    return;
                }
                $('#map').parent().html('<div id="map"></div>');

                setTimeout(function () {
                    var map = new BMap.Map('map'),
                            point = new BMap.Point($rootScope.agent.params.lng, $rootScope.agent.params.lat);
                    if ($rootScope.agent.params['radius'] > 0) {
                        $scope.zoomLevel = 13;
                    }
                    if ($rootScope.agent.params['radius'] > 10) {
                        $scope.zoomLevel = 11;
                    }
                    if ($rootScope.agent.params['radius'] > 20) {
                        $scope.zoomLevel = 9;
                    }
                    if ($rootScope.agent.params['radius'] > 50) {
                        $scope.zoomLevel = 8;
                    }
                    if ($rootScope.agent.params['radius'] > 200) {
                        $scope.zoomLevel = 6;
                    }
                    if ($rootScope.agent.params['radius'] > 500) {
                        $scope.zoomLevel = 5;
                    }

                    //1000公里用5，500公里用5，200的用6，100公里用8，50公里用8，20公里用9，10公里用11，5公里内用13，
                    map.centerAndZoom(point, $scope.zoomLevel);

                    var point = new BMap.Point($rootScope.agent.params.lng, $rootScope.agent.params.lat),
                            icon = new BMap.Icon('img/position.png', new BMap.Size(32, 32)),
                            label = new BMap.Label($rootScope.agent.title, {offset: new BMap.Size(20, -10)}),
                            marker = new BMap.Marker(point, {icon: icon});
                    map.addOverlay(marker);
                    marker.setLabel(label);

                    $scope.agentList.forEach(function (item) {
                        var point = new BMap.Point(item.lng, item.lat),
                                marker = new BMap.Marker(point),
                                label = new BMap.Label(item.store_name, {offset: new BMap.Size(20, -10)});

                        map.addOverlay(marker);
                        marker.setLabel(label);
                    });
                }, 100);
            };
        })

        .controller('FrameCtrl', function ($scope, $sce, $stateParams) {
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            };

            var frame = Config.frames[$stateParams.page];
            $scope.title = $scope.translations[$stateParams.page];
            $scope.src = Config.baseUrl + Config.getLocale() + frame.src;
        })
        .controller('orderDetailsCtrl', function ($scope,$ionicPopup,$state,$rootScope, $sce, $stateParams,$translate) {
            if(getStorage('user_id') == null){
                $ionicPopup.alert(
                        {
                            title: 'Order',
                            subTitle: $translate.instant("order_create_success"),
                            okType: 'buttonhk'
                        }
                );
                
                $state.go('app.home');
                return;
            }
			$scope.showLoading();
            var u_id = getStorage('user_id');
            var params = {
                customerid: u_id,
            };
            $rootScope.service.get('order', params, function (res) {
                console.log(res);
                $scope.orders = res;
				$scope.hideLoading();
            });
        })
		
		.controller('orderdataCtrl', function ($scope, $rootScope, $sce, $stateParams,$translate) {
			$scope.showLoading();
			var params = {
                orderid: $stateParams.orderid,
            };
			$rootScope.service.get('myOrderDetail', params, function (res) {
                console.log(res);
                $scope.order = res;
				$scope.hideLoading();
            });
			
			$scope.Math = window.Math;
             $scope.groups = [];
            for (var i = 0; i < 1; i++) {
                $scope.groups[i] = {
                    name: i,

                    items: []
                };
                for (var j = 0; j < 1; j++) {
                    $scope.groups[i].items.push(i + '-' + j);
                }
            }
		  $scope.toggleGroup = function(group) {
			if ($scope.isGroupShown(group)) {
			  $scope.shownGroup = null;
			} else {
			  $scope.shownGroup = group;
			}
		  };
		  $scope.isGroupShown = function(group) {
			return $scope.shownGroup === group;
		  };
			
			
					
		})
		
.controller('paypalCtrl', function ($scope, $rootScope,$ionicPopup, $sce, $stateParams,PaypalService,$location,$translate) {
    //alert(123);
			var u_id = getStorage('user_id');					
			var quoteid = getStorage('quoteid');					
			var params = {
				customerid: u_id,
			};
			
//			$scope.price = $rootScope.grand_total_paypal;
			$scope.price = 1;
                        $scope.produit = 'Ebranch Shop';
                        console.log("init paapal before");
                        $scope.currency = "USD";
                        $scope.sale = "SALE";
			PaypalService.initPaymentUI().then(function () {
				PaypalService.makePayment($scope.price, $scope.produit,$scope.currency,$scope.sale)
				.then(function (response) {
                                    console.log(response);
                                    //res = JSON.stringify(response);
                                            $ionicPopup.alert(
                                                    {
                                                        title: 'Paypal Success',
                                                        subTitle: "Payment success with Id:"+response.response.id,
                                                        okType: 'buttonhk'
                                                    }
                                            );
                                        var params = {
                                            customerid: u_id,
                                            quoteid:quoteid,
                                            paymethod:'paypal_express',
                                            paymentData:response,
                                            txid:response.response.id
                                        };
					//alert(JSON.stringify(response));
                                        $rootScope.service.post('placeorder', params, function (res) {
                                            res=JSON.parse(res);
                                            console.log('placeOrder:');
                                            console.log(res);
                                            //alert(JSON.stringify(res));
                                            removeStorage(quoteid);
                                            $location.path('/app/orderDetails');
                                        });
                                        
//                                          $location.path('/app/home');
                                            return;
				},function (error) {
                                            $ionicPopup.alert(
                                                    {
                                                        title: 'Paypal Error',
                                                        subTitle: $translate.instant('Paypal_error'),
                                                        okType: 'buttonhk'
                                                    }
                                            );

//                                alert("error"+JSON.stringify(error));
			});
		});
			var params = {
				customerid: u_id,
			};
			
			$rootScope.service.get('order', params, function (res) {
				console.log(res);
				$scope.orders = res;
			});
		})
					
		
					
		
		.controller('checkoutCtrl', function ($scope, $rootScope, $sce,$ionicPopup, $state,$stateParams,$location,$translate) {
                    var city_list = {};
                    $scope.subtotal = 0;
                    $scope.registerData = {};
                    $scope.gift = {};
                    $scope.shipData = {};
                    $scope.gift_add_button = function(){
                        if ($('#gift_add').prop('checked')) {
                            $('#gift_detail').removeClass('hide');
                        }else{
                            $('#gift_detail').addClass('hide');
                        }
                    }
                    
                    $scope.shipping_price = 0;
			var u_id = getStorage('user_id');					
			var params = {
				customerid: u_id,
			};

                    $scope.gotologin = function(){
                        $state.go('app.login');
                        return;
                    }

			$scope.Math = window.Math;
             $scope.groups = [];
            for (var i = 0; i < 1; i++) {
                $scope.groups[i] = {
                    name: i,
                    items: []
                };
                for (var j = 0; j < 1; j++) {
                    $scope.groups[i].items.push(i + '-' + j);
                }
            }
		  $scope.toggleGroup = function(group) {
			if ($scope.isGroupShown(group)) {
			  $scope.shownGroup = null;
			} else {
			  $scope.shownGroup = group;
			}
		  };
		  $scope.isGroupShown = function(group) {
			return $scope.shownGroup === group;
		  };
                  // console.log(params);
                  
//                  if(u_id>0){
                        var params = {
                                user_id: u_id,
                        };
                    $rootScope.service.get('getAddress', params, function (results) {
                        console.log(results.data[0]);
                        console.log("KP");
                        console.log(results.data.country);
                        $scope.registerData = results.data[0];
                        if(u_id>0){
                        $scope.registerData.email = getStorage('user_email');}
                        $scope.country = results.data.country;
                        
                        city_list = results.data.city;
                        console.log($scope.country);
                        // angular.extend($scope.address_detail, results.data[0]);
                    });
//                  }
                  $scope.select_city = function(){
                      //alert($("#bcountry").val());
                          var city_point = $("#bcountry").val();
                          $scope.city = city_list[city_point];
                          //console.log(city_list);
                  }
                  $scope.select_ship_city = function(){
//                      alert($("#scountry").val());
                          var city_point = $("#scountry").val();
                          $scope.city1 = city_list[city_point];
                          console.log(city_list[city_point]);
                  }
            $rootScope.service.get('cart', params, function (results) {
                console.log("test");
                console.log(results);
                subtotal1 = 0;
                $scope.order_review_data = results.cart_items;
                if(results.cart_items_count == null){
                    $ionicPopup.alert(
                            {
                                title: 'Cart Message',
                                subTitle: $translate.instant('cart_is_empty'),
                                okType: 'buttonhk'
                            }
                    );
                }
                $.each(results.cart_items, function( index, value ) {
                    subtotal1 = subtotal1 + (value.item_price * value.qty);
                });
                $scope.subtotal = subtotal1;
                $rootScope.grand_total_paypal = subtotal1; 
            });
            
//            alert($(".biiling_rbutton").val());
            if((getStorage('user_id')) != null){
                
                $("#login_item1").addClass('hide');
            }else{
                $("#login_item1").removeClass('hide');
            }
            $scope.biiling_rbutton = function($event){
                //alert($event.target.value);
                if($event.target.value == 'same_address'){
                    //alert(123);
//                    $scope.shipData = $scope.registerData;
                    $scope.shipData.firstname = $('#bfirstname').val(); 
                    $scope.shipData.lastname = $('#blastname').val(); 
                    $scope.shipData.company = $('#bcompany').val(); 
                    $scope.shipData.email = $('#bemail').val(); 
                    $scope.shipData.street = $('#baddress1').val(); 
                    $scope.shipData.street2 = $('#baddress2').val(); 
                    $scope.shipData.city = $('#bcity').val(); 
                    $scope.shipData.region = $('#bstate').val(); 
                    $scope.shipData.postcode = $('#bzip').val(); 
                    $scope.shipData.country = $('#bcountry').val(); 
                    $scope.shipData.telephone = $('#btelephone').val(); 
//                    alert($('#bfirstname').val());
                }else{
                    $scope.shipData = {};
                }
            }
            $scope.payment_info_rbutton = function($event){
                if($event.target.value == 'credit_card'){
                    $("#payment_info_id").removeClass('hide');
                    $scope.payment_method_type = 'paypal';
                }else{
                    $("#payment_info_id").addClass('hide');
                    $scope.payment_method_type = 'cod';
                }
            }
            
            $scope.checkoutFormQuote = function(registerData){
               
                //registerData=$('#checkoutForm').serialize();
                console.log('rData');
                console.log($scope.registerData);
                var billing_address = {
                    street:$scope.registerData.street,
                    company:$scope.registerData.company,
                    telephone:$scope.registerData.postcode,
                    region:$scope.registerData.street,
                    fax:$scope.registerData.fax,
                    postcode:$scope.registerData.postcode,
                    city:$scope.registerData.city,
                    firstname:$scope.registerData.firstname,
                    lastname:$scope.registerData.lastname,
                    email:$scope.registerData.email};
                
                
                var shipping_address = {
                    street:$scope.shipData.street,
                    company:$scope.shipData.company,
                    telephone:$scope.shipData.postcode,
                    region:$scope.shipData.street,
                    fax:$scope.shipData.fax,
                    postcode:$scope.shipData.postcode,
                    city:$scope.shipData.city,
                    firstname:$scope.shipData.firstname,
                    lastname:$scope.shipData.lastname,
                    email:$scope.shipData.email};
					
                //var billing_address = shipping_address;
//                var billing_address = ['street'=>shipData.street , 'company'=>shipData.company,'telephone'=>shipData.postcode,'region'=>shipData.street,'fax'=>shipData.fax,'postcode'=>shipData.postcode,'city'=>shipData.city,'firstname'=>shipData.firstname,'lastname'=>shipData.lastname,'email'=>shipData.email];
                  //console.log($scope.gift);
                var params = {
                    customerid: u_id,
                    shipping_address: shipping_address,
                    billing_address:billing_address
                };
                $rootScope.service.post('addquote', params, function (results) {
                    results= JSON.parse(results);
//                    alert(JSON.stringify(results));
                    setStorage('quoteid', results.quoteid);
                    
                        //alert(paypal);
                        if($scope.payment_method_type == 'paypal'){
                            $state.go("app.paypal");
                            return;
                        }else{
                            //alert(cod);
                            var u_id = getStorage('user_id');					
                            var quoteid = getStorage('quoteid');					

                            var params = {
                                customerid: u_id,
                                quoteid:quoteid,
                                paymethod:'cashondelivery',
                                paymentData:''
                            };
                            //alert(JSON.stringify(response));
                            $rootScope.service.post('placeorder', params, function (res) {
                                res=JSON.parse(res);
                                console.log('placeOrder:');
                                console.log(res);
                                //alert(JSON.stringify(res));
                                removeStorage(quoteid);
                                $state.go("app.orderDetails");
                               // $location.path('/app/orderDetails');
                                return;
                            });
                            
            //                                          $location.path('/app/home');
                                return;

                        }
                    


                });                

                
            }
            var params = {
                customerid: u_id,
            };
            $rootScope.service.get('paymentmethods', params, function (results) {
                //console.log(results.model);
                $scope.payment_method = results.model;
            });
            $rootScope.service.get('getShippingMethodsList', params, function (results) {
                console.log(123);
                console.log(results);
                if(results.code == 0){
                    $scope.shipping_methods = results.model;
                }else{
                    $ionicPopup.alert(
                            {
                                title: 'Error',
                                subTitle: results.msg,
                                okType: 'buttonhk'
                            }
                    );
                }
//                $scope.shipping_method = results.model;
            });
        })
		
