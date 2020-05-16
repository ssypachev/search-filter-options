'use strict';

const chai = require('chai'),
     { SearchFilterOptions } = require('../../dist/bundle.node.js');
	
describe ('It should test bundle itself', () => {
	
	it ('It should load bundle', () => {
		let sfo = new SearchFilterOptions();
		chai.expect(sfo).not.to.be.null;
		chai.expect(sfo).to.be.an.instanceof(SearchFilterOptions);
	});
	
	it ('It should test bad argument', () => {
		let sfo = new SearchFilterOptions();
		let wasErr = false;
		try {
			let out = sfo.parse();
		} catch (err) {
			wasErr = true;
		}
		chai.expect(wasErr).to.be.true;
	});
	
	it ('It should return all empty keys', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse('');
		chai.expect(out).to.have.property('data');
		chai.expect(out).to.have.property('expected');
		chai.expect(out).to.have.property('extra', '');
	});
	
	it ('It should test getString', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse('this is extra text');
		chai.expect(sfo.getString()).to.equal('this is extra text');
	});
	
	it ('It should get extra', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse('this is extra text');
		chai.expect(out.extra).to.equal('this is extra text');
	});
	
	it ('It should get one key', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse(':key1 val1');
		chai.expect(out.extra).to.equal('');
		chai.expect(out.data).to.have.property('key1');
		chai.expect(out.data['key1']).to.deep.equal({ value: 'val1' })
	});
	
	it ('It should get one key and extra', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse('some extra text :key1 val1');
		chai.expect(out.extra).to.equal('some extra text');
		chai.expect(out.data).to.have.property('key1');
		chai.expect(out.data['key1']).to.deep.equal({ value: 'val1' })
	});
	
	it ('It should get two keys and extra', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse('some extra text :key1 val1  :key2  val2');
		chai.expect(out.extra).to.equal('some extra text');
		chai.expect(out.data).to.have.property('key1');
		chai.expect(out.data).to.have.property('key2');
		chai.expect(out.data['key1']).to.deep.equal({ value: 'val1' })
		chai.expect(out.data['key2']).to.deep.equal({ value: 'val2' })
	});
	
	it ('It should get two keys, no extra', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse('  :key1 val1  :key2  val2');
		chai.expect(out.extra).to.equal('');
		chai.expect(out.data).to.have.property('key1');
		chai.expect(out.data).to.have.property('key2');
		chai.expect(out.data['key1']).to.deep.equal({ value: 'val1' })
		chai.expect(out.data['key2']).to.deep.equal({ value: 'val2' })
	});
	
	it ('It should creat with additional parameters', () => {
		let sfo = new SearchFilterOptions({
			keys: [{ name: 'provider' }, { name: 'status' }, { name: 'isTest', flag: true }]
		});
		let out = sfo.parse(' :provider stripe :status success  :isTest');
		console.log(out);
	});
	
	it ('It should test starts with key', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse(':email sypachev_s_s@mail.ru');
		chai.expect(out.extra).to.equal('');
		chai.expect(out.data).to.have.property('email');
		console.log(out);
		out = sfo.parse(':id 123');
		console.log(out);
		chai.expect(out.data).to.have.property('id');
		out = sfo.parse('  :key1 val1  :key2  val2');
		chai.expect(out.extra).to.equal('');
		chai.expect(out.data).to.have.property('key1');
		chai.expect(out.data).to.have.property('key2');
		chai.expect(out.data['key1']).to.deep.equal({ value: 'val1' })
		chai.expect(out.data['key2']).to.deep.equal({ value: 'val2' })
	});
	
	it ('Should test isNextString', () => {
		let res = SearchFilterOptions.isNextString('a', 'ab');
		chai.expect(res).to.be.true;
	});
	
	it ('It should test incremental parsing', () => {
		let sfo = new SearchFilterOptions();
		let out = sfo.parse(':email sypachev_s_s@mail.r');
		chai.expect(out.data).to.have.property('email');
		chai.expect(out.data['email']).to.have.property('value', 'sypachev_s_s@mail.r');
		out = sfo.parse(':email sypachev_s_s@mail.ru');
		chai.expect(out.data).to.have.property('email');
		chai.expect(out.data['email']).to.have.property('value', 'sypachev_s_s@mail.ru');
		out = sfo.parse(':email sypachev_s_s@mail.rux');
		chai.expect(out.data).to.have.property('email');
		chai.expect(out.data['email']).to.have.property('value', 'sypachev_s_s@mail.rux');
		out = sfo.parse(':email sypachev_s_s@mail.ru');
		chai.expect(out.data).to.have.property('email');
		chai.expect(out.data['email']).to.have.property('value', 'sypachev_s_s@mail.ru');
	});
	
	it ('Should test incremental letter-by-letter parsing', () => {
		let sfo = new SearchFilterOptions();
		
		let out = sfo.parse('');
		chai.expect(out.data).to.deep.equal({});
		
		out = sfo.parse('s');
		chai.expect(out.data).to.deep.equal({});
		chai.expect(out.extra).to.equal('s');
		
		out = sfo.parse('so');
		chai.expect(out.data).to.deep.equal({});
		chai.expect(out.extra).to.equal('so');
		
		out = sfo.parse('som');
		chai.expect(out.data).to.deep.equal({});
		chai.expect(out.extra).to.equal('som');
		
		out = sfo.parse('some');
		chai.expect(out.data).to.deep.equal({});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some ');
		chai.expect(out.data).to.deep.equal({});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :');
		chai.expect(out.data).to.deep.equal({});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :q');
		chai.expect(out.data).to.deep.equal({q: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :qu');
		chai.expect(out.data).to.deep.equal({qu: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :que');
		chai.expect(out.data).to.deep.equal({que: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :quer');
		chai.expect(out.data).to.deep.equal({quer: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query');
		chai.expect(out.data).to.deep.equal({query: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query ');
		chai.expect(out.data).to.deep.equal({query: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  ');
		chai.expect(out.data).to.deep.equal({query: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  1');
		chai.expect(out.data).to.deep.equal({query: { value: '1' }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  12');
		chai.expect(out.data).to.deep.equal({query: { value: '12' }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  123');
		chai.expect(out.data).to.deep.equal({query: { value: '123' }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  123 ');
		chai.expect(out.data).to.deep.equal({query: { value: '123' }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  123 :');
		chai.expect(out.data).to.deep.equal({query: { value: '123' }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  123 :x');
		chai.expect(out.data).to.deep.equal({query: { value: '123' }, x: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  123 :x ');
		chai.expect(out.data).to.deep.equal({query: { value: '123' }, x: { value: null }});
		chai.expect(out.extra).to.equal('some');
		
		out = sfo.parse('some :query  123 :x y');
		chai.expect(out.data).to.deep.equal({query: { value: '123' }, x: { value: 'y' }});
		chai.expect(out.extra).to.equal('some');
	});
	
});


















