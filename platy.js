var platy;
interp.lang = platy = {
	run(source, input){
		var args = eval("[" + input + "]"), lines;
		platy.pointers = [[0,0]];
		platy.stack = args;
		platy.lines = source.split("\n");
		platy.funcs = platy.lines.map(y => y.split("").map(x => platy.fdict[x]).concat(platy.fdict.end));
		platy.funcs [0].splice(-1, 1, platy.fdict.final);
	},
	update(){
		var func = platy.funcs[this.ip[1]][this.ip[0]];
		interp.debug(platy.callstack, platy.pointers.map(y => [y[0], y[1]+1]),
			[platy.stack], range(0,platy.stack.length-1).slice(platy.stack.length-func.len));
		func();
	},
	get callstack(){
		var out = Array(platy.pointers.length), i;
		for (i in platy.pointers){
			out [i] = Array.from(platy.lines[platy.pointers[i][1]]);
		}
		return out;
	},
	stop(){},
	pointers:[[0,0]],
	get pointer(){
		return this.ip[0];
	},
	set pointer(v){
		this.ip[0] = v;
	},
	get ip(){
		var p = this.pointers[this.pointers.length-1];
		return p;
	},
	ops: {
		"+": (x,y) => [x+y],
		"-": (x,y) => [x-y],
		"*": (x,y) => [x*y],
		"/": (x,y) => [x/y],
		"^": (x,y) => [Math.pow(x,y)],
		"%": (x,y) => [((x % y) + y) % y],
	},
	cmd: {},
	fdict: {
		end(){
			var pointer = platy.pointers.pop();
		},
		final(){
			interp.print(platy.read(1));
			interp.go = false;
		}
	},
	setup(){
		var o = Object.create(null);
		for (var i in platy.ops){
			o[i] = (function(op){
				return Object.assign(function(){
					var args = platy.read(op.length);
					platy.write(op(...args));
					platy.pointer++;
				}, {len: op.length});
			})(platy.ops[i]);
		}
		Object.assign(platy.fdict, o);
	},
	read(n){
		while (platy.stack.length < n) platy.stack.unshift(0);
		return platy.stack.splice(-n);
	},
	write(args){
		platy.stack.push(...args);
	}
};
platy.setup();
