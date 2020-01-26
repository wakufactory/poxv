/**
 *	gamepad object 
 *	@constructor 
 */
GPad = function() {
	this.idx = 0 
	this.conn = false 
	this.gpadcount = 0 
	if(!navigator.getGamepads) return false ;
	gamepads = navigator.getGamepads();
//	console.log(gamepads)
	this.gpadcount = gamepads.length
	return this.gpadcount > 0  
}

GPad.prototype.init = function(idx,cb) {
	if(idx==undefined) idx = 0 
	this.idx = idx 
	if(!navigator.getGamepads) return false ;
	let ret = true 
	gamepads = navigator.getGamepads();
//	console.log(gamepads)
	if(gamepads[this.idx]) {
		console.log("gpad init "+this.idx) ;
		this.axes =gamepads[this.idx].axes 
		this.conn = true ;
		this.egp = null ;
	} else {
		this.conn = false 
		ret = false 
	}
	addEventListener("gamepadconnected", (e)=> {
		if(e.gamepad.index != this.idx ) return 
		console.log("gpad reconnected "+e.gamepad.index) ;
//		console.log(e.gamepad) ;
		this.axes = e.gamepad.axes 
		this.conn = true; 
		this.get()
		if(cb) cb(this,true) 
	})	
	addEventListener("gamepaddisconnected", (e)=> {
		if(e.gamepad.index != this.idx ) return 
		console.log("gpad disconnected "+e.gamepad.index) ;
		this.conn = false ;
		if(cb) cb(this,false) 
	})
	this.lastGp = {
		buttons:[
			{pressed:false,touched:false},
			{pressed:false,touched:false},
			{pressed:false,touched:false},
			{pressed:false,touched:false},
			{pressed:false,touched:false},
			{pressed:false,touched:false}
		],
		axes:[0,0]
	}
	this.egp = {
		buttons:[
			{pressed:false,touched:false},
			{pressed:false,touched:false}
		],
		axes:[0,0]
	}
	return ret ;
}
GPad.prototype.get = function(pad) {
	var gp 
	if(!this.conn) {
		if(this.egp==null) return null ;	
		gp = this.egp
	} else {
		var gamepads = navigator.getGamepads();
//		console.log(gamepads)
		this.gamepads = gamepads 
		var gp = gamepads[this.idx];
		if(!gp || gp.buttons.length==0) return null ;
	}
	
	var lgp = this.lastGp 
	gp.bf = false 
	gp.pf = false 
	gp.tf = false 
	gp.dbtn = [] 
	gp.dpad = []
	gp.dtouch = [] 

//	if(lgp) console.log(lgp.buttons[1].pressed +" "+ gp.buttons[1].pressed)
	for(var i=0;i<gp.buttons.length;i++) {
		gp.dbtn[i] = 0 
		gp.dtouch[i] = 0 
		if(lgp && lgp.buttons[i]) {
			if(!lgp.buttons[i].pressed && gp.buttons[i].pressed) {gp.dbtn[i] = 1; gp.bf=true} 
			if(lgp.buttons[i].pressed && !gp.buttons[i].pressed) {gp.dbtn[i] = -1;gp.bf=true}
			if(!lgp.buttons[i].touched && gp.buttons[i].touched) {gp.dtouch[i] = 1; gp.tf=true} 
			if(lgp.buttons[i].touched && !gp.buttons[i].touched) {gp.dtouch[i] = -1;gp.tf=true}
		}
		lgp.buttons[i] = {pressed:gp.buttons[i].pressed,
											touched:gp.buttons[i].touched}
	}
	const th = 0.5 
	for(var i=0;i<gp.axes.length;i++) {
		gp.dpad[i] = 0 
		if(lgp) {
			
			if(Math.abs(lgp.axes[i])<th && Math.abs(gp.axes[i])>=th) {gp.dpad[i] = 1;gp.pf=true}
			if(Math.abs(lgp.axes[i])>=th && Math.abs(gp.axes[i])<th) {gp.dpad[i] = -1;gp.pf=true}
		}
		lgp.axes[i] = gp.axes[i]
	}
	this.gp = gp 

	if(this.ev && (gp.bf || gp.pf || gp.tf)){
		this.ev(gp) 
	}
//	console.log(gp)
	return gp ;	
}
GPad.prototype.set = function(gp) {//for emulation
	this.egp = gp ;	
}
GPad.prototype.clear = function(gp) {//for emulation
	if(gp==undefined ) gp = {
		buttons:[
			{pressed:false,touched:false},
			{pressed:false,touched:false}
		],
		axes:[0,0]
	}
	this.egp = gp
	this.cf = true ;	
}