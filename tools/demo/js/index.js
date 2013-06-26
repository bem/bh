function BHController($scope) {

    $scope.compiledHtml = function() {
        $scope.error = '';
        var bh = new BH(), json;
        try {
            json = eval('(' + $scope.data.inputBemjson + ')');
        } catch (e) {
            return 'BEMJSON parse error:\n' + e.stack;
        }
        try {
            eval($scope.data.inputMatchers);
        } catch (e) {
            return 'Matchers parse error:\n' + e.stack;
        }
        bh.enableInfiniteLoopDetection(true);
        var res = '';
        try {
            res = bh.apply(json).replace(/>/g, '>\n').replace(/([^>\n])</g, '$1\n<');
        } catch (e) {
            return 'Execution error:\n' + e.stack;
        }
        return res;
    };

    $scope.loadSettings = function(settings) {
        $scope.data = angular.fromJson(settings);
        $scope.data.inputBemjson = $scope.data.inputBemjson || '{ block: \'button\', content: \'Кнопка\' }';
        $scope.data.inputMatchers = $scope.data.inputMatchers ||
            'bh.match(\'button\', function(ctx) {\n' +
            '    ctx.tag(\'button\');\n' +
            '    ctx.attr(\'role\', \'button\');\n' +
            '    ctx.content({\n' +
            '        elem: \'text\',\n' +
            '        content: ctx.content()\n' +
            '    }, true);\n' +
            '});\n';
    };
    $scope.loadSettings(localStorage['bh-config-settings-2'] || '{}');
    window.setInterval(function() {
        localStorage['bh-config-settings-2'] = angular.toJson($scope.data);
    }, 1000);
}
