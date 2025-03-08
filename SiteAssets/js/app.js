const app = {};
const ui = {};

app.init = function() {
	cache.init().then((res)=>{
		console.log(res);
	}, (err)=>{
		
	});
}