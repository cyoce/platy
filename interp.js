$(document).ready(load);
function load(){
	$ ("#btn-run").click (interp.run);
	$ ("#stop").click(function(){
		interp.stop();
	});
	$ ("#interval").change(function (){
		interp.interval = this.value;
		$("#show-interval").text(this.value);
	});
	setInterval(function(){
		$("#bytes").text(" - " + $("#source").val().length + " bytes");
	});
	$("#permalink").click(function(){
		window.open(applyquery({hex:btoa($("#source").val())}, 'https://rawgit.com/cyoce/platy/master/interp.html'));
	});
	$("#markdown").click(function(){
		var source = $("#source").val();
		var out = "# [" + interp.lang.name + "](" + interp.lang.url + "), ";
		out += source.length + " bytes\n";
		out += ("\n" + source).replace(/\n/g, "\n    ");
		out += "\n\n[Try it online!](" + applyquery({hex:btoa($('#source').val())}, interp.lang.url) + ")";
		$("#source").val(out).select();
		document.execCommand("copy");
		$("#source").val(source);
	});
	$("#turbo").change(function(){
		interp.turbo = this.checked;
	});

	var query = parse_query(location.href);
	if (query) {
		if (query.hex){
			$("#source").val(atob(query.hex));
		} else {
			$("#source").val(query.code);
		}
	}
	if (query === null) query = {};
	function applyquery(query, href) {
		href = href || location.href;
		href = href.split("?")[0];
		return href + gen_query(query);
	}
	function parse_query(href) {
		href = String(href)
			.split("?");
		if (href.length <= 1) return null;
		href = href[1];
		var out = {};
		var keys = href.split("&");
		for (var i = 0; i < keys.length; i++) {
			var
				pair = keys[i].split('=');
			out[unescape(pair[0])] = unescape(pair[1]);
		}
		return out;
	}
	function gen_query(obj) {
		if (obj === null || obj === Object.create(null)) return '';
		var out = '?';
		for (var key in obj) {
			if (!obj.hasOwnProperty(key)) continue;
			if (out.length !== 1) out += "&";
			out += escape(key) + "=" + escape(obj[key]);
		}
		return out;
	}
}
function convertBase(value, from_base, to_base, range) {
  range = range || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ*_'.split('');
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);

  var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw TypeError('Invalid digit `'+digit+'` for base '+from_base+'.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
  }, 0);

  var new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
}
var interp = {
	interval: 350,
	stop(){
		$(".runtime").hide().prop("disabled", true);
		$(".editor").show().prop("disabled", false);
		interp.lang.stop();
		if (interp.turbo){
			interp.display(interp.outstack.join('\n'));
		}
		clearInterval(interp.inter);
	},
	run(){
		interp.go = true;
		$(".runtime").show().prop("disabled", false);
		$(".editor").hide().prop("disabled", true);
		interp.outstack = [];
		interp.lang.run($("#source").val(), $("#input").val());
		interp.start = new Date;
		interp.ticks = 0;

		if (interp.turbo){
			while (interp.go){
				interp.update();
			}
			interp.stop();
		} else {
			interp.update();
			interp.inter = setInterval(interp.update, interp.interval);
		}
	},
	print (text){ // output
		if (interp.turbo){
			interp.oustack.push(text);
		} else {
			interp.display(text);
		}
	},
	display(text){ // show output to element
		$("#output").text(text);
	},
	update(){
		if(interp.go){
			interp.lang.update();
		} else {
			interp.stop();
		}
	},
	debug(a,b,c,d){
		function gentable(matrix, special){
			special = special || [];
			function len(i){
				return JSON.stringify(i).length;//Math.sqrt(i.length);
			}
			var out = "", height = matrix.length, width, x,y, line, i;
			special = special.map(i => i.join(','));
		  for (y in matrix){
			  line = matrix[y];
				width = line.map(i => len(i)).reduce((a,b) => (a+b),0);
				out += "<tr height='" + 90*height/width + "'>";
				for (x in line){
				  i = line [x];
					out += "<td width='" + 70*width/len(i) + "'";
					if (~special.indexOf(x + "," + y)) out += "class='special'";
					out += ">" + i + "</td>";
				}
				out += "</tr>";
		  }
			return out;
		}
		$("#debug").html(gentable(a,b));
		d = d.map(x=>[x,0]);
		if (c) $("#head").html(gentable(c,[d]));
	}
}
function range (a,b){
	var out = Array(b-a + 1);
	while (a <= b) out [b-a] = b--;
	return out;
}
