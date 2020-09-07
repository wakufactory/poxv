const  POXP = {} ;
function $(e){return document.getElementById(e)}
POXP.init= function(canvas=null) {
	let poxp 
	try {
		poxp = new PoxPlayer(canvas?canvas:'#screen1', 
		{capture:true,noWebGL2:false}) ;
	} catch(err) {
		console.log(err)
		alert (err) 
		return 
	}
	console.log(poxp)
	POXP.poxp = poxp 
	poxp.setError( POXP.msg) ;

	$("vrbtn").addEventListener("click", (ev)=>{
	  if (
	    window.DeviceOrientationEvent &&
	    DeviceOrientationEvent.requestPermission &&
	    typeof DeviceOrientationEvent.requestPermission === 'function'
	  ) {
	    DeviceOrientationEvent.requestPermission();
	  }
		window.addEventListener("deviceorientation", function(ev) {
			var or = window.orientation ;
			var d = (or==90||or==-90) ;
			poxp.param.isStereo = d ;
			$("cc").style.opacity = d?0.:0.4 ;
			$("footer").style.display = d?"none":"block" ;
			$("vrbtn").style.display = d?"none":"block" ;
			$("padl").style.opacity = d?0.:0.4 ;
			$("padr").style.opacity = d?0.:0.4 ;
			window.scrollTo(0,1000)
		})
		poxp.enterVR()
	}) 
	$("screen1").addEventListener("mousedown", (ev)=>{
		poxp.keyElelment.focus()
	}) 
	let padl={},padr={} 
	function clearpad(cpad,left) {
		 cpad.buttons = [{pressed:false,touched:false},{pressed:false,touched:false},{pressed:false,touched:false},{pressed:false,touched:false},{pressed:false,touched:false},{pressed:false,touched:false}]
		 cpad.axes=[0,0]
		 cpad.hand = left?"left":"right"
	}	
	clearpad(padl,true)
	poxp.pox.gPad.set(padl)
	clearpad(padr,false)
	poxp.pox.gPad2.set(padr)

	function mover(pad,tpad,ev) {
		const id = ev.target.getAttribute("data-key")
		if(id==2) {
			const d = ev.target.getAttribute("data-dir")
			pad.axes[(d&2)?1:0] =  (d&1)?0.8:-0.8 			
		} 
		pad.buttons[id].touched = true 
		if(tpad) tpad.set(pad) 
		ev.preventDefault()		
	}
	function tstart(pad,tpad,ev){
		const id = ev.target.getAttribute("data-key")
		if(id==2) {
			const d = ev.target.getAttribute("data-dir")
			pad.axes[(d&2)?1:0] =  (d&1)?0.8:-0.8 			
		} 
		pad.buttons[id].touched = true 
		pad.buttons[id].pressed = true 
		if(tpad) tpad.set(pad) 
		ev.preventDefault()		
	}
	function mdown(pad,tpad,ev){
		const id = ev.target.getAttribute("data-key") 
		pad.buttons[id].pressed = true 
		if(tpad) tpad.set(pad)  
		ev.preventDefault()		
	}
	function mup(pad,tpad,ev) {
		const id = ev.target.getAttribute("data-key") 
		pad.buttons[id].pressed = false  
		if(tpad) tpad.set(pad) 
		ev.preventDefault()		
	}
	function tend(pad,tpad,left,ev){
		const id = ev.target.getAttribute("data-key") 
		pad.buttons[id].touched = false 
		pad.buttons[id].pressed = false 
		clearpad(pad,left)
		if(tpad) tpad.set(pad) 
		ev.preventDefault()		
	}
	function clear(pad,tpad,left,ev) {
		clearpad(pad,left)
		if(tpad) tpad.set(pad)  
		ev.preventDefault()		
	}

	document.querySelectorAll("#padl button").forEach((o)=>{
		o.addEventListener("mouseover", (ev)=>{	mover(padl,poxp.pox.leftPad,ev)})
		o.addEventListener("touchstart", (ev)=>{tstart(padl,poxp.pox.leftPad,ev)})
		o.addEventListener("mousedown", (ev)=>{mdown(padl,poxp.pox.leftPad,ev)})
		o.addEventListener("mouseup", (ev)=>{mup(padl,poxp.pox.leftPad,ev)})
		o.addEventListener("touchend", (ev)=>{tend(padl,poxp.pox.leftPad,true,ev)})
		o.addEventListener("mouseout", (ev)=>{clear(padl,poxp.pox.leftPad,true,ev)})
		o.addEventListener("touchcancel", (ev)=>{clear(padl,poxp.pox.leftPad,true,ev)})
	})

	document.querySelectorAll("#padr button").forEach((o)=>{
		o.addEventListener("mouseover", (ev)=>{	mover(padr,poxp.pox.rightPad,ev)})
		o.addEventListener("touchstart", (ev)=>{tstart(padr,poxp.pox.rightPad,ev)})
		o.addEventListener("mousedown", (ev)=>{mdown(padr,poxp.pox.rightPad,ev)})
		o.addEventListener("mouseup", (ev)=>{mup(padr,poxp.pox.rightPad,ev)})
		o.addEventListener("touchend", (ev)=>{tend(padr,poxp.pox.rightPad,false,ev)})
		o.addEventListener("mouseout", (ev)=>{clear(padr,poxp.pox.rightPad,false,ev)})
		o.addEventListener("touchcancel", (ev)=>{clear(padr,poxp.pox.rightPad,false,ev)})
	})	
}
POXP.load = function(src,query=null) {
	const poxp = POXP.poxp 
	return new Promise(async (resolve,reject)=>{

	if(query==null) query = location.search.substr(1).split("&")
	if(query[0].match(/.+\.json/)) {
		poxp.load(query[0]+"?"+ Math.random()).then((src)=>{
			query.shift()
			resolve({src:src,query:query})
		})
	} else if(typeof src =="string") {
		poxp.load(src+"?"+ Math.random()).then((src)=>{
			resolve({src:src,query:query})
		})	
	} else if(src!==null) {	
		resolve({src:src,query:query})
	} else {
		var s = localStorage.getItem("poxe_save") ;
		var data ;
		if(s) data = JSON.parse(s)
		poxp.load(data).then((src)=>{
			resolve({src:src,query:query})
		}).catch((err)=>{
			reject("cannot load source")
		})
	}
	})
}
POXP.set = function(src,q) {

	return new Promise(async (resolve,reject)=>{
		
	if(src.scenes) {
		
		if(src.modules) {
			try {
				const m1 = await POXP.poxp.loadModuleSrc(src.modules[0])
				POXP.poxp.m1 = m1 
			} catch(err) {}
		}
		if(src.workers) {
			try {
				const bb = new Blob( [src.workers[0]]);
				POXP.poxp.w1 = new Worker(window.URL.createObjectURL(bb))
			} catch(err) {}
		}

		POXP.setting = src.settings
		document.title = `PoExE:${POXP.setting.name}`
		POXP.poxp.setsrc(src.scenes[0],src.settings).then((pox)=>{
			POXP.msg("eval ok")			
		}).catch((err)=>{
			console.log(err)
			console.log("catch")
			POXP.msg(POXP.poxp.emsg);
			reject()
		})	
	} else {
		POXP.poxp.set(src,q,$('pui')).then((pox)=> {
			if(pox===null) {
				POXP.msg(POXP.poxp.emsg)
				reject()
				return 
			}
			POXP.msg("eval ok") ;
	//		console.log(pox);
			POXP.setting = pox.setting ;
				
	//		poxp.setParam($('pui'))
	//		$('bc').style.display = (pox.setting.cam && pox.setting.cam.camMode=="walk")?"block":"none" 
			if(POXP.setting.copyright) $("footer").innerHTML = POXP.setting.copyright ;
			resolve(pox)
		}).catch((err)=>{
			console.log(err)
			console.log("catch")
			POXP.msg(POXP.poxp.emsg);
			reject()
		})
	}
})
}
POXP.msg = (msg)=> {
	let dt = new Date 
	
	if( typeof msg == "string") {
		let p = location.protocol + "//" + location.host
		msg = msg.replace(new RegExp(p,"g"),"").replace(/data:[^:]+/,"module")
	}
	if($("msglog")) {
		$("msglog").value += dt.toTimeString().substr(0,8)+
			"."+("000"+dt.getMilliseconds()).substr(-3)+" "+msg +"\n"
  	$("msglog").scrollTop = $("msglog").scrollHeight ;
	}
	if(!$("msgc")) {
		console.log(msg)
		return
	}

	const e = document.createElement("div")

	e.innerHTML =  msg

	$("msgc").appendChild(e) ;
	$("msg").scrollTop = $("msgc").offsetHeight ;
}