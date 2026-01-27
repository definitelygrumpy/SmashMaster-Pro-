const App = {
    init() {
        Auth.checkUser();
        UI.init();
    }
};

App.init();
