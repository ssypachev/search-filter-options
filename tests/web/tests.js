console.log(SearchFilterOptions);

QUnit.test( "hello test", function ( assert ) {
	assert.notEqual(null, SearchFilterOptions, 'lib loaded');
	var sfo = null;
	try {
		sfo = new SearchFilterOptions();
	} catch (err) {}
	assert.notEqual(null, sfo, 'instance created');
});