angular.module('angular-bs-text-highlight', [])
.directive('textHighlight', function($interpolate) {
	return {
		scope: {
			textHighlight: '=',
			textHighlightTags: '=?',
			textHighlightWrapper: '=?',
		},
		restrict: 'AE',
		transclude: true,
		template: '<ng-transclude></ng-transclude>',
		controller: function($scope, $element) {
			// Apply defaults {{{
			if (!$scope.textHighlightTags) $scope.textHighlightTags = ['p', 'div'];
			if (!$scope.textHighlightWrapper) $scope.textHighlightWrapper = '<span class="label label-info">{{item.text}}</span>';
			// }}}

			$scope.$watch('textHighlight + textHighlightTags + textHighlightWrapper', function() {
				var matches = [];
				$element.find($scope.textHighlightTags.join(', ')).each(function(elemIndex) {
					var me = $(this);
					var ih = me.html();

					// Find all matches for all keywords
					angular.forEach($scope.textHighlight, function(keyword) {
						var offset = 0;
						while (1) {
							var nextMatch = ih.indexOf(keyword, offset);
							if (nextMatch < 0) break;
							matches.push({
								elem: me,
								elemIndex: elemIndex,
								text: keyword,
								position: nextMatch,
								length: keyword.length
							});
							offset = nextMatch + keyword.length;
						}
					});
				});

				// Sort last->first for matching elements {{{
				matches.sort(function(a, b) {
					if (a.elemIndex < b.elemIndex) {
						return -1;
					} else if (a.elemIndex > b.elemIndex) {
						return 1;
					} else { // Matching elemIndex - sort by position within it
						if (a.position < b.position) {
							return 1;
						} else if (a.position > b.position) {
							return -1;
						} else {
							return 0;
						}
					}
				});
				// }}}

				var wrapperFunc = $interpolate($scope.textHighlightWrapper);
				angular.forEach(matches, function(item) {
					var interpolated = wrapperFunc({item: item});
					if (interpolated) {
						var html = item.elem.html();
						item.elem.html(html.substr(0, item.position) + interpolated + html.substr(item.position + item.length));
					}
				});
			});
		}
	}
});
