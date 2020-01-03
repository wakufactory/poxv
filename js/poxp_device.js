const POXPDevice = {
	checkVR:function(poxp) {
		return new Promise( (resolve,reject)=>{
			// for WebVR
			if(navigator.getVRDisplays) {
				navigator.getVRDisplays().then((displays)=> {
					poxp.vrDisplay = displays[displays.length - 1]
					console.log(poxp.vrDisplay)
					window.addEventListener('vrdisplaypresentchange', ()=>{
						console.log("vr presenting= "+poxp.vrDisplay.isPresenting)
						if(poxp.vrDisplay.isPresenting) {
							poxp.callEvent("vrchange",1)
						} else {
							poxp.resize() ;
							poxp.callEvent("vrchange",0)
						}
					}, false);
					window.addEventListener('vrdisplayactivate', ()=>{
						console.log("vr active")
					}, false);
					window.addEventListener('vrdisplaydeactivate', ()=>{
						console.log("vr deactive")
					}, false);
				})
			}
			
		})
	},
	presentVR:function(poxp) {
		return new Promise( (resolve,reject)=>{
			const p = { source: poxp.can,attributes:{} }
			if(poxp.pox.setting.highRefreshRate!==undefined) p.attributes.highRefreshRate = poxp.pox.setting.highRefreshRate
			if(poxp.pox.setting.foveationLevel!==undefined) p.attributes.foveationLevel = poxp.pox.setting.foveationLevel
			poxp.vrDisplay.requestPresent([p]).then( () =>{
				console.log("present ok")
				const leftEye = poxp.vrDisplay.getEyeParameters("left");
				const rightEye = poxp.vrDisplay.getEyeParameters("right");
				poxp.can.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
				poxp.can.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
				if(poxp.vrDisplay.displayName=="Oculus Go") {
					poxp.can.width = 2560
					poxp.can.height = 1280
				}
				poxp.can.width= poxp.can.width * poxp.pixRatio 
				poxp.can.height= poxp.can.height * poxp.pixRatio 
				poxp.pox.log(this.vrDisplay.displayName)
				poxp.pox.log("vr canvas:"+poxp.can.width+" x "+poxp.can.height);
			}).catch((err)=> {
				console.log(err)
			})		
		
		})
	},
	closeVR:function(poxp) {
		poxp.vrDisplay.exitPresent().then( () =>{
			console.log("VR end")
		})
	}
}