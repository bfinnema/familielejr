document.write('\
    <nav class="navbar navbar-default navbar-fixed-top">\
        <div class="container">\
            <div class="navbar-header">\
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\
                <span class="sr-only">Toggle navigation</span>\
                <span class="icon-bar"></span>\
                <span class="icon-bar"></span>\
                <span class="icon-bar"></span>\
            </button>\
            <a class="navbar-brand" href="#!">Familielejr</a>\
            </div>\
            <div id="navbar" class="collapse navbar-collapse">\
            <ul class="nav navbar-nav">\
                <li><a href="#">Home</a></li>\
                <li ng-show="isLoggedIn"><a href="#!about">Om familielejren</a></li>\
                <li ng-show="isLoggedIn" class="dropdown">\
                    <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Historie<span class="caret"></span></a>\
                    <ul class="dropdown-menu">\
                        <li><a href="#!campmap">Kort</a></li>\
                        <li><a href="#!camplist">Liste over lejre</a></li>\
                    </ul>\
                </li>\
                <li ng-show="isLoggedIn"><a href="#!familytree">Stamtræ</a></li>\
                <li ng-show="isLoggedIn" class="dropdown">\
                    <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Fotoalbum<span class="caret"></span></a>\
                    <ul class="dropdown-menu">\
                        <li><a href="#!photos1993">1993</a></li>\
                        <li><a href="#!photos1994">1994</a></li>\
                        <li><a href="#!photos1994">2001</a></li>\
                        <li><a href="#!photos1994">2010</a></li>\
                    </ul>\
                </li>\
                <li ng-show="isLoggedIn"><a href="#!photoalbum">Fotoalbum</a></li>\
                <li ng-show="isLoggedIn" class="dropdown">\
                    <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Næste Familielejr<span class="caret"></span></a>\
                    <ul class="dropdown-menu">\
                        <li><a href="#!information">Information</a></li>\
                        <li><a href="#!eventregistration">Tilmelding</a></li>\
                    </ul>\
                </li>\
                <li ng-show="!isLoggedIn"><a href="#!register">Register</a></li>\
                <li ng-show="!isLoggedIn"><a href="#!login">Login</a></li>\
                <li ng-show="isLoggedIn" class="dropdown">\
                    <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Min konto <span class="caret"></span></a>\
                    <ul class="dropdown-menu">\
                        <li><a href="#!logout">Log ud</a></li>\
                        <li><a href="#!profile">Min profil</a></li>\
                        <li><a href="#!changepassword">Ændre kodeord</a></li>\
                    </ul>\
                </li>\
                <li><a href="#!content">Contact</a></li>\
            </ul>\
            </div><!--/.nav-collapse -->\
        </div>\
    </nav>\
');