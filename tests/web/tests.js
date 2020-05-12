console.log(SearchFilterOptions);

QUnit.test("It should load bundle", function ( assert ) {
	assert.notEqual(null, SearchFilterOptions, 'lib loaded');
	var sfo = null;
	try {
		sfo = new SearchFilterOptions();
	} catch (err) {}
	assert.notEqual(null, sfo, 'instance created');
	
});

QUnit.test("It should test bad argument", function ( assert ) {
	var sfo = new SearchFilterOptions();
	var wasErr = false;
	try {
		var out = sfo.parse();
	} catch (err) {
		wasErr = true;
	}
	assert.equal(true, wasErr);
});

QUnit.test("It should return all empty keys", function ( assert ) {
	let sfo = new SearchFilterOptions();
	let out = sfo.parse('');
	assert.ok(out.hasOwnProperty('data'));
	assert.ok(out.hasOwnProperty('expected'));
	assert.ok(out.hasOwnProperty('extra'));
});

QUnit.test("It should test getString", function ( assert ) {
	let sfo = new SearchFilterOptions();
	let out = sfo.parse('this is extra text');
	assert.equal(sfo.getString(), 'this is extra text');
});

QUnit.test("It should get extra", function ( assert ) {
	let sfo = new SearchFilterOptions();
	let out = sfo.parse('this is extra text');
	assert.equal(out.extra, 'this is extra text');
});

QUnit.test("It should get extra", function ( assert ) {
	let sfo = new SearchFilterOptions();
	let out = sfo.parse('some extra text :key1 val1  :key2  val2');
	assert.equal(out.extra, 'some extra text');
	assert.ok(out.data.hasOwnProperty('key1'));
	assert.ok(out.data.hasOwnProperty('key2'));
	assert.deepEqual(out.data['key1'], { value: 'val1', 'exists': true });
	assert.deepEqual(out.data['key2'], { value: 'val2', 'exists': true });
});
























