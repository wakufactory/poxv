const POXPDevice = {
	VRReady:false,
	isPresenting:false,
	checkVR:function() {
		return new Promise( (resolve,reject)=>{
			if(navigator.xr) {
				navigator.xr.isSessionSupported('immersive-vr',
					{optionalFeatures: [ 'hand-tracking' ]}).then((supported) => {
					POXPDevice.VRReady = supported 
					resolve(supported)       	
				}).catch((err)=>{
					console.log(err)
					resolve(false)
				});
			} else {
				resolve(false)
			}
		})
	},
	presentVR:function(poxp) {
		return new Promise( (resolve,reject)=>{
				navigator.xr.requestSession("immersive-vr").then((xrSession)=> {
					POXPDevice.session=xrSession
					POXPDevice.isPresenting = true
					console.log("vr start")
					xrSession.updateRenderState({baseLayer: new XRWebGLLayer(xrSession,poxp.wwg.gl,{framebufferScaleFactor:poxp.pixRatio})});
					xrSession.requestReferenceSpace("local").then((xrReferenceSpace) => {
						POXPDevice.referenceSpace=xrReferenceSpace
						POXPDevice.session.requestAnimationFrame(POXPDevice.loopf);
						poxp.callEvent("vrchange",1)
					});
					xrSession.addEventListener("end", (ev)=>{
							POXPDevice.session=null
							POXPDevice.isPresenting = false
							console.log("VR end")
//							poxp.loop = window.requestAnimationFrame(POXPDevice.loopf) ;
							poxp.callEvent("vrchange",0)
					})
				}); 
		})
	},
	closeVR:function() {
		console.log("vr closing")
		POXPDevice.isPresenting = false
		POXPDevice.session.end()
	},
	animationFrame:function(poxp,loopf,vrframe) {
		POXPDevice.loopf = loopf 
		if(POXPDevice.isPresenting ) {
			if(!vrframe) return 
				POXPDevice.session.requestAnimationFrame(loopf);
				POXPDevice.vrFrame = vrframe 
				poxp.isVR = true 
//				console.log("vrframe")

		} else {
//			console.log("no vrframe")
			poxp.loop = window.requestAnimationFrame(loopf) ;
			poxp.isVR = false ;
		}
	},
	submitFrame:function() {
		if(POXPDevice.VRReady) {
		}
	},
	getFrameData:function() {
		if(POXPDevice.vrFrame) {
//			console.log("getframe")
			let pose=POXPDevice.vrFrame.getViewerPose(POXPDevice.referenceSpace);
//			console.log(pose)
			pose.orientation = [pose.transform.orientation.x,pose.transform.orientation.y,pose.transform.orientation.z,pose.transform.orientation.w]
			pose.position = [pose.transform.position.x,pose.transform.position.y,pose.transform.position.z]
			let frame = {pose:pose}
			let webGLLayer=POXPDevice.session.renderState.baseLayer;
//			console.log(webGLLayer)
			POXPDevice.webGLLayer = webGLLayer
			for (let i=0;i<=pose.views.length-1;i++) {
				const v = pose.views[i] 
				var viewport=webGLLayer.getViewport(v);
				pose.views[i].viewport = viewport 
				if(v.eye=="right") {
					frame.rightViewMatrix = v.transform.inverse.matrix
					frame.rightProjectionMatrix = v.projectionMatrix
					frame.rightViewport = viewport 
				} else if(v.eye == "left" ){
					frame.leftViewMatrix = v.transform.inverse.matrix
					frame.leftProjectionMatrix = v.projectionMatrix	
					frame.leftViewport = viewport 			
				}
			}
			POXPDevice.views = pose.views 
			POXPDevice.viewport = {leftViewport:frame.leftViewport,rightViewport:frame.rightViewport}
//			console.log(frame)
			return frame 
		}
	},
	getViewport:function(can) {
		if( POXPDevice.isPresenting)
			return POXPDevice.viewport
		else 
			return {leftViewport:{x:0,y:0,width:can.width/2,height:can.height},
							rightViewport:{x:can.width/2,y:0,width:can.width/2,height:can.height}}
	},
	setDepth:function(camDepth) {
		if(!POXPDevice.isPresenting) return
		POXPDevice.session.updateRenderState({depthNear:camDepth.camNear, depthFar:camDepth.camFar})

	},
	getInput:function() {
		if(!POXPDevice.isPresenting) return null
		if(!POXPDevice.session.inputSources) return null
		let ret = {}
		for (let i of POXPDevice.session.inputSources) {
			if(i==null) continue ;
//			console.log(i)
			let pose = POXPDevice.vrFrame.getPose(i.gripSpace,POXPDevice.referenceSpace)
			let posetr = pose? POXPDevice.convTransform(pose.transform):null
			if(i.gamepad) {
				if(!ret.gamepad) ret.gamepad = {}
				ret.gamepad[i.handedness] = {
					handedness:i.handedness,
					gamepad:i.gamepad,
					profiles:i.profiles,
					pose:posetr
				}
			}
			if(i.hand) {
				if(!ret.hand) ret.hand = {}
				let hand= []
				for(let ofs=0;ofs<25;ofs++) {
					if(i.hand[ofs]!==null) {
						let pose = POXPDevice.vrFrame.getJointPose(i.hand[ofs],POXPDevice.referenceSpace)
						if(pose!=null) {
							hand[ofs] = { radius:pose.radius,transform:POXPDevice.convTransform(pose.transform)}
						} else hand[ofs] = null 
					} else hand[ofs] = null
				}
				ret.hand[i.handedness] = {
					handedness:i.handedness,
					hand:hand,
					profiles:i.profiles,		
					pose:posetr
				}
			}
		}
//		console.log(ret)
		return ret 
	},
	convTransform:function(transform) {
		let ret = {}
		if(transform.position) ret.position = new Vector(transform.position.x,transform.position.y,transform.position.z)
		if(transform.orientation) ret.orientation = new Vector(transform.orientation.x,transform.orientation.y,transform.orientation.z,transform.orientation.w)
		if(transform.matrix) ret.matrix = new Mat4(transform.matrix)
		return ret 
	}
}