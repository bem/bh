function BHController($scope, $location) {

    var defaultData = {
        inputBemjson: '{ block: \'button\', content: \'Кнопка\' }',
        inputMatchers: 'bh.match(\'button\', function(ctx) {\n' +
            '    ctx.tag(\'button\');\n' +
            '    ctx.attr(\'role\', \'button\');\n' +
            '    ctx.content({\n' +
            '        elem: \'text\',\n' +
            '        content: ctx.content()\n' +
            '    }, true);\n' +
            '});\n'
    };

    $scope.compiledHtml = function() {
        $scope.error = '';
        var bh = new BH(), json;
        bh.setOptions({
            jsAttrName: 'data-bem',
            jsAttrScheme: 'json'
        });
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

    $scope.loadSettings = function() {
        var storedData = angular.fromJson(localStorage['bh-config-settings-2'] || '{}');
        var urlData = $location.search();
        $scope.data = angular.extend({}, defaultData, storedData, urlData);
    };
    $scope.loadSettings();
    $scope.$watchCollection('data', function(data) {
        $location.search($scope.data);
        localStorage['bh-config-settings-2'] = angular.toJson($scope.data);
    });
}
