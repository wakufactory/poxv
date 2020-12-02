//WWG Simple WebGL wrapper library
// Version 0.9 
// 2016-2017 wakufactory.jp 
// license: MIT 
// WWG
//   init(canvas)
//   init2(canvas)
//   loadAjax(src,opt)
//   loadImageAjax(src)
//   createRender()
// Render
//   setRender(scene)
//   draw(update,cls)
//   addModel(model)
//   updateModel(name,mode,buf)
//   addTex(texobj)
//   loadTex(tex)

function WWG() {
	this.version = "0.9.11" ;
	this.can = null ;
	this.gl = null ;
	this.vsize = {"float":1,"vec2":2,"vec3":3,"vec4":4,"mat2":4,"mat3":9,"mat4":16} ;
}
WWG.prototype.init = function(canvas,opt) {
	this.can = canvas ;
	let gl 
	if(!((gl = canvas.getContext("experimental-webgl",opt)) || (gl = canvas.getContext("webgl",opt)))) { return false } ;
	if(!window.Promise) return false ;
	this.gl = gl 
	this.ext_vao = gl.getExtension('OES_vertex_array_object');
	if(this.ext_vao) {
		this.vao_create = function(){return this.ext_vao.createVertexArrayOES()} ;
		this.vao_bind = function(o){this.ext_vao.bindVertexArrayOES(o)} ;
	}
	this.ext_inst = gl.getExtension('ANGLE_instanced_arrays');
	if(this.ext_inst) {
		this.inst_divisor = function(p,d){this.ext_inst.vertexAttribDivisorANGLE(p, d)}
		this.inst_draw = function(m,l,s,o,c){this.ext_inst.drawElementsInstancedANGLE(m,l, s, o, c);}
		this.inst_drawa = function(m,s,o,c) {this.ext_inst.drawArrayInstancedANGLE(m, s, o, c);}
	}
	this.ext_anis = gl.getExtension("EXT_texture_filter_anisotropic");
	this.ext_ftex = gl.getExtension('OES_texture_float');
	this.ext_mrt = gl.getExtension('WEBGL_draw_buffers');
	if(this.ext_mrt) {
		this.mrt_att = this.ext_mrt.COLOR_ATTACHMENT0_WEBGL ;
		this.mrt_draw = function(b,d){return this.ext_mrt.drawBuffersWEBGL(b,d)} ;
	}
	this.ext_i32 = gl.getExtension('OES_element_index_uint')
	this.ext_mv = gl.getExtension('WEBGL_multiview');
	if (this.ext_mv) 
        console.log("MULTIVIEW extension is supported");
	else {
		this.ext_mv = gl.getExtension('OVR_multiview');
		if (this.ext_mv)
			console.log("OVR MULTIVIEW extension is supported");
	} 
	this.dmodes = {"tri_strip":gl.TRIANGLE_STRIP,"tri":gl.TRIANGLES,"points":gl.POINTS,"lines":gl.LINES,"line_strip":gl.LINE_STRIP }
	this.version = 1 ;
	return true ;
}
WWG.prototype.init2 = function(canvas,opt) {
	this.can = canvas ;
	let gl 
	if(!((gl = canvas.getContext("experimental-webgl2",opt)) || (gl = canvas.getContext("webgl2",opt)))) { return false } ;
	if(!window.Promise) return false ;
	console.log("init for webGL2") ;
	this.gl = gl ;
	
	this.ext_vao = true ;
	this.vao_create = function(){ return this.gl.createVertexArray()} ;
	this.vao_bind = function(o){this.gl.bindVertexArray(o)} ;
	this.ext_inst = true ;
	this.inst_divisor = function(p,d){this.gl.vertexAttribDivisor(p, d)}
	this.inst_draw = function(m,l,s,o,c){this.gl.drawElementsInstanced(m,l, s, o, c);}
	this.inst_drawa = function(m,s,o,c) {this.gl.drawArraysInstanced(m, s, o, c);}
	this.ext_anis = gl.getExtension("EXT_texture_filter_anisotropic");
	if(this.ext_anis) this.ext_anis_max = gl.getParameter(this.ext_anis.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	this.ext_ftex = true ;
	this.ext_mrt = (gl.getParameter(gl.MAX_DRAW_BUFFERS)>1) ;
	if(this.ext_mrt) {
		this.mrt_att = gl.COLOR_ATTACHMENT0 ;
		this.mrt_draw =  function(b,d){return gl.drawBuffers(b,d)} ;
	}
	this.ext_i32 = true ;
	this.ext_mv = gl.getExtension('WEBGL_multiview');
	if (this.ext_mv) 
        console.log("MULTIVIEW extension is supported");
	else {
		this.ext_mv = gl.getExtension('OVR_multiview');
		if (this.ext_mv)
			console.log("OVR MULTIVIEW extension is supported");
	} 
	this.dmodes = {"tri_strip":gl.TRIANGLE_STRIP,"tri":gl.TRIANGLES,"points":gl.POINTS,"lines":gl.LINES,"line_strip":gl.LINE_STRIP }
	this.version = 2 ;
	return true ;
}
WWG.prototype.loadAjax = function(src,opt) {
	return new Promise((resolve,reject)=> {
		const req = new XMLHttpRequest();
		req.open("get",src,true) ;
		req.responseType = (opt && opt.type)?opt.type:"text" ;
		req.onload = ()=> {
			if(req.status==200) {
				resolve(req.response) ;
			} else {
				reject("Ajax error:"+req.statusText) ;					
			}
		}
		req.onerror = ()=> {
			reject("Ajax error:"+req.statusText)
		}
		req.send() ;
	})
}
WWG.prototype.loadImageAjax = function(src) {
	return new Promise((resolve,reject)=>{
		this.loadAjax(src,{type:"blob"}).then((b)=>{
			const timg = new Image ;
			const url = URL.createObjectURL(b);
			timg.onload = ()=> {
				URL.revokeObjectURL(url)
				resolve(timg) ;
			}
			timg.src = url
		}).catch((err)=>{
			console.log(err)
			resolve(null) ;
		})
	})
}

// Render unit
WWG.prototype.createRender = function() {
	return new this.Render(this) ;
}
WWG.prototype.Render = function(wwg) {
	this.wwg = wwg ;
	this.gl = wwg.gl ;
	this.env = {} ;
//	this.obuf = [] ;
	this.modelCount = 0 ;
	this.modelId = 0 
//	this.modelHash = {} ;
}
WWG.prototype.Render.prototype.setUnivec = function(uni,value) {
	if(uni.pos==null) return 
//	console.log("set "+uni.type+"("+uni.pos+") = "+value) ;
	let ar = [] ;
	if(uni.dim>0 && !(value instanceof Float32Array)) for(let i=0;i<uni.dim;i++) ar = ar.concat(value[i])
	else ar = value 
	if(uni.cache!=null) {
		if(Array.isArray(ar)) {
			for(let i=0;i<ar.length;i++) if(ar[i]!=uni.cache[i]) break ;
			if(i==ar.length) return ;
		} else if(ar == uni.cache) return ;
	}
//	console.log("set uni")
	switch(uni.type) {
		case "mat2":
			this.gl.uniformMatrix2fv(uni.pos,false,this.f32Array(value)) ;
			break ;
		case "mat3":
			this.gl.uniformMatrix3fv(uni.pos,false,this.f32Array(value)) ;
			break ;
		case "mat4":
			this.gl.uniformMatrix4fv(uni.pos,false,this.f32Array(value)) ;
			break ;
		case "vec2":
			this.gl.uniform2fv(uni.pos, this.f32Array(value)) ;
			break ;
		case "vec2v":
			this.gl.uniform2fv(uni.pos, this.f32Array(ar)) ;
			break ;
		case "vec3":
			this.gl.uniform3fv(uni.pos, this.f32Array(value)) ;
			break ;
		case "vec3v":
			this.gl.uniform3fv(uni.pos, this.f32Array(ar))
			break ;
		case "vec4":
			this.gl.uniform4fv(uni.pos, this.f32Array(value)) ;
			break ;
		case "vec4v":
			this.gl.uniform4fv(uni.pos, this.f32Array(ar)) ;
			break ;
		case "int":
		case "bool":
			this.gl.uniform1i(uni.pos,value) ;
			break ;
		case "ivec2":
		case "bvec2":
			this.gl.uniform2iv(uni.pos, this.i16Array(value)) ;
			break ;
		case "ivec2v":
		case "bvec2v":
			this.gl.uniform2iv(uni.pos, this.i16Array(ar)) ;
			break ;
		case "ivec3":
		case "bvec3":
			this.gl.uniform3iv(uni.pos, this.i16Array(value)) ;
			break ;
		case "ivec3v":
		case "bvec3v":
			this.gl.uniform3iv(uni.pos, this.i16Array(ar)) ;
			break ;
		case "ivec4":
		case "bvec4":
			this.gl.uniform4iv(uni.pos, this.i16Array(value)) ;
			break ;
		case "ivec4v":
		case "bvec4v":
			this.gl.uniform4iv(uni.pos, this.i16Array(ar)) ;
			break ;
		case "intv":
		case "boolv":
			this.gl.uniform1iv(uni.pos,this.i16Array(value)) ;
			break ;
		case "float":
			this.gl.uniform1f(uni.pos,value) ;
			break ;
		case "floatv":
			this.gl.uniform1fv(uni.pos,this.f32Array(value)) ;
			break ;
		case "sampler2D":
			if(typeof value == 'string') value = this.getTexIndex(value)
			this.gl.activeTexture(this.gl.TEXTURE0+uni.texunit);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texobj[value]);
			if(this.data.texture[value]==undefined) break ;
			if(this.data.texture && this.data.texture[value].video) {
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data.texture[value].video);	
			}
			this.gl.uniform1i(uni.pos,uni.texunit) ;
			break ;
	}
}

WWG.prototype.Render.prototype.setShader = function(data) {
	let tu = 0 ;
	function parse_shader(src) {
		const l = src.split("\n") ;
		const uni = [] ;
		const att = [] ;
		const def = {}

		for(i=0;i<l.length;i++) {
			let ln = l[i] ;
			if( ln.match(/^\s*#define\s*([^\s]+)\s+([^\s]+)/)) {
				def[RegExp.$1.trim()] = RegExp.$2.trim()
			}
			if( ln.match(/^\s*uniform\s*([0-9a-z]+)\s+([0-9a-z_]+)(\[[^\]]+\])?/i)) {
				let u = {type:RegExp.$1,name:RegExp.$2} ;
				if(RegExp.$3!="") {
					u.type = u.type+"v" ;
					let k = RegExp.$3.substr(1,RegExp.$3.length-2).trim()
					u.dim = parseInt(k) ;
					if(isNaN(u.dim)) u.dim = def[k]
				}
				if(u.type=="sampler2D") u.texunit = tu++ ;
				uni.push(u) ;
			}
			if( ln.match(/^\s*(?:attribute|in)\s+([0-9a-z]+)\s*([0-9a-z_]+)/i)) {
				att.push( {type:RegExp.$1,name:RegExp.$2}) ;
			}
		}
		return {uni:uni,att:att} ;
	}

	const gl = this.gl ;
	return new Promise((resolve,reject)=> {
		if(!data.vshader) { reject("no vshader") ;return false;}
		if(!data.fshader) { reject("no fshader") ;return false;}
		let vss ;
		let fss ;
		let pr = [] ;
		if(data.vshader.text ) vss = data.vshader.text ;
		else if(data.vshader.src) {
			pr.push( this.wwg.loadAjax(data.vshader.src).then((result)=> {
				vss = result ;
				resolve() ;
			}).catch((err)=> {
				reject(err) ;
			}))
		}
		if(data.fshader.text ) fss = data.fshader.text ;
		else if(data.fshader.src) {
			pr.push( this.wwg.loadAjax(data.fshader.src).then((result)=> {
				fss = result ;
				resolve() ;
			}).catch((err)=> {
				reject(err) ;
			}))
		}
		Promise.all(pr).then((res)=> {
//			console.log(vss) ;
//			console.log(fss) ;
			let ret = {} ;
			let vshader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vshader, vss);
			gl.compileShader(vshader);
			if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
				reject("vs error:"+gl.getShaderInfoLog(vshader)); return false;
			}
			ret.vshader = vshader ;
		
			let fshader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fshader, fss);
			gl.compileShader(fshader);
			if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
				reject("fs error:"+gl.getShaderInfoLog(fshader)); return false;
			}
			ret.fshader = fshader ;
			
			let program = gl.createProgram();
			gl.attachShader(program, vshader);
			gl.attachShader(program, fshader);
			gl.linkProgram(program);
			if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				reject("link error:"+gl.getProgramInfoLog(program)); return false;
			}
			ret.program = program ;
			gl.useProgram(program);
		
			let vr = parse_shader(vss) ;	
//			console.log(vr) ;
			ret.vs_att = {} ;	
			for(let i in vr.att) {
				vr.att[i].pos = gl.getAttribLocation(program,vr.att[i].name) ;
				ret.vs_att[vr.att[i].name] = vr.att[i] ;
			}
			ret.vs_uni = {} ;
			for(let i in vr.uni) {
				vr.uni[i].pos = gl.getUniformLocation(program,vr.uni[i].name) ;
				vr.uni[i].cache = null 
				ret.vs_uni[vr.uni[i].name] = vr.uni[i] ;
			}
		
			let fr = parse_shader(fss) ;	
//			console.log(fr);	
			ret.fs_uni = {} ;
			for(let i in fr.uni) {
				fr.uni[i].pos = gl.getUniformLocation(program,fr.uni[i].name) ;
				fr.uni[i].cache = null 
				ret.fs_uni[fr.uni[i].name] = fr.uni[i] ;
			}
			resolve(ret) ;
		}).catch((err)=>{
			reject(err) ;
		}) ;
	})
}
WWG.prototype.Render.prototype.setUniValues = function(data) {
	if(data.vs_uni) {
		for(let i in data.vs_uni) {
			if(this.vs_uni[i]) {
				this.setUnivec(this.vs_uni[i], data.vs_uni[i]) ;
			}  ;
		}
	}
	if(data.fs_uni) {
		for(let i in data.fs_uni) {
			if(this.fs_uni[i]) {
				this.setUnivec(this.fs_uni[i], data.fs_uni[i]) ;
			}  ;
		}
	}
	return true ;
}
WWG.prototype.Render.prototype.genTex = function(img,option) {
	if(!option) option={flevel:0} ;
	let gl = this.gl ;
	const formatstr = {"rgb":gl.RGB,"gray":gl.LUMINANCE,"grayalpha":gl.LUMINANCE_ALPHA}
	let format = (option.format && formatstr[option.format])?formatstr[option.format]:gl.RGBA

	let tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	if(option.isarray) {
		if(img instanceof Float32Array ) 
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, option.width,option.height,0,format, gl.FLOAT, img,0);
		else 
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, option.width,option.height,0,format, gl.UNSIGNED_BYTE, img);
		 option.flevel = 0 
		 option.nomipmap = true
	} else 	gl.texImage2D(gl.TEXTURE_2D, 0, format, format,gl.UNSIGNED_BYTE, img);

	if(!option.nomipmap) gl.generateMipmap(gl.TEXTURE_2D);
	//NEAREST LINEAR NEAREST_MIPMAP_NEAREST NEAREST_MIPMAP_LINEAR LINEAR_MIPMAP_NEAREST LINEAR_MIPMAP_LINEAR
	switch(option.flevel) {
	case 0:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		break;
	case 1:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		break;
	case 2:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		break;
	}
	if(option.repeat==2) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	} else if(option.repeat==1) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);				
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	}
	if(this.wwg.ext_anis && option.anisotropy) {
		gl.texParameteri(gl.TEXTURE_2D, this.wwg.ext_anis.TEXTURE_MAX_ANISOTROPY_EXT, option.anisotropy);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);	
	return tex ;	
}
WWG.prototype.Render.prototype.loadTex = function(tex) {
//	console.log( tex);
	let gl = this.gl ;

	return new Promise((resolve,reject)=> {
		if(tex.src) {
			if(tex.opt && tex.opt.cors) {
				this.wwg.loadImageAjax(tex.src).then((img)=>{
					resolve( this.genTex(img,tex.opt)) ;
				}).catch((err)=>reject(err));
			} else {
				let img = new Image() ;
				img.onload = ()=> {
					resolve( this.genTex(img,tex.opt) ) ;
				}
				img.onerror = ()=> {
					reject("cannot load image") ;
				}
				img.src = tex.src ;
			}
		} else if(tex.img instanceof Image) {
			resolve( this.genTex(tex.img,tex.opt) ) 
		} else if(tex.video ) {
			resolve( this.genTex(tex.video,{nomipmap:true,flevel:0,repeat:2}) ) 
		} else if(tex.buffer) {
			if(tex.mrt!=undefined) {
				resolve( tex.buffer.fb.t[tex.mrt])
			}
			else resolve( tex.buffer.fb.t) ;
		} else if(tex.texture) {
			resolve( tex.texture) ;
		} else if(tex.canvas) {
			resolve( this.genTex(tex.canvas,tex.opt)) ;
		} else if(tex.array) {
			tex.opt.isarray = true ;
			resolve( this.genTex(tex.array,tex.opt)) ;
		} else {
			reject("no image")
		}
	})
}
WWG.prototype.Render.prototype.getTexIndex = function(name) {
	if(!this.data.texture) return null 
	let i 
	for(i=0;i<this.data.texture.length;i++) {
		if(this.data.texture[i].name==name) break;
	}
	return (i==this.data.texture.length)?null:i
}
WWG.prototype.Render.prototype.addTex = function(texdata) {
	return new Promise((resolve,reject)=>{
		if(!this.data.texture) this.data.texture = []
		this.data.texture.push(texdata)
		this.loadTex(texdata).then((tex)=>{
			this.texobj.push(tex) ;
			resolve(this.texobj.length-1)
		}).catch((err)=>reject(err));
	})
}
WWG.prototype.Render.prototype.removeTex = function(tex) {
	if(typeof tex == "string") tex = this.getTexIndex(tex) 
	if(tex === null ) return 
	this.data.texture[tex] = null
	this.texobj[tex] = null 
}

WWG.prototype.Render.prototype.frameBuffer = function(os) {
	let gl = this.gl ;
	console.log("create framebuffer "+os.width+"x"+os.height) ;
	let mrt = os.mrt ;
	let ttype = gl.UNSIGNED_BYTE ;
	let tfilter = gl.LINEAR ;
	if(this.wwg.ext_ftex && os.float ) {
		ttype = gl.FLOAT ;
		tfilter = gl.NEAREST ;
		console.log("use float tex") ;
	}
	let fblist = [] ;
	let frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	//depth
	let renderBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, os.width, os.height);	
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	//texture
	if(mrt) {
		let fTexture = [] ;
		for(let i=0;i<mrt;i++) {
			fTexture[i] = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, fTexture[i]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, os.width, os.height, 0, gl.RGBA, ttype, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, tfilter);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, tfilter);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, this.wwg.mrt_att + i, gl.TEXTURE_2D, fTexture[i], 0);	
			fblist.push(this.wwg.mrt_att + i)		
		}
	} else {
		let fTexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, fTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, os.width, os.height, 0, gl.RGBA, ttype, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, tfilter);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, tfilter);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);	

	let ret = {ox:os.offsetX,oy:os.offsetY,width:os.width,height:os.height,f:frameBuffer,d:renderBuffer,t:fTexture}
	if(mrt) ret.fblist = fblist ;
	return ret ;
}
WWG.prototype.Render.prototype.setRender =function(data) {
	let gl = this.gl ;
	this.env = data.env ;
	this.data = data ;

	return new Promise((resolve,reject)=> {
		if(!gl) { reject("no init") ;return ;}
		let pr = [] ;
		this.setShader({fshader:data.fshader,vshader:data.vshader}).then((ret)=> {
			//set program
			this.vshader = ret.vshader ;
			this.fshader = ret.fshader ;
			this.program = ret.program ;
			this.vs_uni = ret.vs_uni ;
			this.vs_att = ret.vs_att ;
			this.fs_uni = ret.fs_uni ;
			
			// load textures
			if(data.texture) {
				for(let i=0;i<data.texture.length;i++) {
					pr.push(this.loadTex( data.texture[i])) ;
				}
			}

			Promise.all(pr).then((result)=> {
//				console.log(result) ;
				this.texobj = result ;
				// set initial values
				if(!this.setUniValues(data)) {
					reject("no uniform name") ;
					return ;
				}
				
				if(this.env.cull) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
				if(this.env.face_cw) gl.frontFace(gl.CW); else gl.frontFace(gl.CCW);
				if(!this.env.nodepth) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);		
		
				//set model 
				for(let i =0;i<data.model.length;i++) {
					data.model[i].id = ++this.modelId 
					data.model[i].obuf = this.setObj( data.model[i],true) ;
//					if(data.model[i].name) this.modelHash[data.model[i].name] = data.model[i] ;
				}
				this.modelCount = data.model.length ;
//				console.log(this.obuf);
				
				if(this.env.offscreen) {// renderbuffer 
					if(this.env.offscreen.mrt) { //MRT
						if(!this.wwg.ext_mrt) reject("MRT not support") ;
					}
					this.fb = this.frameBuffer(this.env.offscreen) ;	
				}
				resolve(this) ;
				
			}).catch((err)=> {
				reject(err) ;
			})
		}).catch((err)=> {reject(err);})
	});
}

WWG.prototype.Render.prototype.clear = function() {
	let cc = this.env.clear_color ;
	this.gl.clearColor(cc[0],cc[1],cc[2],cc[3]);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

WWG.prototype.Render.prototype.f32Array = function(ar) {
	if(ar instanceof Float32Array) return ar ;
	else return new Float32Array(ar) ;
}
WWG.prototype.Render.prototype.i16Array = function(ar) {
	if(ar instanceof Int16Array) return ar ;
	else return new Int16Array(ar) ;
}
WWG.prototype.Render.prototype.i32Array = function(ar) {
	if(ar instanceof Uint32Array) return ar ;
	else return new Uint32Array(ar) ;
}
WWG.prototype.Render.prototype.setObj = function(obj,flag) {
	let gl = this.gl
	let geo = obj.geo ;
	let inst = obj.inst ;
	let ret = {} ;
	let vao
	if(this.wwg.ext_vao) {
		vao = this.wwg.vao_create() ;
		this.wwg.vao_bind(vao);
		ret.vao = vao ;
	}
	
	let vbo = gl.createBuffer() 
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo) ;

	let tl = 0 ;
	let ats = [] ;
	for(let i=0;i<geo.vtx_at.length;i++) {
		ats.push( this.vs_att[geo.vtx_at[i]] ) ;
		tl += this.wwg.vsize[this.vs_att[geo.vtx_at[i]].type] ;
	}

	ret.ats = ats ;
	ret.tl = tl ;
	let ofs = 0 ;
	for(let i in this.vs_att ) {
		if(this.vs_att[i].pos>=0) gl.disableVertexAttribArray(this.vs_att[i].pos);
	}
	for(let i=0;i<ats.length;i++) {
		let s = this.wwg.vsize[ats[i].type] ;
		gl.enableVertexAttribArray(this.vs_att[ats[i].name].pos);
		gl.vertexAttribPointer(this.vs_att[ats[i].name].pos, s, gl.FLOAT, false, tl*4, ofs);
		ofs += s*4 ;	
	} 	
	ret.vbo = vbo ;
	let ibo
	if(geo.idx) {
		ibo = gl.createBuffer() ;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo) ;
		ret.ibo = ibo ;
	}
	let ibuf 
	if(inst) {
		ibuf = gl.createBuffer() 
		gl.bindBuffer(gl.ARRAY_BUFFER, ibuf) ;
		let tl = 0 ;
		let ats = [] ;
		for(let i=0;i<inst.attr.length;i++) {
			ats.push( this.vs_att[inst.attr[i]] ) ;
			tl += this.wwg.vsize[this.vs_att[inst.attr[i]].type] ;
		}
		tl = tl*4 ;
		ret.iats = ats ;
		ret.itl = tl ;
		let ofs = 0 ;
		for(let i=0;i<ats.length;i++) {
			let divisor = (inst.divisor)?inst.divisor[i]:1 ;
			let s = this.wwg.vsize[ats[i].type] ;
			let pos = this.vs_att[ats[i].name].pos
			gl.enableVertexAttribArray(pos);
			gl.vertexAttribPointer(pos, s, gl.FLOAT, false, tl, ofs);
			ofs += s*4 ;
			this.wwg.inst_divisor(pos, divisor)	
		} 
		ret.inst = ibuf 
	}
	
	if(this.wwg.ext_vao) this.wwg.vao_bind(null);

	if(this.wwg.ext_vao) this.wwg.vao_bind(vao);
	if(flag) {
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo) ;
		gl.bufferData(gl.ARRAY_BUFFER, 
			this.f32Array(geo.vtx), (geo.dynamic)?gl.DYNAMIC_DRAW:gl.STATIC_DRAW) ;
	}
	if(flag && geo.idx) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo) ;
		if(geo.vtx.length/(ret.tl) > 65536 && this.wwg.ext_i32) {
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
				this.i32Array(geo.idx),gl.STATIC_DRAW ) ;
			ret.i32 = true ;
		} else {
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
				this.i16Array(geo.idx),gl.STATIC_DRAW ) ;
			ret.i32 = false ;
		}
	}
	if(flag && inst) {
		gl.bindBuffer(gl.ARRAY_BUFFER, ibuf) ;
		gl.bufferData(gl.ARRAY_BUFFER, 
			this.f32Array(inst.data),(inst.dynamic)?gl.DYNAMIC_DRAW:gl.STATIC_DRAW ) ;
	}
	if(this.wwg.ext_vao) this.wwg.vao_bind(null);
		
	return ret ;
}
WWG.prototype.Render.prototype.getModels = function() {
	return this.data.model.filter((m)=>(m!==null))	
}
WWG.prototype.Render.prototype.getModelIdx = function(name) {
	let idx = false 
	if(typeof name != 'string') idx = parseInt(name) ;
	else {
		for(let i=0;i<this.data.model.length;i++) 	{
			if(this.data.model[i]===null) continue 
			if(name==this.data.model[i].name) {idx = i ;break }
		}
	}
	return idx ;	
}
// add model
WWG.prototype.Render.prototype.addModel = function(model) {
	let idx = false
	if(model.name) idx = this.getModelIdx(model.name)
	if(idx!==false ) {
		this.data.model[idx] = model ;
		this.data.model[idx].obuf = this.setObj(model,true) ;
		return 
	}
	model.id = ++this.modelId
	this.data.model.push(model) ;
	this.data.model[this.data.model.length-1].obuf = this.setObj(model,true) ;
	this.modelCount++
//	if(model.name) this.modelHash[model.name] = this.data.model.length -1 ;
}
// remove model
WWG.prototype.Render.prototype.removeModel = function(model) {
	let mi = this.getModelIdx(model) 
	if(mi===false) return false 
//	delete this.modelHash[this.data.model[mi].name] 
	this.data.model[mi].obuf = null 
	this.data.model[mi] = null 
	this.modelCount--  
	return true 
}
// update attribute buffer 
WWG.prototype.Render.prototype.updateModel = function(name,mode,buf,sub=null) {
	let idx = this.getModelIdx(name) ;
	let obuf = this.data.model[idx].obuf ;
	switch(mode) {
		case "vbo":	
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obuf.vbo) ;
			break ;
		case "inst":
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obuf.inst) ;
			break ;
	}
	if(sub) 
		this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sub.dofs*4, this.f32Array(buf),sub.sofs,sub.count)	
	else 
		this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.f32Array(buf))	

}
WWG.prototype.Render.prototype.updateModelInstance = function(name,buf,count) {
	let idx = this.getModelIdx(name) ;
	let obuf = this.data.model[idx].obuf ;
	this.data.model[idx].inst.count = count ;
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obuf.inst) ; 
//		this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.f32Array(buf))	
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.f32Array(buf),this.gl.DYNAMIC_DRAW ) ;
}
WWG.prototype.Render.prototype.getModelData =function(name) {
	let idx = this.getModelIdx(name) ;
	return this.data.model[idx] ;
}
// update texture 
WWG.prototype.Render.prototype.updateTex = function(idx,tex,opt) {
	if(typeof idx == 'string') idx = this.getTexIndex(idx)
	var tdat = this.data.texture[idx]
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.texobj[idx]);

	if(tdat.array) {
		if(!opt) 
			if(tdat.array instanceof Float32Array ) 
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, 
				tdat.opt.width,tdat.opt.height,0,this.gl.RGBA, this.gl.FLOAT, tex);
			else
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
				tdat.opt.width,tdat.opt.height,0,this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex);	
		else 
			if(tdat.array instanceof Float32Array ) 
				this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 
				opt.sx,opt.sy,opt.width,opt.height,this.gl.RGBA, this.gl.FLOAT, tex,opt.ofs);
			else
				this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 
				opt.sx,opt.sy,opt.width,opt.height,this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex,opt.ofs);
	} else {
		if(!opt) {
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex);
		} else {
			if(opt.wx>0 && opt.wy>0)
				this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, opt.sx,opt.sy,opt.wx,opt.wy,this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex);	
			else 	
				this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, opt.sx,opt.sy , this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex);
		}
	}
	if(tdat.opt && !tdat.opt.nomipmap) this.gl.generateMipmap(this.gl.TEXTURE_2D);
}
//update uniform values
WWG.prototype.Render.prototype.pushUniValues = function(u) {
	if(u.vs_uni) {
		for(let i in u.vs_uni) {
			this.update_uni.vs_uni[i] = u.vs_uni[i] ;
		}
	}
	if(u.fs_uni) {
		for(let i in u.fs_uni) {
			this.update_uni.fs_uni[i] = u.fs_uni[i] ;
		}
	}
}
WWG.prototype.Render.prototype.updateUniValues = function(u) {
	if(!u) {
		this.update_uni = {vs_uni:{},fs_uni:{}} ;
		return ;
	}
//	console.log("update uni");
	this.setUniValues(this.update_uni)
}

// draw call
WWG.prototype.Render.prototype.draw = function(update,cls) {
//console.log("draw");

	let gl = this.gl ;
	gl.useProgram(this.program);
	if(this.env.offscreen) {// renderbuffer 
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb.f);
		if(this.env.offscreen.mrt) this.wwg.mrt_draw(this.fb.fblist);
		gl.viewport(fb.offsetX,fb.offsetY,this.fb.width,this.fb.height) ;
	}
	if(!cls) this.clear() ;
	let models = this.data.model
	for(let b=0;b<models.length;b++) {
		if(models[b]===null) continue 
		let cmodel = models[b] ;
		if(cmodel.hide) continue ;
		if(cmodel.obuf==null) continue ;

		let geo = cmodel.geo ;
		this.updateUniValues(0) ;
		this.pushUniValues(this.data) ;
		this.pushUniValues(cmodel);
		if(update) {
			// set modified values
			if(!Array.isArray(update)) update = [update ]
			for(let i=0;i<update.length;i++) {
				this.pushUniValues(update[i]) ;
				if(update[i].model) {
					let model =update[i].model[b] ;
					if(model) this.pushUniValues(model) ;
				}
			}
		}
		this.updateUniValues(1)

		let obuf = cmodel.obuf ;
		let ofs = (geo.ofs>0)?geo.ofs:0 ;
		if(this.wwg.ext_vao)  this.wwg.vao_bind(obuf.vao);
		else {
			gl.bindBuffer(gl.ARRAY_BUFFER, obuf.vbo) ;
			let aofs = 0 ;
			for(let i in this.vs_att ) {
				gl.disableVertexAttribArray(this.vs_att[i].pos);
			}
			for(let i=0;i<obuf.ats.length;i++) {
				let s = this.wwg.vsize[obuf.ats[i].type] ;
				gl.enableVertexAttribArray(this.vs_att[obuf.ats[i].name].pos);
				gl.vertexAttribPointer(this.vs_att[obuf.ats[i].name].pos, s, gl.FLOAT, false, obuf.tl*4, aofs);
				aofs += s*4 ;	
			}
			if(obuf.ibo) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obuf.ibo) ;
			if(obuf.inst) {
				let inst = cmodel.inst ;
				gl.bindBuffer(gl.ARRAY_BUFFER, obuf.inst) ;
				let aofs = 0 ;
				for(let i=0;i<obuf.iats.length;i++) {
					let divisor = (inst.divisor)?inst.divisor[i]:1 ;
					let s = this.wwg.vsize[obuf.iats[i].type] ;
					let pos = this.vs_att[obuf.iats[i].name].pos
					gl.enableVertexAttribArray(pos);
					gl.vertexAttribPointer(pos, s, gl.FLOAT, false, obuf.itl, aofs);
					aofs += s*4 ;
					this.wwg.inst_divisor(pos, divisor)		
				}
			}
		}
		if(cmodel.preFunction) {
			
			cmodel.preFunction(gl,cmodel,obuf) ;
		}
		if(cmodel.blend!==undefined) {
			gl.enable(gl.BLEND) ;
			if(cmodel.blend=="alpha") gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
		}
		if(cmodel.cull!==undefined) {
			if(cmodel.cull) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
		}
		let gmode = this.wwg.dmodes[geo.mode]
		if(gmode==undefined) {
				console.log("Error: illigal draw mode") ;
				return false ;
		}
		if(cmodel.inst) {
			if(geo.idx) this.wwg.inst_draw(gmode, geo.idx.length, (obuf.i32)?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT, ofs, cmodel.inst.count);
			else this.wwg.inst_drawa(gmode, ofs,(geo.count>0)?geo.count:geo.vtx.length/obuf.tl, cmodel.inst.count);
		} else {
			if(geo.idx) gl.drawElements(gmode, geo.idx.length, (obuf.i32)?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT, ofs);
			else gl.drawArrays(gmode, ofs,
				(geo.count>0)?geo.count:geo.vtx.length/obuf.tl);
		}
		if(this.wwg.ext_vao) this.wwg.vao_bind(null);
		else {
			
		}
		if(cmodel.blend!==undefined) {
			gl.disable(gl.BLEND) ;
		}
		if(cmodel.cull!==undefined) {
			if(this.env.cull) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
		}
		if(cmodel.postFunction) {
			cmodel.postFunction(gl,cmodel) ;
		}
	}
	if(this.env.offscreen) {// unbind renderbuffer 
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0,0,this.wwg.can.width,this.wwg.can.height) ;
	}
	return true ;
}//Model library for WWG
// Version 1.0 
// 2016-2017 wakufactory.jp 
// license: MIT 

// export default 
class WWModel {

// generate primitive
 primitive(type,param) {
	if(!param) param = {} ;
	let wx = (param.wx)?param.wx:1.0 ;
	let wy = (param.wy)?param.wy:1.0 ;
	let wz = (param.wz)?param.wz:1.0 ;
	let div = (param.div)?param.div:10 ;
	let divx = (param.divx)?param.divx:div ;
	let divy = (param.divy)?param.divy:div ;
	let divz = (param.divz)?param.divz:div ;
	let ninv = (param.ninv)?-1:1 ;
	let p = [] ;
	let n = [] ;
	let t = [] ;
	let s = [] ;
	let PHI = Math.PI *2 ;

	switch(type) {
	case "sphere":
		for(let i = 0 ; i <= div ; ++i) {
			let v = i / (0.0+div);
			let y = Math.cos(Math.PI * v), r = Math.sin(Math.PI * v);
			for(let j = 0 ; j <= div*2 ; ++j) {
				let u = j / (0+div*2) ;
				let x = (Math.cos(PHI * u) * r)
				let z = (Math.sin(PHI * u) * r)
				p.push([x*wx,y*wy,z*wz])
				n.push([x*ninv,y*ninv,z*ninv])
				t.push([(ninv>0)?1-u:u,1-v])
			}
		}
		let d2 = div*2+1 ;
		for(let j = 0 ; j < div ; ++j) {
			let base = j * d2;
			for(let i = 0 ; i < div*2 ; ++i) {
				if(ninv>0) s.push(
					[base + i,	  base + i + 1, base + i     + d2],
					[base + i + d2, base + i + 1, base + i + 1 + d2]);
				else s.push(
					[base + i     + d2,	base + i + 1, base + i],
					[base + i + 1 + d2, base + i + 1, base + i + d2 ]);
			}
		}
		break;
		
	case "sphere2":
		const pdiv = (param.div)?param.div:6 
		const PH = Math.PI/2
		for(let yi=0; yi<pdiv;yi++) {
			let y = Math.sin(PH*yi/pdiv)
			let xr = Math.cos(PH*yi/pdiv)
			let xdiv = pdiv-yi
			for(let xi=0;xi<=xdiv;xi++) {
				let x = Math.cos(PH*xi/xdiv)*xr
				let z = Math.sin(PH*xi/xdiv)*xr
				p.push([x*wx,y*wy,z*wz])
				n.push([x,y,z])
				t.push([1-xi/xdiv/4,0.5+yi/pdiv/2])
			}
		}
		p.push([0,wy,0])
		n.push([0,1,0])
		t.push([0.75,1])
		let li = 0
		for(let yi=0;yi<pdiv;yi++) {
			let xdiv = (pdiv-yi)*2-1
			let xofs = pdiv-yi+1
			for(let xi=0;xi<xdiv;xi++) {
				let xd = Math.floor(xi/2)
				if(xi%2==0) {
					if(ninv>0) s.push([xd+li,xd+li+xofs,xd+li+1])
					else  s.push([xd+li,xd+li+1,xd+li+xofs])	
				} else {
					if(ninv>0) s.push([xd+1+li,xd+li+xofs,xd+li+xofs+1])
					else  s.push([xd+1+li,xd+li+xofs+1,xd+li+xofs])
				}
			}
			li += xofs
		}
		let pc = p.length 
		let sc = s.length
		for(let i=0;i<pc;i++) {
			p.push([p[i][0],-p[i][1],p[i][2]])
			n.push([p[i][0],-p[i][1],p[i][2]])
			t.push([t[i][0],1-t[i][1]])
		}
		for(let i=0;i<sc;i++) {
			s.push([s[i][0]+pc,s[i][2]+pc,s[i][1]+pc])
		}
		pc = p.length 
		sc = s.length
		for(let i=0;i<pc;i++) {
			p.push([-p[i][0],p[i][1],p[i][2]])
			n.push([-p[i][0],p[i][1],p[i][2]])
			t.push([1-t[i][0]+0.5,t[i][1]])
		}
		for(let i=0;i<sc;i++) {
			s.push([s[i][0]+pc,s[i][2]+pc,s[i][1]+pc])
		}
		pc = p.length 
		sc = s.length
		for(let i=0;i<pc;i++) {
			p.push([p[i][0],p[i][1],-p[i][2]])
			n.push([p[i][0],p[i][1],-p[i][2]])
			t.push([1-t[i][0],t[i][1]])
		}
		for(let i=0;i<sc;i++) {
			s.push([s[i][0]+pc,s[i][2]+pc,s[i][1]+pc])
		}	
		break ;
	case "cylinder":
		divy = (param.divy)?param.divy:1
		for(let i = 0 ; i <= div ; ++i) {
			let v = i / (0.0+div);
			let z = Math.sin(PHI * v)*wz, x = Math.cos(PHI * v)*wx;
			let dy = wy*2/divy ;
			for(let yi=0;yi<=divy;yi++) {
				p.push([x,yi*dy-wy,z])
				n.push([x*ninv,0,z*ninv])
				t.push([(ninv>0)?1-v:v,yi/divy])
//				p.push([x,(yi+1)*dy-wy,z])
//				n.push([x*ninv,0,z*ninv,0])
//				t.push([(ninv>0)?1-v:v,0])
			}			
		}
		for(let j =0; j < div ;j++) {
			for(let yi=0;yi<divy;yi++) {
				let j2 = j*(divy+1)+yi 
				if(ninv<0)s.push([j2,j2+(divy+1),j2+(divy+1)+1,j2+1]) ;
				else s.push([j2,j2+1,j2+3,j2+2]) ;
			}
		}
		if(param.cap) {
			
		}
		break; 
	case "ring":
		divy = (param.divy)?param.divy:1
		for(let i = 0 ; i <= div ; ++i) {
			let v = i / (0.0+div);
			let z = Math.sin(PHI * v)*wz, x = Math.cos(PHI * v)*wx;
			for(let yi=0;yi<divy;yi++) {
				p.push([x,wy,z])
				n.push([x*ninv,0,z*ninv])
				t.push([(ninv>0)?1-v:v,1])
				p.push([x,-wy,z])
				n.push([x*ninv,0,z*ninv,0])
				t.push([(ninv>0)?1-v:v,0])
			}			
		}
		for(let j =0; j < div ;j++) {
			if(ninv>0)s.push([j*2,j*2+2,j*2+3,j*2+1]) ;
			else s.push([j*2,j*2+1,j*2+3,j*2+2]) ;
		}
		if(param.cap) {
			
		}
		break; 
	case "cone":
		for(let i = 0 ; i <= div ; ++i) {
			let v = i / (0.0+div);
			let z = Math.sin(PHI * v)*wz, x = Math.cos(PHI * v)*wx;
			p.push([0,wy,0])
			n.push([x*ninv,0,z*ninv])
			t.push([(ninv>0)?1-v:v,1])
			p.push([x,-wy,z])
			n.push([x*ninv,0,z*ninv,0])
			t.push([(ninv>0)?1-v:v,0])			
		}
		for(let j =0; j < div ;j++) {
			if(ninv>0)s.push([j*2,j*2+2,j*2+3,j*2+1]) ;
			else s.push([j*2,j*2+1,j*2+3,j*2+2]) ;
		}
		break; 
	case "disc":
		for(let i = 0 ; i < div ; ++i) {
			let v = i / (0.0+div);
			let z = Math.cos(PHI * v)*wz, x = Math.sin(PHI * v)*wx;
			p.push([x,0,z])
			n.push([0,1,0])
			t.push([(x/wx+1)/2,(z/wz+1)/2])	
		}
		p.push([0,0,0])
		n.push([0,1,0])
		t.push([0.5,0.5])
		for(let j =0; j < div-1 ;j++) {
			s.push([j,j+1,div]) ;
		}
		s.push([div-1,0,div])
		break; 
	case "plane":
		if(!param.wz)  {
			p = [[wx,-wy,0],[wx,wy,0],[-wx,wy,0],[-wx,-wy,0]]
			n = [[0,0,ninv],[0,0,ninv],[0,0,ninv],[0,0,ninv]]
		} else if(!param.wx){
			p = [[0,-wy,-wz],[0,wy,-wz],[0,wy,wz],[0,-wy,wz]]
			n = [[ninv,0,0],[ninv,0,0],[ninv,0,0],[ninv,0,0]]
		}else {
			p = [[wx,0,wz],[wx,0,-wz],[-wx,0,-wz],[-wx,0,wz]]
			n = [[0,ninv,0],[0,ninv,0],[0,ninv,0],[0,ninv,0]]
		}
		t = (ninv>0)?[[1,0],[1,1],[0,1],[0,0]]:[[-1,0],[-1,1],[0,1],[0,0]]
		s = (ninv>0)?[[0,1,2],[2,3,0]]:[[2,1,0],[0,3,2]]
		break ;
	case "box":
		p = [
			[wx,wy,wz],[wx,-wy,wz],[-wx,-wy,wz],[-wx,wy,wz],		//+z
			[wx,wy,-wz],[wx,-wy,-wz],[-wx,-wy,-wz],[-wx,wy,-wz],//-z
			[wx,wy,wz],[wx,-wy,wz],[wx,-wy,-wz],[wx,wy,-wz],		//+x
			[-wx,wy,wz],[-wx,-wy,wz],[-wx,-wy,-wz],[-wx,wy,-wz],//-x
			[wx,wy,wz],[wx,wy,-wz],[-wx,wy,-wz],[-wx,wy,wz],		//+y
			[wx,-wy,wz],[wx,-wy,-wz],[-wx,-wy,-wz],[-wx,-wy,wz],	//-y
		]
		n = [
			[0,0,ninv],[0,0,ninv],[0,0,ninv],[0,0,ninv],
			[0,0,-ninv],[0,0,-ninv],[0,0,-ninv],[0,0,-ninv],
			[ninv,0,0],[ninv,0,0],[ninv,0,0],[ninv,0,0],
			[-ninv,0,0],[-ninv,0,0],[-ninv,0,0],[-ninv,0,0],
			[0,ninv,0],[0,ninv,0],[0,ninv,0],[0,ninv,0],
			[0,-ninv,0],[0,-ninv,0],[0,-ninv,0],[0,-ninv,0]
		]
		t = (param.cubemap==1)?[
			[3/4,2/3],[3/4,1/3],[1,1/3],[1,2/3],
			[1/2,2/3],[1/2,1/3],[1/4,1/3],[1/4,2/3],
			[3/4,2/3],[3/4,1/3],[1/2,1/3],[1/2,2/3],
			[0,2/3],[0,1/3],[1/4,1/3],[1/4,2/3],
			[1/2,1],[1/2,2/3],[1/4,2/3],[1/4,1],
			[1/2,0],[1/2,1/3],[1/4,1/3],[1/4,0]
		]:[
			[1,1],[1,0],[0,0],[0,1],
			[0,1],[0,0],[1,0],[1,1],
			[0,1],[0,0],[1,0],[1,1],
			[1,1],[1,0],[0,0],[0,1],
			[1,0],[1,1],[0,1],[0,0],
			[1,1],[1,0],[0,0],[0,1]
		]
		s = (ninv>0)?[
			[3,1,0],[2,1,3],
			[4,5,7],[7,5,6],
			[8,9,11],[11,9,10],
			[15,13,12],[14,13,15],	
			[16,17,19],[19,17,18],
			[23,21,20],[22,21,23],		
		]:[
			[0,1,3],[3,1,2],
			[7,5,4],[6,5,7],
			[11,9,8],[10,9,11],
			[12,13,15],[15,13,14],	
			[19,17,16],[18,17,19],
			[20,21,23],[23,21,22],		
		]
		break ;
	case "mesh":
		this.parametricModel( function(u,v) {
			let r = {
				px:(u-0.5)*wx, py:0, pz:(v-0.5)*wz,
				nx:0, ny:1, nz:0,
				mu:u, mv:v }
			return r ;
		},{start:1.0,end:0,div:divx},{start:0,end:1,div:divz},{ninv:param.ninv}) ;
		return this ;		
		break ;
	case "torus":
		this.parametricModel( function(u,v) {
			let R = 1.0 ;
			let sr = (param.sr)?param.sr:0.5 ;
			let du = u ;
			let dv = -v ;
			let cx = Math.sin(du*PHI) ;
			let cz = Math.cos(du*PHI) ;
			let vx = Math.sin(dv*PHI) ;
			let vy = Math.cos(dv*PHI) ;
			let tx = 1
			let mx = sr*vx*cx ;
			let mz = sr*vx*cz ;
			let my = sr*vy ;
			let ml = Math.hypot(mx,my,mz) ;
	
			let px = R*cx + tx*mx ;
			let pz = R*cz + tx*mz ;
			let py = tx*my ;
			let r = {
				px:px*wx, py:py*wy, pz:pz*wz,
				nx:0, ny:0, nz:0,
				mu:u, mv:v }
			return r ;			
			
		},{start:0,end:1.0,div:divx*2},{start:0,end:1,div:divy},{ninv:param.ninv}) ;
		return this ;
	case "polyhedron":

		if(!m[param.shape]) return null ;
		let vt = m[param.shape].v ;
		let si = m[param.shape].s ;
		let vi = 0 ;
		for(let i =0;i<si.length;i++) {
			let nx=0,ny=0,nz=0 ;
			let vs = [] ;
			for(let h = si[i].length-1 ;h>=0;h--) {
				let v = vt[si[i][h]] ;
				p.push([v[0],v[2],v[1]]) ;
				nx += v[0] ;
				ny += v[2] ;
				nz += v[1] ;
				vs.push(vi) ;
				vi++ ;
			}
			let vl = Math.hypot(nx,ny,nz) ;
			for(let h = 0 ;h <si[i].length;h++) n.push([nx/vl,ny/vl,nz/vl]) ;
			s.push(vs) ;
		}
		t = null ;
		break ;
	case "icosa":
		vt = m["r05"].v ;
		si = m["r05"].s ;
		for(let i=0;i<vt.length;i++) {
			let vv = [vt[i][0],vt[i][2],vt[i][1]]
			p.push(vv)
			n.push(vv)
			_uv(vv)
		}
		for(let i=0;i<si.length;i++) {
			if(ninv<0) s.push([si[i][0],si[i][1],si[i][2]])
			else  s.push([si[i][0],si[i][2],si[i][1]])
		}
		const id = (param.div!==undefined)?param.div:2
		for(let i=0;i<id;i++) tridiv(p,s) 
		for(let i=0;i<p.length;i++) {
			p[i][0] *= wx ;
			p[i][1] *= wy ;
			p[i][2] *= wz ;
		}
		break 
	}
	function _uv(p) {
		let u = Math.atan2(p[2],p[0])/Math.PI/2
//		if(u<0) u = 1-u
		t.push([(1-u)%1,1-Math.acos(p[1])/Math.PI])
	}
	function tridiv(v,s) {
		let vi = v.length ;
		let si = s.length ;
		let vf ={} 
		let ret 
		function _vff(i1,i2,ni) {
			let k = (i1<i2)?`${i1}-${i2}`:`${i2}-${i1}`
			if(vf[k]==undefined) {
				vf[k] = ni
				ret = ni  
			} else ret = vf[k]
			return ret 
		}
		for(let i=0;i<si;i++) {
			let i1 = s[i][0],i2 = s[i][1],i3 = s[i][2]
			let v1 = v[i1], v2 = v[i2], v3 = v[i3]

			let v12 = CanvasMatrix4.V3norm(CanvasMatrix4.V3add(v1,v2)) ;
			let v23 = CanvasMatrix4.V3norm(CanvasMatrix4.V3add(v2,v3)) ;
			let v31 = CanvasMatrix4.V3norm(CanvasMatrix4.V3add(v3,v1)) ;
			v.push(v12);	v.push(v23);v.push(v31)
			n.push(v12);	n.push(v23);n.push(v31)
			_uv(v12);_uv(v23);_uv(v31)
			
			s[i]=[i1,vi,vi+2] ;
			s.push([vi,vi+1,vi+2]) ;
			s.push([i2,vi+1,vi]) ;
			s.push([i3,vi+2,vi+1]) ;
			vi += 3
		}
	}
	this.obj_v = p 
	this.obj_n = n
	this.obj_t = t
	this.obj_i = s
//	console.log(p)
//	console.log(n)
//	console.log(t)
//	console.log(s)
	return this ;
}
// generate parametric model by function
 parametricModel(func,pu,pv,opt) {
	let pos = [] ;
	let norm = [] ;
	let uv = [] ;
	let indices = [] ;
	let ninv = (opt && opt.ninv)?-1:1 ;

	let du = (pu.end - pu.start)/pu.div ;
	let dv = (pv.end - pv.start)/pv.div ;
	for(let iu =0; iu <= pu.div ;iu++ ) {
		for(let iv = 0 ;iv<= pv.div; iv++ ) {
			let u = pu.start+du*iu ;
			let v = pv.start+dv*iv ;
			let p = func(u,v) ;
			pos.push( [p.px,p.py,p.pz] ) ;
			if(p.mu!=undefined) uv.push([p.mu,p.mv]) ;
			// calc normal
			if(p.nx==0&&p.ny==0&&p.nz==0) {
				let dud = du/10 ; let dvd = dv/10 ;
				let du0 = func(u-dud,v) ; let du1 = func(u+dud,v) ;
				let nux = (du1.px - du0.px)/(dud*2) ;
				let nuy = (du1.py - du0.py)/(dud*2) ;
				let nuz = (du1.pz - du0.pz)/(dud*2) ;
				let dv0 = func(u,v-dvd) ; let dv1 = func(u,v+dvd) ;
				let nvx = (dv1.px - dv0.px)/(dvd*2) ;
				let nvy = (dv1.py - dv0.py)/(dvd*2) ;
				let nvz = (dv1.pz - dv0.pz)/(dvd*2) ;
				let nx = nuy*nvz - nuz*nvy ;
				let ny = nuz*nvx - nux*nvz ;
				let nz = nux*nvy - nuy*nvx ;
				let nl = Math.hypot(nx,ny,nz); 
				p.nx = nx/nl ;
				p.ny = ny/nl ;
				p.nz = nz/nl ;
			}
			norm.push([p.nx*ninv, p.ny*ninv,p.nz*ninv] ) ;
		}
	}
	let d2 = pv.div+1 ;
	for(let j = 0 ; j < pu.div ; ++j) {
		let base = j * d2;
		for(let i = 0 ; i < pv.div ; ++i) {
			if(ninv>0) indices.push([base+i,base+i+d2,base+i+d2+1,base+i+1])	
			else  indices.push([base+i+1,base+i+d2+1,base+i+d2,base+i])	
		}	

	}
	this.obj_v = pos
	this.obj_n = norm
	if(uv.length>0) this.obj_t = uv
	this.obj_i = indices 
	return this ;
}

//convert vtx data to vbo array
objModel(addvec,mode) {
	let v = this.obj_v ;
	let s = this.obj_i ;
	let n = this.obj_n ;
	let t = this.obj_t ;
	let c = this.obj_c ;

	let vbuf = [] ;
	let ibuf = [] ;
	let sf = [] ;
	let sn = [] ;
	let ii = 0 ;
	if(!n) this.obj_n = [] ;

	for(let i=0,l=s.length;i<l;i++) {
		let p = s[i] ;
		if(!n) {
			//面法線算出
			let pa = [] ;
			for(let j=0;j<3;j++) {
				pa[j] = v[p[j]] ;
			}
			let yx = pa[1][0]-pa[0][0];
			let yy = pa[1][1]-pa[0][1];
			let yz = pa[1][2]-pa[0][2];
			let zx = pa[2][0]-pa[0][0];
			let zy = pa[2][1]-pa[0][1];
			let zz = pa[2][2]-pa[0][2];				
			let xx =  yy * zz - yz * zy;
			let xy = -yx * zz + yz * zx;
			let xz =  yx * zy - yy * zx;
			let vn = Math.hypot(xx,xy,xz) ;
			xx /= vn ; xy /= vn ; xz /= vn ;
			sf.push( [xx,xy,xz]) ;
			//面リスト
			for(let j=0,lj=p.length;j<lj;j++) {
				if(!sn[p[j]]) sn[p[j]] = [] ;
				sn[p[j]].push(i) ;
			}
		}
		//3角分割
		for(let j=1,lj=p.length-1;j<lj;j++) {
			ibuf.push(p[0]) ;
			ibuf.push(p[j]) ;
			ibuf.push(p[j+1] ) ;
		}
		ii += p.length ;
	}
//	console.log(" vert:"+v.length);
//	console.log(" poly:"+ibuf.length/3);
	for(let i=0,l=v.length;i<l;i++) {
		vbuf.push( parseFloat( v[i][0]) ) ;
		vbuf.push( parseFloat( v[i][1]) ) ;
		vbuf.push( parseFloat( v[i][2]) ) ;
		let nx=0,ny=0,nz=0 ;		
		if(n) {
			nx = n[i][0] ;
			ny = n[i][1] ;
			nz = n[i][2] ;
		} else {
			//面法線の合成
			if(!sn[i]) {
				nx =0,ny=0,nz=0
			} else {
			for(let j=0;j<sn[i].length;j++) {
				let ii = sn[i][j] ;
				nx += sf[ii][0] ;
				ny += sf[ii][1] ;
				nz += sf[ii][2] ;
			}
			}
		}
		let vn = Math.hypot(nx,ny,nz) ;
		if(vn==0) {
		vbuf.push(0) ;
		vbuf.push(0) ;
		vbuf.push(0) ;			
		} else {
		vbuf.push(nx/vn) ;
		vbuf.push(ny/vn) ;
		vbuf.push(nz/vn) ;
		}
		if(!n) {
			this.obj_n.push([nx/vn,ny/vn,nz/vn]); 
		}
		if(t) {
			vbuf.push(parseFloat( t[i][0]) ) ;
			vbuf.push(parseFloat( t[i][1]))  ;
		}
		if(c) {
			vbuf.push(parseFloat( c[i][0])) ;
			vbuf.push(parseFloat( c[i][1])) ;
			vbuf.push(parseFloat( c[i][2])) ;
		}
		if(addvec) {
			for(av=0;av<addvec.length;av++) {
				vbuf = vbuf.concat(addvec[av].data[i]) ;
			}
		}
	}

//	console.log(vbuf) ;
//	console.log(ibuf) ;
	this.ibuf = ibuf ;
	this.vbuf = vbuf ;
	let ret = {mode:"tri",vtx_at:["position","norm"],vtx:vbuf,idx:ibuf} ;
	if(t) ret.vtx_at.push("uv") ;
	if(c) ret.vtx_at.push("color") ;
	if(addvec) {
		for(av=0;av<addvec.length;av++) ret.vtx_at.push(addvec[av].attr) ;
	}
	return ret ;
}

// generate normal vector lines
 normLines(vm) {
	let nv = [] ;
	let v = this.obj_v
	let n = this.obj_n ;
	if(vm==undefined) vm = 0.1
	for(let i=0,l=v.length;i<l;i++) {
		nv.push(v[i][0]) ;
		nv.push(v[i][1]) ;
		nv.push(v[i][2]) ;
		nv.push(v[i][0]+n[i][0]*vm) ;
		nv.push(v[i][1]+n[i][1]*vm) ;
		nv.push(v[i][2]+n[i][2]*vm) ;
	}
	return  {mode:"lines",vtx_at:["position"],vtx:nv} ;
}
// generate wireframe lines
 wireframe() {
	let nv = [] ;
	let v = this.obj_v ;
	let s = this.obj_i ;
	for(let k=0,l=s.length;k<l;k++) {
		let ss = s[k]; 
		let i
		for(i=1;i<ss.length;i++) {
			nv.push(v[ss[i-1]][0]) ;
			nv.push(v[ss[i-1]][1]) ;
			nv.push(v[ss[i-1]][2]) ;
			nv.push(v[ss[i]][0]) ;
			nv.push(v[ss[i]][1]) ;
			nv.push(v[ss[i]][2]) ;
		}
		nv.push(v[ss[i-1]][0]) ;
		nv.push(v[ss[i-1]][1]) ;
		nv.push(v[ss[i-1]][2]) ;		
		nv.push(v[ss[0]][0]) ;
		nv.push(v[ss[0]][1]) ;
		nv.push(v[ss[0]][2]) ;	
	}
	return  {mode:"lines",vtx_at:["position"],vtx:nv} ;	
}

// mult 4x4 matrix to model
 multMatrix4(m4) {
	let inv = new CanvasMatrix4(m4).invert().transpose() ;
	let buf = m4.getAsArray()
	for(let i=0;i<this.obj_v.length;i++) {
		let v = this.obj_v[i] ;
		let vx = buf[0] * v[0] + buf[4] * v[1] + buf[8] * v[2] + buf[12] ;
		let vy = buf[1] * v[0] + buf[5] * v[1] + buf[9] * v[2] + buf[13] ;
		let vz = buf[2] * v[0] + buf[6] * v[1] + buf[10] * v[2] + buf[14] ;
		this.obj_v[i] = [vx,vy,vz] ;
	}
	if(!this.obj_n) return 
	buf = inv.getAsArray() 
	for(let i=0;i<this.obj_n.length;i++) {
		let v = this.obj_n[i] ;
		let vx = buf[0] * v[0] + buf[4] * v[1] + buf[8] * v[2] + buf[12] ;
		let vy = buf[1] * v[0] + buf[5] * v[1] + buf[9] * v[2] + buf[13] ;
		let vz = buf[2] * v[0] + buf[6] * v[1] + buf[10] * v[2] + buf[14] ;
		this.obj_n[i] = [vx,vy,vz] ;
	}
}
// merge model
 mergeModels(models) {
	let m = this ;
	let ofs = 0 ;
	for(let i=0;i<models.length;i++) {
		m.obj_v = m.obj_v.concat(models[i].obj_v) 
		m.obj_n = m.obj_n.concat(models[i].obj_n) 
		m.obj_t = m.obj_t.concat(models[i].obj_t)
		for(let j=0;j<models[i].obj_i.length;j++) {
			let p = models[i].obj_i[j] ;
			let pp = [] ;
			for( n=0;n<p.length;n++) {
				pp.push( p[n]+ofs ) ;
			}
			m.obj_i.push(pp) ;
		}
		ofs += models[i].obj_v.length ;
	}
	return m ;
}
// calc bounding box 
boundbox() {
	let sx = Number.MAX_VALUE
	let sy = sx 
	let sz = sx 
	let ex = Number.MIN_VALUE 
	let ey = ex 
	let ez = ex 
	
	for(let i=0;i<this.obj_v.length;i++) {
		let v = this.obj_v[i] ;	
		if( v[0] < sx ) sx = v[0]
		if( v[1] < sy ) sy = v[1] 
		if( v[2] < sz ) sz = v[2] 
		if( v[0] > ex ) ex = v[0] 
		if( v[1] > ey ) ey = v[1] 
		if( v[2] > ez ) ez = v[2] 
	}
	return [[sx,sy,sz],[ex,ey,ez]]
}

// load external file 
loadAjax(src) {
	return new Promise(function(resolve,reject) {
		let req = new XMLHttpRequest();
		req.open("get",src,true) ;
		req.responseType = "text" ;
		req.onload = function() {
			if(this.status==200) {
				resolve(this.response) ;
			} else {
				reject("Ajax error:"+this.statusText) ;					
			}
		}
		req.onerror = function() {
			reject("Ajax error:"+this.statusText)
		}
		req.send() ;
	})
}
static loadLines(path,cb,lbufsize) {

	if(!lbufsize) lbufsize = 10000
	const decoder = new TextDecoder
	return new Promise((resolve,reject)=>{
		if(Array.isArray(path)) {
			for(let i=0;i<path.length;i++) {
				cb(path[i])
			}
			resolve(path)
			return 
		}
		if(path.constructor == File ){	// load File
			const reader = new FileReader()
			reader.onload = (e)=> {
				const l = e.target.result.split("\n")
				for(let i=0;i<l.length;i++) {
					cb(l[i])
				}
				resolve(path)
			}
			reader.readAsText(path)
			return 
		}
		fetch( path , {
			method:"GET"
		}).then( async resp=>{
			if(resp.ok) {
				const reader = resp.body.getReader();
				const buf = new Uint8Array(lbufsize)
				let bi = 0 
				while (true) {
					const {done, value} = await reader.read();
					if (done) {
					  cb(decoder.decode(buf.slice(0,bi))) 
					  resolve(resp)
					  break;
					}
//					console.log(value.length)
					for (const char of value) {
						buf[bi++] = char 
						if(char == 0x0a ) {
							cb(decoder.decode(buf.slice(0,bi-1))) 
							bi = 0 
						}
					}
				}
			} else {
				reject(resp)
			}
		})
	})
}
// load .obj file
async loadObj(path,scale) {
	if(!scale) scale=1.0 ;
	return new Promise((resolve,reject)=> {
		this.loadAjax(path).then((data)=> {
//			console.log(data) ;
			let l = data.split("\n") ;
			let v = [];
			let n = [] ;
			let x = [] ;
			let t = [] ;
			let c = [] ;
			let xi = {} ;
			let xic = 0 ;

			for(let i = 0,len=l.length;i<len;i++) {
				if(l[i].match(/^#/)) continue ;
				if(l[i].match(/^eof/)) break ;
				let ll = l[i].split(/\s+/) ;
				if(ll[0] == "v") {
					v.push([ll[1]*scale,ll[2]*scale,ll[3]*scale]) ;
					if(ll.length==7) c.push([ll[4],ll[5],ll[6]])
				}
				if(ll[0] == "vt") {
					t.push([ll[1],ll[2]]) ;
				}
				if(ll[0] == "vn") {
					n.push([ll[1],ll[2],ll[3]]) ;
				}
				if(ll[0] == "f") {
					let ix = [] ;
					for(let ii=1;ii<ll.length;ii++) {
						if(ll[ii]=="") continue ;
						if(!(ll[ii] in xi)) xi[ll[ii]] = xic++ ; 
						ix.push(xi[ll[ii]]) ;
					}
					x.push(ix) ;
				}
			}
			this.obj_v = [] ;
			if(c.length>0) this.obj_c = [] 
			this.obj_i =x ;
			if(n.length>0) this.obj_n = [] ;
			if(t.length>0) this.obj_t = [] ;
			if(x.length>0) {
				for(let i in xi) {
					let si = i.split("/") ;
					let ind = xi[i] ;
					this.obj_v[ind] = v[si[0]-1] ;
					if(c.length>0) this.obj_c[ind] = c[si[0]-1]  
					if(t.length>0) this.obj_t[ind] = t[si[1]-1] ;
					if(n.length>0) this.obj_n[ind] = n[si[2]-1] ;
				}
			} else {
				this.obj_v = v 
				if(c.length>0) this.obj_c = c
				if(n.length>0) this.obj_n = n
			}
			console.log("loadobj "+path+" vtx:"+v.length+" norm:"+n.length+" tex:"+t.length+" idx:"+x.length+" vbuf:"+this.obj_v.length) ;
			resolve(this) ;
		}).catch(function(err) {
			reject(err) ;
		})
	}) ;
}
static async loadObj2(path,opt) {

	let scale = 1.0
	let zup = false  
	let nogroup = false 
	let nomtl = false 
	if(opt) {
		if(opt.scale) scale=opt.scale
		if(opt.zup) zup = opt.zup
		if(opt.nogroup) nogroup = opt.nogroup
		if(opt.nomtl) nomtl = opt.nomtl
	}
	return new Promise((resolve,reject)=> {
		const v = [];
		const n = [] ;
		const xl = {} ;
		const t = [] ;
		const c = [] ;
		const xi = {} ;
		const rxi = []
		let xic = 0 ;
		let usemtl = "" 
		let group = "" 
		const pmtls = []
		const mtlspath = [] 
		WWModel.loadLines(path,async l=>{
				if(l.match(/^#/)) return ;
				if(l.match(/^eof/)) return ;
				const ll = l.split(/\s+/) ;
				const cmd = ll[0]
				if(cmd == "v") {
					if(zup) v.push([ll[1]*scale,ll[3]*scale,-ll[2]*scale]) ;
					else v.push([ll[1]*scale,ll[2]*scale,ll[3]*scale]) ;
					if(ll.length==7) c.push([ll[4],ll[5],ll[6]])
				}
				if(cmd == "vt") {
					t.push([ll[1],ll[2]]) ;
				}
				if(cmd == "vn") {
					if(zup) n.push([ll[1],ll[3],-ll[2]]) ;
					else  n.push([ll[1],ll[2],ll[3]]) ;
				}
				if(cmd == "f") {
					let ix = [] ;
					for(let ii=1;ii<ll.length;ii++) {
						if(ll[ii]=="") continue ;
						if(!(ll[ii] in xi)) {
							xi[ll[ii]] = xic++ ; 
							rxi[xi[ll[ii]]] = ll[ii]
						}
						ix.push(xi[ll[ii]]) ;
					}
					if(!xl[group]) xl[group] = {} 
					if(!xl[group][usemtl]) xl[group][usemtl] = []
					xl[group][usemtl].push(ix) ;
				}
				if(cmd == "mtllib") {
					if(path.constructor == File || Array.isArray(path) ){
							mtlspath.push(	ll.splice(1).join(" ").trim())
						 return
					}
					let pp = path.split("/") 
					pp[pp.length-1] = ll[1] 
					pmtls.push( WWModel.loadMtl(pp.join("/")) )
					mtlspath.push(pp)
				}
				if(cmd == "usemtl") {
					if(!nomtl) usemtl = ll[1] 
				}
				if(cmd == "g") {
					if(!nogroup) group = ll[1] 
				}
		}).then(r=>{
			const groups = []
			let objs
//			console.log(xl)
//			console.log(rxi)
			for(let g in xl) {
				objs = [] 
				for( let m in xl[g]) {
					let x = xl[g][m]
					const obj = new WWModel() 
					obj.obj_v = [] ;
					if(c.length>0) obj.obj_c = [] 
					if(n.length>0) obj.obj_n = [] ;
					if(t.length>0) obj.obj_t = [] ;
					obj.obj_i =x ;
					if(x.length>0) {
						for(let i in xi) {
							let si = i.split("/") ;
							let ind = xi[i] ;
							obj.obj_v[ind] = v[si[0]-1] ;
							if(c.length>0) obj.obj_c[ind] = c[si[0]-1]  
							if(t.length>0) obj.obj_t[ind] = t[si[1]-1] ;
							if(n.length>0) obj.obj_n[ind] = n[si[2]-1] ;
						}
					} else {
						obj.obj_v = v 
						if(c.length>0) obj.obj_c = c
						if(n.length>0) obj.obj_n = n
					}
					objs.push({obj:obj,mtlname:m})
					if(typeof path !="string") path=""
					console.log("loadobj "+path+" vtx:"+v.length+" norm:"+n.length+" tex:"+t.length+" idx:"+x.length+" vbuf:"+obj.obj_v.length) ;
				}
				groups.push({objs:objs,group:g})
			}
			if(pmtls.length>0) {
				Promise.all(pmtls).then(mtls=> {
					let allmtls = {} 
					for(let i in mtls) {
						allmtls = Object.assign(allmtls,mtls[i]) 
					}
					resolve((nogroup)?{objs:objs,mtls:allmtls}:{groups:groups,mtls:allmtls})
				})
			} else resolve((nogroup)?{objs:objs,mtlpaths:mtlspath}:{groups:groups,mtlpaths:mtlspath})
						
		}).catch(err=> {
			reject(err) ;
		})
	}) ;
}
static async loadMtl(path) {
	const mtls = []
	let mtlname = "" 
	return new Promise((resolve,reject)=> {
		WWModel.loadLines(path,l=>{
			if(l.match(/^#/)) return 
			if(l.match(/^eof/)) return 
			let ll = l.split(/\s+/) 
			let cmd = ll.shift()
			if(cmd=="") cmd = ll.shift() 
			if(cmd=="newmtl") {
				mtlname = ll[0] 
				mtls[mtlname] = {}
				return  
			}
			switch(cmd) {
				case "Kd":	//diffuse
				case "Ks":	//specular
				case "Ka":	//ambient
				case "Tf":	// transmission filter
					mtls[mtlname][cmd] = [parseFloat(ll[0]),parseFloat(ll[1]),parseFloat(ll[2])]
					break ;
				case "Ni":	//reflaction
				case "d":	//diffuse
				case "Ns":	//spec Shininess
				case "Tr":	//transparent
					mtls[mtlname][cmd] = parseFloat(ll[0])
					break ;
				case "illum":
					mtls[mtlname][cmd] = parseInt(ll[0])
					break ;
				case "map_Kd":
				case "map_Ka":
				case "map_Ks":
					mtls[mtlname][cmd] = ll.join(" ").trim()
					break;
			}
		}).then(r=>{
//			console.log(mtls)
			resolve(mtls) 
		}).catch(err=> {
			reject(err) ;
		})			
	})
}


// other utils 
static  HSV2RGB( H, S, V ,a) {
	let ih;
	let fl;
	let m, n;
	let rr,gg,bb ;
	H = H * 6 ;
	ih = Math.floor( H );
	fl = H - ih;
	if( !(ih & 1)) fl = 1 - fl;
	m = V * ( 1 - S );
	n = V * ( 1 - S * fl );
	switch( ih ){
		case 0:
		case 6:
			rr = V; gg = n; bb = m; break;
		case 1: rr = n; gg = V; bb = m; break;
		case 2: rr = m; gg = V; bb = n; break;
		case 3: rr = m; gg = n; bb = V; break;
		case 4: rr = n; gg = m; bb = V; break;
		case 5: rr = V; gg = m; bb = n; break;
	}
	return [rr,gg,bb,(a===undefined)?1.0:a] ;
}
static  snormal(pa) {
	let yx = pa[1][0]-pa[0][0];
	let yy = pa[1][1]-pa[0][1];
	let yz = pa[1][2]-pa[0][2];
	let zx = pa[2][0]-pa[0][0];
	let zy = pa[2][1]-pa[0][1];
	let zz = pa[2][2]-pa[0][2];				
	let xx =  yy * zz - yz * zy;
	let xy = -yx * zz + yz * zx;
	let xz =  yx * zy - yy * zx;
	let vn = Math.hypot(xx,xy,xz) ;
	xx /= vn ; xy /= vn ; xz /= vn ;
	return [xx,xy,xz] ;
}

} //class WWModel
/*
 * Copyright (C) 2009 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */
/* modified by wakufactory */
/*
    CanvasMatrix4 class
    
    This class implements a 4x4 matrix. It has functions which
    duplicate the functionality of the OpenGL matrix stack and
    glut functions.
    
    IDL:
    
    [
        Constructor(in CanvasMatrix4 matrix),           // copy passed matrix into new CanvasMatrix4
        Constructor(in sequence<float> array)           // create new CanvasMatrix4 with 16 floats (row major)
        Constructor()                                   // create new CanvasMatrix4 with identity matrix
    ]
    interface CanvasMatrix4 {
        attribute float buf[16]

        void load(in CanvasMatrix4 matrix);                 // copy the values from the passed matrix
        void load(in sequence<float> array);                // copy 16 floats into the matrix
        sequence<float> getAsArray();                       // return the matrix as an array of 16 floats
        WebGLFloatArray getAsWebGLFloatArray();           // return the matrix as a WebGLFloatArray with 16 values
        void makeIdentity();                                // replace the matrix with identity
        void transpose();                                   // replace the matrix with its transpose
        void invert();                                      // replace the matrix with its inverse
        
        void translate(in float x, in float y, in float z); // multiply the matrix by passed translation values on the right
        void scale(in float x, in float y, in float z);     // multiply the matrix by passed scale values on the right
        void rotate(in float angle,                         // multiply the matrix by passed rotation values on the right
                    in float x, in float y, in float z);    // (angle is in degrees)
        void multRight(in CanvasMatrix matrix);             // multiply the matrix by the passed matrix on the right
        void multLeft(in CanvasMatrix matrix);              // multiply the matrix by the passed matrix on the left
        void ortho(in float left, in float right,           // multiply the matrix by the passed ortho values on the right
                   in float bottom, in float top, 
                   in float near, in float far);
        void frustum(in float left, in float right,         // multiply the matrix by the passed frustum values on the right
                     in float bottom, in float top, 
                     in float near, in float far);
        void perspective(in float fovy, in float aspect,    // multiply the matrix by the passed perspective values on the right
                         in float zNear, in float zFar);
        void lookat(in float eyex, in float eyey, in float eyez,    // multiply the matrix by the passed lookat 
                    in float ctrx, in float ctry, in float ctrz,    // values on the right
                    in float upx, in float upy, in float upz);
    }
*/

CanvasMatrix4 = function(m) {
	if(m!=undefined && m.name == "Float32Array") {
		this.buf = m ;
		return this ;
	}
	this.buf = new Float32Array(16)
	this.matrix = null
    if (typeof m == 'object') {
        if ("length" in m && m.length >= 16) {
            this.load(m);
            return this;
        }
        else if (m instanceof CanvasMatrix4) {
            this.load(m);
            return this;
        }
    }
    this.makeIdentity();
    return this ;
}
CanvasMatrix4.RAD = Math.PI / 180 
CanvasMatrix4.prototype.load = function()
{
    if (arguments.length == 1 && typeof arguments[0] == 'object') {
        var matrix = arguments[0];
        
        if ("length" in matrix && matrix.length == 16) {
            this.buf[0] = matrix[0];
            this.buf[1] = matrix[1];
            this.buf[2] = matrix[2];
            this.buf[3] = matrix[3];

            this.buf[4] = matrix[4];
            this.buf[5] = matrix[5];
            this.buf[6] = matrix[6];
            this.buf[7] = matrix[7];

            this.buf[8] = matrix[8];
            this.buf[9] = matrix[9];
            this.buf[10] = matrix[10];
            this.buf[11] = matrix[11];

            this.buf[12] = matrix[12];
            this.buf[13] = matrix[13];
            this.buf[14] = matrix[14];
            this.buf[15] = matrix[15];
            return this ;
        }
            
        if (arguments[0] instanceof CanvasMatrix4) {
        
            this.buf[0] = matrix.buf[0];
            this.buf[1] = matrix.buf[1];
            this.buf[2] = matrix.buf[2];
            this.buf[3] = matrix.buf[3];

            this.buf[4] = matrix.buf[4];
            this.buf[5] = matrix.buf[5];
            this.buf[6] = matrix.buf[6];
            this.buf[7] = matrix.buf[7];

            this.buf[8] = matrix.buf[8];
            this.buf[9] = matrix.buf[9];
            this.buf[10] = matrix.buf[10];
            this.buf[11] = matrix.buf[11];

            this.buf[12] = matrix.buf[12];
            this.buf[13] = matrix.buf[13];
            this.buf[14] = matrix.buf[14];
            this.buf[15] = matrix.buf[15];
            return this ;
        }
    }
    
    this.makeIdentity();
    return this ;
}

CanvasMatrix4.prototype.getAsArray = function()
{
    return [
        this.buf[0], this.buf[1], this.buf[2], this.buf[3], 
        this.buf[4], this.buf[5], this.buf[6], this.buf[7], 
        this.buf[8], this.buf[9], this.buf[10], this.buf[11], 
        this.buf[12], this.buf[13], this.buf[14], this.buf[15]
    ];
}

CanvasMatrix4.prototype.getAsWebGLFloatArray = function()
{
    return this.buf
}
CanvasMatrix4.prototype.initmatrix = function() {
	if(!this.matrix) this.matrix = new CanvasMatrix4 
	this.matrix.makeIdentity() 
    return this ;
}
CanvasMatrix4.prototype.makeIdentity = function()
{
    this.buf[0] = 1;
    this.buf[1] = 0;
    this.buf[2] = 0;
    this.buf[3] = 0;
    
    this.buf[4] = 0;
    this.buf[5] = 1;
    this.buf[6] = 0;
    this.buf[7] = 0;
    
    this.buf[8] = 0;
    this.buf[9] = 0;
    this.buf[10] = 1;
    this.buf[11] = 0;
    
    this.buf[12] = 0;
    this.buf[13] = 0;
    this.buf[14] = 0;
    this.buf[15] = 1;
    return this ;
}

CanvasMatrix4.prototype.transpose = function()
{
    var tmp = this.buf[1];
    this.buf[1] = this.buf[4];
    this.buf[4] = tmp;
    
    tmp = this.buf[2];
    this.buf[2] = this.buf[8];
    this.buf[8] = tmp;
    
    tmp = this.buf[3];
    this.buf[3] = this.buf[12];
    this.buf[12] = tmp;
    
    tmp = this.buf[6];
    this.buf[6] = this.buf[9];
    this.buf[9] = tmp;
    
    tmp = this.buf[7];
    this.buf[7] = this.buf[13];
    this.buf[13] = tmp;
    
    tmp = this.buf[11];
    this.buf[11] = this.buf[14];
    this.buf[14] = tmp;
    return this ;
}

CanvasMatrix4.prototype.invert = function()
{
    // Calculate the 4x4 determinant
    // If the determinant is zero, 
    // then the inverse matrix is not unique.
    var det = this._determinant4x4();

    if (Math.abs(det) < 1e-32)
        return null;

    this._makeAdjoint();

    // Scale the adjoint matrix to get the inverse
    this.buf[0] /= det;
    this.buf[1] /= det;
    this.buf[2] /= det;
    this.buf[3] /= det;
    
    this.buf[4] /= det;
    this.buf[5] /= det;
    this.buf[6] /= det;
    this.buf[7] /= det;
    
    this.buf[8] /= det;
    this.buf[9] /= det;
    this.buf[10] /= det;
    this.buf[11] /= det;
    
    this.buf[12] /= det;
    this.buf[13] /= det;
    this.buf[14] /= det;
    this.buf[15] /= det;
    return this ;
}

CanvasMatrix4.prototype.translate = function(x,y,z)
{
	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
    if (x == undefined)
        x = 0;
        if (y == undefined)
            y = 0;
    if (z == undefined)
        z = 0;
    
//    this.initmatrix()
//    this.matrix.buf[12] = x;
//    this.matrix.buf[13] = y;
//    this.matrix.buf[14] = z;
//    this.multRight(this.matrix);
    this.buf[12] += x;
    this.buf[13] += y;
    this.buf[14] += z;
    return this ;
}

CanvasMatrix4.prototype.scale = function(x,y,z)
{
	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
    if (x == undefined)
        x = 1;
    if (z == undefined) {
        if (y == undefined) {
            y = x;
            z = x;
        }
        else
            z = 1;
    }
    else if (y == undefined)
        y = x;
    
//    this.initmatrix()
//    this.matrix.buf[0] = x;
//    this.matrix.buf[5] = y;
//    this.matrix.buf[10] = z;
//    this.multRight(this.matrix);
    
    this.buf[0] *= x ; this.buf[1] *= x ; this.buf[2] *= x ;
    this.buf[4] *= y ; this.buf[5] *= y ; this.buf[6] *= y ;
    this.buf[8] *= z ; this.buf[9] *= z ; this.buf[10] *= z ;
    return this ;
}

CanvasMatrix4.prototype.rotate = function(angle,x,y,z)
{
    if(angle==0) return this 
 	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
    // angles are in degrees. Switch to radians
    angle = angle * CanvasMatrix4.RAD ;
    
    angle /= 2;
    var sinA = Math.sin(angle);
    var cosA = Math.cos(angle);
    var sinA2 = sinA * sinA;
 
    this.initmatrix()

    // optimize case where axis is along major axis
    if (x == 1 && y == 0 && z == 0) {
        this.matrix.buf[5] = 1 - 2 * sinA2;
        this.matrix.buf[6] = 2 * sinA * cosA;
        this.matrix.buf[9] = -2 * sinA * cosA;
        this.matrix.buf[10] = 1 - 2 * sinA2;
    } else if (x == 0 && y == 1 && z == 0) {
        this.matrix.buf[0] = 1 - 2 * sinA2;
        this.matrix.buf[2] = -2 * sinA * cosA;
        this.matrix.buf[8] = 2 * sinA * cosA;
        this.matrix.buf[10] = 1 - 2 * sinA2;
    } else if (x == 0 && y == 0 && z == 1) {
        this.matrix.buf[0] = 1 - 2 * sinA2;
        this.matrix.buf[1] = 2 * sinA * cosA;
        this.matrix.buf[4] = -2 * sinA * cosA;
        this.matrix.buf[5] = 1 - 2 * sinA2;
    } else {
	    // normalize
	    var length = Math.hypot(x,y,z);
	    if (length == 0) {
	        // bad vector, just use something reasonable
	        x = 0;
	        y = 0;
	        z = 1;
	    } else if (length != 1) {
	        x /= length;
	        y /= length;
	        z /= length;
	    }
        var x2 = x*x;
        var y2 = y*y;
        var z2 = z*z;
    
        this.matrix.buf[0] = 1 - 2 * (y2 + z2) * sinA2;
        this.matrix.buf[1] = 2 * (x * y * sinA2 + z * sinA * cosA);
        this.matrix.buf[2] = 2 * (x * z * sinA2 - y * sinA * cosA);
        this.matrix.buf[4] = 2 * (y * x * sinA2 - z * sinA * cosA);
        this.matrix.buf[5] = 1 - 2 * (z2 + x2) * sinA2;
        this.matrix.buf[6] = 2 * (y * z * sinA2 + x * sinA * cosA);
        this.matrix.buf[8] = 2 * (z * x * sinA2 + y * sinA * cosA);
        this.matrix.buf[9] = 2 * (z * y * sinA2 - x * sinA * cosA);
        this.matrix.buf[10] = 1 - 2 * (x2 + y2) * sinA2;
    }
    this.multRight(this.matrix);
    return this ;
}

CanvasMatrix4.prototype.multRight = function(matrix)
{
    var m11 = (this.buf[0] * matrix.buf[0] + this.buf[1] * matrix.buf[4]
               + this.buf[2] * matrix.buf[8] + this.buf[3] * matrix.buf[12]);
    var m12 = (this.buf[0] * matrix.buf[1] + this.buf[1] * matrix.buf[5]
               + this.buf[2] * matrix.buf[9] + this.buf[3] * matrix.buf[13]);
    var m13 = (this.buf[0] * matrix.buf[2] + this.buf[1] * matrix.buf[6]
               + this.buf[2] * matrix.buf[10] + this.buf[3] * matrix.buf[14]);
    var m14 = (this.buf[0] * matrix.buf[3] + this.buf[1] * matrix.buf[7]
               + this.buf[2] * matrix.buf[11] + this.buf[3] * matrix.buf[15]);

    var m21 = (this.buf[4] * matrix.buf[0] + this.buf[5] * matrix.buf[4]
               + this.buf[6] * matrix.buf[8] + this.buf[7] * matrix.buf[12]);
    var m22 = (this.buf[4] * matrix.buf[1] + this.buf[5] * matrix.buf[5]
               + this.buf[6] * matrix.buf[9] + this.buf[7] * matrix.buf[13]);
    var m23 = (this.buf[4] * matrix.buf[2] + this.buf[5] * matrix.buf[6]
               + this.buf[6] * matrix.buf[10] + this.buf[7] * matrix.buf[14]);
    var m24 = (this.buf[4] * matrix.buf[3] + this.buf[5] * matrix.buf[7]
               + this.buf[6] * matrix.buf[11] + this.buf[7] * matrix.buf[15]);

    var m31 = (this.buf[8] * matrix.buf[0] + this.buf[9] * matrix.buf[4]
               + this.buf[10] * matrix.buf[8] + this.buf[11] * matrix.buf[12]);
    var m32 = (this.buf[8] * matrix.buf[1] + this.buf[9] * matrix.buf[5]
               + this.buf[10] * matrix.buf[9] + this.buf[11] * matrix.buf[13]);
    var m33 = (this.buf[8] * matrix.buf[2] + this.buf[9] * matrix.buf[6]
               + this.buf[10] * matrix.buf[10] + this.buf[11] * matrix.buf[14]);
    var m34 = (this.buf[8] * matrix.buf[3] + this.buf[9] * matrix.buf[7]
               + this.buf[10] * matrix.buf[11] + this.buf[11] * matrix.buf[15]);

    var m41 = (this.buf[12] * matrix.buf[0] + this.buf[13] * matrix.buf[4]
               + this.buf[14] * matrix.buf[8] + this.buf[15] * matrix.buf[12]);
    var m42 = (this.buf[12] * matrix.buf[1] + this.buf[13] * matrix.buf[5]
               + this.buf[14] * matrix.buf[9] + this.buf[15] * matrix.buf[13]);
    var m43 = (this.buf[12] * matrix.buf[2] + this.buf[13] * matrix.buf[6]
               + this.buf[14] * matrix.buf[10] + this.buf[15] * matrix.buf[14]);
    var m44 = (this.buf[12] * matrix.buf[3] + this.buf[13] * matrix.buf[7]
               + this.buf[14] * matrix.buf[11] + this.buf[15] * matrix.buf[15]);
    
    this.buf[0] = m11;
    this.buf[1] = m12;
    this.buf[2] = m13;
    this.buf[3] = m14;
    
    this.buf[4] = m21;
    this.buf[5] = m22;
    this.buf[6] = m23;
    this.buf[7] = m24;
    
    this.buf[8] = m31;
    this.buf[9] = m32;
    this.buf[10] = m33;
    this.buf[11] = m34;
    
    this.buf[12] = m41;
    this.buf[13] = m42;
    this.buf[14] = m43;
    this.buf[15] = m44;
    return this ;
}

CanvasMatrix4.prototype.multLeft = function(matrix)
{
    var m11 = (matrix.buf[0] * this.buf[0] + matrix.buf[1] * this.buf[4]
               + matrix.buf[2] * this.buf[8] + matrix.buf[3] * this.buf[12]);
    var m12 = (matrix.buf[0] * this.buf[1] + matrix.buf[1] * this.buf[5]
               + matrix.buf[2] * this.buf[9] + matrix.buf[3] * this.buf[13]);
    var m13 = (matrix.buf[0] * this.buf[2] + matrix.buf[1] * this.buf[6]
               + matrix.buf[2] * this.buf[10] + matrix.buf[3] * this.buf[14]);
    var m14 = (matrix.buf[0] * this.buf[3] + matrix.buf[1] * this.buf[7]
               + matrix.buf[2] * this.buf[11] + matrix.buf[3] * this.buf[15]);

    var m21 = (matrix.buf[4] * this.buf[0] + matrix.buf[5] * this.buf[4]
               + matrix.buf[6] * this.buf[8] + matrix.buf[7] * this.buf[12]);
    var m22 = (matrix.buf[4] * this.buf[1] + matrix.buf[5] * this.buf[5]
               + matrix.buf[6] * this.buf[9] + matrix.buf[7] * this.buf[13]);
    var m23 = (matrix.buf[4] * this.buf[2] + matrix.buf[5] * this.buf[6]
               + matrix.buf[6] * this.buf[10] + matrix.buf[7] * this.buf[14]);
    var m24 = (matrix.buf[4] * this.buf[3] + matrix.buf[5] * this.buf[7]
               + matrix.buf[6] * this.buf[11] + matrix.buf[7] * this.buf[15]);

    var m31 = (matrix.buf[8] * this.buf[0] + matrix.buf[9] * this.buf[4]
               + matrix.buf[10] * this.buf[8] + matrix.buf[11] * this.buf[12]);
    var m32 = (matrix.buf[8] * this.buf[1] + matrix.buf[9] * this.buf[5]
               + matrix.buf[10] * this.buf[9] + matrix.buf[11] * this.buf[13]);
    var m33 = (matrix.buf[8] * this.buf[2] + matrix.buf[9] * this.buf[6]
               + matrix.buf[10] * this.buf[10] + matrix.buf[11] * this.buf[14]);
    var m34 = (matrix.buf[8] * this.buf[3] + matrix.buf[9] * this.buf[7]
               + matrix.buf[10] * this.buf[11] + matrix.buf[11] * this.buf[15]);

    var m41 = (matrix.buf[12] * this.buf[0] + matrix.buf[13] * this.buf[4]
               + matrix.buf[14] * this.buf[8] + matrix.buf[15] * this.buf[12]);
    var m42 = (matrix.buf[12] * this.buf[1] + matrix.buf[13] * this.buf[5]
               + matrix.buf[14] * this.buf[9] + matrix.buf[15] * this.buf[13]);
    var m43 = (matrix.buf[12] * this.buf[2] + matrix.buf[13] * this.buf[6]
               + matrix.buf[14] * this.buf[10] + matrix.buf[15] * this.buf[14]);
    var m44 = (matrix.buf[12] * this.buf[3] + matrix.buf[13] * this.buf[7]
               + matrix.buf[14] * this.buf[11] + matrix.buf[15] * this.buf[15]);
    
    this.buf[0] = m11;
    this.buf[1] = m12;
    this.buf[2] = m13;
    this.buf[3] = m14;

    this.buf[4] = m21;
    this.buf[5] = m22;
    this.buf[6] = m23;
    this.buf[7] = m24;

    this.buf[8] = m31;
    this.buf[9] = m32;
    this.buf[10] = m33;
    this.buf[11] = m34;

    this.buf[12] = m41;
    this.buf[13] = m42;
    this.buf[14] = m43;
    this.buf[15] = m44;
    return this ;
}

CanvasMatrix4.prototype.ortho = function(left, right, bottom, top, near, far)
{
    var tx = (left + right) / (right - left);
    var ty = (top + bottom) / (top - bottom);
    var tz = (far + near) / (far - near);
    
    this.initmatrix()
    this.matrix.buf[0] = 2 / (right - left);
    this.matrix.buf[5] = 2 / (top - bottom);
    this.matrix.buf[10] = -2 / (far - near);
    this.matrix.buf[12] = tx;
    this.matrix.buf[13] = ty;
    this.matrix.buf[14] = -tz;
    
    this.multRight(this.matrix);
    return this ;
}

CanvasMatrix4.prototype.frustum = function(left, right, bottom, top, near, far)
{
    this.initmatrix()
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(far + near) / (far - near);
    var D = -(2 * far * near) / (far - near);
    
    this.matrix.buf[0] = (2 * near) / (right - left);
    
    this.matrix.buf[5] = 2 * near / (top - bottom);
    
    this.matrix.buf[8] = A;
    this.matrix.buf[9] = B;
    this.matrix.buf[10] = C;
    this.matrix.buf[11] = -1;
    
    this.matrix.buf[14] = D;
    this.matrix.buf[15] = 0;
    
    this.multRight(this.matrix);
    return this ;
}

CanvasMatrix4.prototype.perspective = function(fovy, aspect, zNear, zFar)
{
    var top = Math.tan(fovy * Math.PI / 360) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    this.frustum(left, right, bottom, top, zNear, zFar);
    return this ;
}
CanvasMatrix4.prototype.pallarel = function(width, aspect, zNear, zFar)
{
    var right = width/2;
    var left = -right;
	var top = right / aspect ;
	var bottom = -top ;
    this.ortho(left, right, bottom, top, zNear, zFar);
    return this ;
}
CanvasMatrix4.prototype.lookat = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz)
{
    this.initmatrix()
    
    // Make rotation matrix

    // Z vector
    var zx = eyex - centerx;
    var zy = eyey - centery;
    var zz = eyez - centerz;
    var mag = Math.hypot(zx,zy,zz);
    if (mag) {
        zx /= mag;
        zy /= mag;
        zz /= mag;
    }

    // X vector = Y cross Z
    var xx =  upy * zz - upz * zy;
    var xy = -upx * zz + upz * zx;
    var xz =  upx * zy - upy * zx;

    // Recompute Y = Z cross X
    var yx = zy * xz - zz * xy;
    var yy = -zx * xz + zz * xx;
    var yz = zx * xy - zy * xx;

    // cross product gives area of parallelogram, which is < 1.0 for
    // non-perpendicular unit-length vectors; so normalize x, y here

    mag = Math.hypot(xx,xy,xz);
    if (mag) {
        xx /= mag;
        xy /= mag;
        xz /= mag;
    }

    mag = Math.hypot(yx,yy,yz);
    if (mag) {
        yx /= mag;
        yy /= mag;
        yz /= mag;
    }

    this.matrix.buf[0] = xx;
    this.matrix.buf[1] = yx;
    this.matrix.buf[2] = zx;
    
    this.matrix.buf[4] = xy;
    this.matrix.buf[5] = yy;
    this.matrix.buf[6] = zy;
    
    this.matrix.buf[8] = xz;
    this.matrix.buf[9] = yz;
    this.matrix.buf[10] = zz;
    
    this.matrix.buf[12] = -(xx * eyex + xy * eyey + xz * eyez);
    this.matrix.buf[13] = -(yx * eyex + yy * eyey + yz * eyez);
    this.matrix.buf[14] = -(zx * eyex + zy * eyey + zz * eyez);
 //   matrix.translate(-eyex, -eyey, -eyez);
    
    this.multRight(this.matrix);
    return this ;
}

// Support functions
CanvasMatrix4.prototype._determinant2x2 = function(a, b, c, d)
{
    return a * d - b * c;
}

CanvasMatrix4.prototype._determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3)
{
    return a1 * this._determinant2x2(b2, b3, c2, c3)
         - b1 * this._determinant2x2(a2, a3, c2, c3)
         + c1 * this._determinant2x2(a2, a3, b2, b3);
}

CanvasMatrix4.prototype._determinant4x4 = function()
{
    var a1 = this.buf[0];
    var b1 = this.buf[1]; 
    var c1 = this.buf[2];
    var d1 = this.buf[3];

    var a2 = this.buf[4];
    var b2 = this.buf[5]; 
    var c2 = this.buf[6];
    var d2 = this.buf[7];

    var a3 = this.buf[8];
    var b3 = this.buf[9]; 
    var c3 = this.buf[10];
    var d3 = this.buf[11];

    var a4 = this.buf[12];
    var b4 = this.buf[13]; 
    var c4 = this.buf[14];
    var d4 = this.buf[15];

    return a1 * this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
         - b1 * this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
         + c1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
         - d1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
}

CanvasMatrix4.prototype._makeAdjoint = function()
{
    var a1 = this.buf[0];
    var b1 = this.buf[1]; 
    var c1 = this.buf[2];
    var d1 = this.buf[3];

    var a2 = this.buf[4];
    var b2 = this.buf[5]; 
    var c2 = this.buf[6];
    var d2 = this.buf[7];

    var a3 = this.buf[8];
    var b3 = this.buf[9]; 
    var c3 = this.buf[10];
    var d3 = this.buf[11];

    var a4 = this.buf[12];
    var b4 = this.buf[13]; 
    var c4 = this.buf[14];
    var d4 = this.buf[15];

    // Row column labeling reversed since we transpose rows & columns
    this.buf[0]  =   this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
    this.buf[4]  = - this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
    this.buf[8]  =   this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
    this.buf[12]  = - this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
        
    this.buf[1]  = - this._determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
    this.buf[5]  =   this._determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
    this.buf[9]  = - this._determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
    this.buf[13]  =   this._determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);
        
    this.buf[2]  =   this._determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
    this.buf[6]  = - this._determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
    this.buf[10]  =   this._determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
    this.buf[14]  = - this._determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);
        
    this.buf[3]  = - this._determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
    this.buf[7]  =   this._determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
    this.buf[11]  = - this._determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
    this.buf[15]  =   this._determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
}

////utils 
//vec3 operations
	CanvasMatrix4.V3add = function() {
		let x=0,y=0,z=0 ;
		for(let i=0;i<arguments.length;i++) {
			x += arguments[i][0] ;y += arguments[i][1] ;z += arguments[i][2] ;
		}
		return [x,y,z] ;
	}
	CanvasMatrix4.V3sub = function() {
		let x=arguments[0][0],y=arguments[0][1],z=arguments[0][2] ;
		for(let i=1;i<arguments.length;i++) {
			x -= arguments[i][0] ;y -= arguments[i][1] ;z -= arguments[i][2] ;
		}
		return [x,y,z] ;
	}
	CanvasMatrix4.V3inv = function(v) {
		return [-v[0],-v[1],-v[2]] ;
	}
	CanvasMatrix4.V3len = function(v) {
		return Math.hypot(v[0],v[1],v[2]) ;
	}
	CanvasMatrix4.V3norm = function(v,s) {
		const l = CanvasMatrix4.V3len(v) ;
		if(s===undefined) s = 1 ;
		return (l==0)?[0,0,0]:[v[0]*s/l,v[1]*s/l,v[2]*s/l] ;
	}
	CanvasMatrix4.V3mult = function(v,s) {
		return [v[0]*s,v[1]*s,v[2]*s] ;
	}
	CanvasMatrix4.V3dot = function(v1,v2) {
		return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2] ;
	}
	CanvasMatrix4.V3cross = function(v1,v2) {
		return [	
			v1[1]*v2[2] - v1[2] * v2[1],
			v1[2]*v2[0] - v1[0] * v2[2],
			v1[0]*v2[1] - v1[1] * v2[0] 
		]
	}

//multiple vector
CanvasMatrix4.prototype.multVec4 = function(x,y,z,w) {
	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2];w=x[3]; x = x[0];
	}
	var xx = this.buf[0]*x + this.buf[4]*y + this.buf[8]*z + this.buf[12]*w ;
	var yy = this.buf[1]*x + this.buf[5]*y + this.buf[9]*z + this.buf[13]*w ;
	var zz = this.buf[2]*x + this.buf[6]*y + this.buf[10]*z + this.buf[14]*w ;
	var ww = this.buf[3]*x + this.buf[7]*y + this.buf[11]*z + this.buf[15]*w ;
	return [xx,yy,zz,ww] ;
}

//shorthand class method 
CanvasMatrix4.rotAndTrans = function(rx,ry,rz,tx,ty,tz) {
	var m = new CanvasMatrix4()
	if(rx!=0) m.rotate(rx,1,0,0) 
	if(ry!=0) m.rotate(ry,0,1,0)
	if(rz!=0) m.rotate(rz,0,0,1)
	m.translate(tx,ty,tz)
	return m 
}

//quaternion to matrix
CanvasMatrix4.prototype.q2m = function(x,y,z,w) {
	if(Array.isArray(x) || x instanceof Float32Array) {
		y = x[1]; z = x[2];w=x[3]; x = x[0];
	}
	var x2 = x*x; var y2=y*y; var z2=z*z ;
	this.buf[0] = 1- 2*(y2 + z2) ;
	this.buf[1] = 2*(x*y + w*z) ;
	this.buf[2] = 2*(x*z - w*y) ;
	this.buf[3] = 0 ;
	this.buf[4] = 2*(x*y - w*z) ;
	this.buf[5] = 1-2*(x2 + z2) ;
	this.buf[6] = 2*(y*z + w*x) ;
	this.buf[7] = 0 ;
	this.buf[8] = 2*(x*z + w*y) ;
	this.buf[9] = 2*(y*z - w*x) ;
	this.buf[10] = 1-2*(x2 + y2) ;
	this.buf[11] = 0 ; this.buf[12]=0; this.buf[13]=0; this.buf[14]=0;this.buf[15]=1;
	return this 
}
CanvasMatrix4.v2q = function(rot,x,y,z) {
	if(Array.isArray(x) || x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
	let l = x*x + y*y + z*z 
	if(l==0) return [0,0,0,1]
	if(l!=1) {
		l = Math.sqrt(l) 
		x /= l ; y /=l ; z /= l
	}
	rot = rot *CanvasMatrix4.RAD /2 
	let sr = Math.sin(rot) 
	return [x*sr,y*sr,z*sr,Math.cos(rot)]
}
CanvasMatrix4.e2q = function(x,y,z) {
	if(Array.isArray(x) || x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
	x *= CanvasMatrix4.RAD*0.5
	y *= CanvasMatrix4.RAD*0.5
	z *= CanvasMatrix4.RAD*0.5
	let c1 = Math.cos(x),c2=Math.cos(y),c3=Math.cos(z)
	let s1 = Math.sin(x),s2=Math.sin(y),s3=Math.sin(z)
	// order YXZ
	let qx = s1 * c2 * c3 + c1 * s2 * s3;
    let qy = c1 * s2 * c3 - s1 * c2 * s3;
    let qz = c1 * c2 * s3 - s1 * s2 * c3;
    let qw = c1 * c2 * c3 + s1 * s2 * s3;
    return [qx,qy,qz,qw]
}
CanvasMatrix4.qMult = function(q1,q2) {
	let w = q1[3] * q2[3] -(q1[0]*q2[0]+q1[1]*q2[1]+q1[2]*q2[2])
	let x = q1[1]*q2[2] - q1[2] * q2[1] + q1[3]*q2[0] + q2[3]*q1[0]
	let y = q1[2]*q2[0] - q1[0] * q2[2] + q1[3]*q2[1] + q2[3]*q1[1]
 	let z = q1[0]*q2[1] - q1[1] * q2[0] + q1[3]*q2[2] + q2[3]*q1[2]
	return [x,y,z,w]	
}
	

class Vector extends Array {
	constructor(...args) {
		let v = args 
		if(Array.isArray(args[0])) v = args[0]
		super(...v)
	}
	set x(v) {this[0] = v}
	set y(v) {this[1] = v}
	set z(v) {this[2] = v}
	set w(v) {this[3] = v}
	set r(v) {this[0] = v}
	set g(v) {this[1] = v}
	set b(v) {this[2] = v}
	set a(v) {this[3] = v}
	get x() { return this[0]}
	get y() { return this[1]}
	get z() { return this[2]}
	get w() { return this[3]}
	get r() { return this[0]}
	get g() { return this[1]}
	get b() { return this[2]}
	get a() { return this[3]}
//retrun new vector
	get xy() { return new Vector(this[0],this[1])}
	get yx() { return new Vector(this[1],this[0])}
	get xz() { return new Vector(this[0],this[2])}
	get zx() { return new Vector(this[2],this[0])}
	get yz() { return new Vector(this[1],this[2])}
	get zy() { return new Vector(this[2],this[1])}
	get xyz() { return new Vector(this[0],this[1],this[2])}
	get xzy() { return new Vector(this[0],this[2],this[1])}
	get yxz() { return new Vector(this[1],this[0],this[2])}
	get yzx() { return new Vector(this[1],this[2],this[0])}
	get zxy() { return new Vector(this[2],this[0],this[1])}
	get zyx() { return new Vector(this[2],this[1],this[0])}
	get rgb() { return new Vector(this[0],this[1],this[2])}

	cross(vec) {
		if(this.length!=3 || vec.length!=3 ) throw -1 
		let r = [
			this[1]*vec[2] - this[2] * vec[1],
			this[2]*vec[0] - this[0] * vec[2],
			this[0]*vec[1] - this[1] * vec[0] 
			]
		return new Vector(r) 
	}
	mix(vec ,ratio ) {
		return new Vector(this.map((v,i)=>v*(1-ratio)+vec[i]*ratio)) 
	}

	invert() {
		return new Vector(this.map(v=>-v)) 
	}
	add(tgt) {
		if(!Array.isArray(tgt)) tgt = new Array(this.length).fill(tgt)
		if(this.length!=tgt.length) throw -1
		return new Vector(this.map((v,i)=>v+tgt[i])) 
	}
	sub(tgt) {
		if(!Array.isArray(tgt)) tgt = new Array(this.length).fill(tgt)
		if(this.length!=tgt.length) throw -1
		return new Vector(this.map((v,i)=>v-tgt[i])) 
	}
	mult(tgt ) {
		if(!Array.isArray(tgt)) tgt = new Array(this.length).fill(tgt)
		return new Vector(this.map((v,i)=>v*tgt[i])) 	
	}
	normalize() {
		let l = this.hypot() 
		return new Vector(this.map((v,i)=>(l!=0)?v/l:0)) 
	}
	floor() {
		return new Vector(this.map((v,i)=>Math.floor(v))) 	
	}
	ceil() {
		return new Vector(this.map((v,i)=>Math.ceil(v))) 		
	}
	fract() {
		return new Vector(this.map((v,i)=>v-Math.floor(v))) 		
	}
	min(tgt ) {
		if(!Array.isArray(tgt)) tgt = new Array(this.length).fill(tgt)
		return new Vector(this.map((v,i)=>(v<tgt[i])?v:tgt[i])) 			
	}
	max(tgt ) {
		if(!Array.isArray(tgt)) tgt = new Array(this.length).fill(tgt)
		return new Vector(this.map((v,i)=>(v>tgt[i])?v:tgt[i])) 			
	}
	clamp(min,max) {
		return new Vector(this.map((v,i)=>(v<min)?min:(v>max)?max:v)) 			
	}
	step(th) {
		return new Vector(this.map((v,i)=>(v<th)?0:1)) 			
	}
	mod(a) {
		return new Vector(this.map((v,i)=>v % a)) 		
	}
//return float
	dot(vec) {
		return this.reduce((a,v,i)=>a+=v*vec[i],0)
	}
	distance(vec) {
		let v = new Vector(...this)
		return v.sub(vec).hypot()
	}
	hypot() {
		return Math.hypot(...this)
	}
// return bool
	equal(vec) {
		return this.reduce((a,v,i)=>a && v===vec[i],true)
	}
}//mouse and touch event handler
Pointer = function(t,cb) {
	var self = this ;
	var touch,gesture,EV_S,EV_E,EV_M ;
	function pos(ev) {
		var x,y ;
		if(touch && ev.touches && ev.touches.length>0) {
			x = ev.touches[0].pageX - ev.target.offsetLeft ;
			y = ev.touches[0].pageY - ev.target.offsetTop ;
		} else {
			x = ev.offsetX ;
			y = ev.offsetY ;
		}
		return {x:x,y:y} ;
	}
	t.addEventListener("mousedown", startev,false ) ;
	t.addEventListener("touchstart", startev,false ) ;
	function startev(ev) {
		if(gesture) return ;
		if(!EV_S) {
			touch = (ev.type=="touchstart") ;
			setevent() ;
			first = false ;
		}
		self.mf = true ;
		self.dx = self.dy = 0 ;
		self.s = pos(ev) ;
		self.lastd = self.s ;
		if(cb.down) if(!cb.down({x:self.s.x,y:self.s.y,sx:self.s.x,sy:self.s.y})) ev.preventDefault() ;	
	}
	function setevent() {
		if(touch) {
			EV_S = "touchstart" ;
			EV_E = "touchend" ;
			EV_O = "touchcancel" ;
			EV_M = "touchmove" ;
		} else {
			EV_S = "mousedown" ;
			EV_E = "mouseup" ;
			EV_O = "mouseout" ;
			EV_M = "mousemove" ;	
		}
		t.addEventListener(EV_E, function(ev) {
			var c = pos(ev) ;
			var d = (ev.type=="touchend")?self.lastd:pos(ev) ;
			self.mf = false ;
			if(cb.up) if(!cb.up({x:c.x,y:c.y,ex:d.x,ey:d.y,dx:self.dx,dy:self.dy})) ev.preventDefault() ;
		},false);
		t.addEventListener(EV_O, function(ev) {
			self.mf = false ;
			var c = pos(ev) ;
			if(cb.out) if(!cb.out({x:c.x,y:c.y,dx:self.dx,dy:self.dy})) ev.preventDefault() ;
		},false);
		t.addEventListener(EV_M, function(ev) {
			if(gesture) return ;
			var d = pos(ev) ;
			self.lastd = d ;
			if(self.mf) {
				self.dx = (d.x-self.s.x) ;
				self.dy = (d.y-self.s.y) ;
				if(cb.move) if(!cb.move({x:d.x,y:d.y,ox:d.x,oy:d.y,dx:self.dx,dy:self.dy})) ev.preventDefault() ;
			}
		},false)	
	}
	if(cb.contextmenu) {
		t.addEventListener("contextmenu", function(ev){
			if(!cb.contextmenu({px:ev.offsetX,py:ev.offsetY})) ev.preventDefault() ;
		},false )
	}
	if(cb.wheel) {
		t.addEventListener("wheel", function(ev){
			if(!cb.wheel(ev.deltaY)) ev.preventDefault() ;
		},false ) ;
	}
	if(cb.gesture) {
		t.addEventListener("gesturestart", function(ev){
			gesture = true ;
			if(!cb.gesture(0,0)) ev.preventDefault() ;
		})
		t.addEventListener("gesturechange", function(ev){
		
			if(!cb.gesture(ev.scale,ev.rotation)) ev.preventDefault() ;
		})
		t.addEventListener("gestureend", function(ev){
			gesture = false ;
		})
	}
	if(cb.gyro) {
		window.addEventListener("deviceorientation", function(ev) {
			var or = window.orientation ;
			var rx,ry,rz ;
			rx = null ;ry = null; rz = null ;
			switch( or ){
				case 90:
					if(ev.gamma<0) {
						rx = ev.gamma+90 ;
						ry = 180-ev.alpha ;
						rz = ev.beta+180 ;						
					} else {
						rx = ev.gamma-90 ;
						ry = 360-ev.alpha ;
						rz = ev.beta ;						
					}
					break ;
				case -90:
					if(ev.gamma<0) {
						rx = -ev.gamma-90 ;
						ry = 180-ev.alpha ;
						rz = -ev.beta+180 ;	
					} else {
						rx = -ev.gamma+90 ;
						ry = 360-ev.alpha ;
						rz = -ev.beta ;						
					}

					break ;	
				default:
		
			}

			cb.gyro({rx:rx,ry:ry,rz:rz,orientation:or}) ;
		})
	}

}
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
		this.conn = false ;
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
		axes:[0,0,0,0]
	}
	this.egp = {
		buttons:[
			{pressed:false,touched:false},
			{pressed:false,touched:false}
		],
		axes:[0,0,0,0]
	}
	return ret ;
}
GPad.prototype.get = function(pad) {
	var gp 
	if(POXPDevice) {
		this.emu = false 
		if(POXPDevice.isPresenting && POXPDevice.session.inputSources) {
		const is = POXPDevice.session.inputSources
//		if(is.length>1) {
//			console.log(is[0])}
		for (let i=0;i<=is.length-1;i++) {
			if (is[i].gamepad && is[i].gamepad.mapping=="xr-standard") {
				is[i].gamepad.hand = is[i].handedness
				if (is[i].handedness=="left" && this.idx==1) {gp=is[i].gamepad }
				if (is[i].handedness=="right" && this.idx==0) {gp=is[i].gamepad }
				if(gp) {
					this.conn = true 
					break 
				} else this.conn = false 					
			}	
		}
		} else this.conn = false 
	} 
	if(!gp) {
		if(this.egp==null) return null ;	
		this.conn = true 
		gp = this.egp
		this.emu = true 
	} 
	var lgp = this.lastGp 
	gp.conn = this.conn 
	gp.emu = this.emu 
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
	const eps = 0.001 
	let axes = [gp.axes[0],gp.axes[1],gp.axes[2],gp.axes[3]]
	if(gp.axes[2]!==undefined && gp.axes[3]!==undefined) {
		 axes[0] = gp.axes[2]
		 axes[1] = gp.axes[3]
		 gp.stick = true ;
	} else gp.stick = false ;
	
	gp.eaxes = axes 
	for(var i=0;i<axes.length;i++) {
		if(Math.abs(axes[i]) < eps ) gp.axes[i] = 0 
		gp.dpad[i] = 0 
		if(lgp) {
			if(Math.abs(lgp.axes[i])<th && Math.abs(axes[i])>=th) {gp.dpad[i] = 1;gp.pf=true}
			if(Math.abs(lgp.axes[i])>=th && Math.abs(axes[i])<th) {gp.dpad[i] = -1;gp.pf=true}
		}
		lgp.axes[i] = axes[i]
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
		axes:[0,0,0,0]
	}
	this.egp = gp
	this.cf = true ;	
}//WBind 
// license MIT
// 2017 wakufactory 
WBind = { } 

WBind.create = function(init) {
	var obj = new WBind.obj ;
	if(init!==undefined) {
		for(var i in init) {
			obj[i] = init[i] ;
		}
	}
	return obj ;
}
WBind.obj = function() {
	this.prop = {} ;
	this._elem = {} ;
	this._check = {} ;
	this._func = {} ;
	this._tobjs = {} ;
}

WBind._getobj = function(elem,root) {
	if(!root) root = document ;
	var e ;
	if(typeof elem == "string") {
		e = root.querySelectorAll(elem) ;
		if(e.length==1) e = e[0] ;
		if(e.length==0) e = null ;
	} else {
		e = elem ;
	}
	return e ;		
}
WBind._getval = function(e) {
	var v = e.value ;
	if(e.type=="checkbox") {
		v = e.checked ;
	}
	if(e.type=="select-multiple") {
		var o = e.querySelectorAll("option") ;
		v = [] ;
		for(var i=0;i<o.length;i++ ) {
			if(o[i].selected) v.push(o[i].value) ;
		}
	}
	if(e.type=="range") v = parseFloat(v) ;
	if(e.type=="file") v = e.files 
	return v ;		
}

// bind innerHTML
WBind.obj.prototype.bindHtml= function(name,elem,func) {
	var e = WBind._getobj(elem);
	if(!e) return this ;
	this._elem[name] = e ;
	if(!func) func={} ;
	this._func[name] = func ;

	Object.defineProperty(this,name,{
		configurable: true,
		get: function() {
//			WBind.log("get "+name)
			if((e instanceof NodeList || Array.isArray(e))) this.prop[name] = e[0].innerHTML ;
			else this.prop[name] = e.innerHTML ;
			return this.prop[name]  ;
		},
		set:function(val) {
//			WBind.log("set "+name) 
			if(this._func[name].set) val = this._func[name].set(val) ;
			this.prop[name] = val ;
			if((e instanceof NodeList || Array.isArray(e))) {
				for(var i=0;i<e.length;i++) {
//					console.log(this._elem[name][i])
					this._elem[name][i].innerHTML = val 
				}
			} else  this._elem[name].innerHTML = val ;
		}
	})
	if((e instanceof NodeList || Array.isArray(e))) this.prop[name] = e[0].innerHTML ;
	else this.prop[name] = e.innerHTML ;
	return this ;
}
//bind css
WBind.obj.prototype.bindStyle= function(name,elem,css,func) {
	var e = WBind._getobj(elem);
	if(!e) return this ;
	this._elem[name] = e ;
	if(!func) func={} ;
	this._func[name] = func ;	

	Object.defineProperty(this,name,{
		configurable: true,
		get: function() {
//			WBind.log("get "+name)
			if((e instanceof NodeList || Array.isArray(e))) this.prop[name] = e[0].style[css] ;
			else this.prop[name] = e.style[css] ;
			return this.prop[name]  ;
		},
		set:function(val) {
//			WBind.log("set "+name) 
			if(this._func[name].set) val = this._func[name].set(val) ;
			this.prop[name] = val ;
			if((e instanceof NodeList || Array.isArray(e))) {
				for(var i=0;i<e.length;i++) {
					this._elem[name][i].style[css] = val 
				}
			} else this._elem[name].style[css] = val ;
		}
	})
	if((e instanceof NodeList || Array.isArray(e))) this.prop[name] = e[0].style[css] ;
	else this.prop[name] = e.style[css] ;
	return this ;	
}
//bind attribute
WBind.obj.prototype.bindAttr= function(name,elem,attr,func) {
	var e = WBind._getobj(elem);
	if(!e) return this ;
	this._elem[name] = e ;
	if(!func) func={} ;
	this._func[name] = func ;	

	Object.defineProperty(this,name,{
		configurable: true,
		get: function() {
//			WBind.log("get "+name)
			if((e instanceof NodeList || Array.isArray(e))) this.prop[name] = e[0].getAttribute(attr) ;
			else this.prop[name] = e.getAttribute(attr) ;
			return this.prop[name]  ;
		},
		set:function(val) {
//			WBind.log("set "+name) 
			if(this._func[name].set) val = this._func[name].set(val) ;
			this.prop[name] = val ;
			if((e instanceof NodeList || Array.isArray(e))) {
				for(var i=0;i<e.length;i++) {
					this._elem[name][i].setAttribute(attr,val) 
				}
			} else this._elem[name].setAttribute(attr,val) ;
		}
	})
	if((e instanceof NodeList || Array.isArray(e))) this.prop[name] = e[0].getAttribute(attr) ;
	else this.prop[name] = e.getAttribute(attr) ;
	return this ;	
}
// bind input
WBind.obj.prototype.bindInput= function(name,elem,func) {
	var e = WBind._getobj(elem);
	if(!e) return this ;
	if(!func) func={} ;
	this._func[name] = func ;
	if((e instanceof NodeList || Array.isArray(e))&&
		e[0].type!="checkbox"&&e[0].type!="radio") e = e[0] ;
	var exist = (this.prop[name]!=undefined) ;
	this._elem[name] = e ;
	Object.defineProperty(this,name,{
		configurable: true,
		get: function() {
//			this.prop[name] = e.value ;
			var v = _getprop(name) ;
			if(this._func[name].get) v = this._func[name].get(v) ;
			return v  ;
		},
		set:function(val) {
//			WBind.log("set "+name) 
			if(this._func[name].set) val = this._func[name].set(val) ;
			this.prop[name] = val ;
			_setval(name,val) ;
			if(this._func[name].change) this._func[name].change(_getprop(name)) ;
			if(this._func[name].input) this._func[name].input(_getprop(name)) ;
		}
	})
	var self = this ;
	var v = null ;
	
	if((e instanceof NodeList || Array.isArray(e))) {

		if(e[0].type=="checkbox") self._check[name] = {} ;
		for(var i=0;i<e.length;i++) {
			if( typeof e[i] != "object") continue ;
			if(!exist) e[i].addEventListener("change", function(ev) {
				var val ;
				if(this.type=="checkbox" ) {
					self._check[name][this.value] = this.checked ;
					val = _getprop(name);
				}

				else val = this.value ;
				self.prop[name] = val ;
				if(self._func[name].get) val = self._func[name].get(val) ;
				WBind.log("get "+name+"="+val)
				if(self._func[name].change) self._func[name].change(val) ;
			})
			
			if(e[i].type=="radio" && e[i].checked) v = e[i].value ;
			else if(e[i].type=="checkbox" )  {
				self._check[name][e[i].value] = e[i].checked;
			}
		}
		if(e[0].type=="checkbox") v = _getprop(name);
	} else {
		v = WBind._getval(e) ;
		if(!exist) e.addEventListener("change", function(ev) {
			var val = WBind._getval(this) ;
			self.prop[name] = val ;
			if(self._func[name].get) val = self._func[name].get(val) ;
//			WBind.log("get "+name+"="+val)
			if(self._func[name].change) self._func[name].change(val) ;
		})
		if(!exist) e.addEventListener("input", function(ev) {
			var val = WBind._getval(this) ;
			self.prop[name] = val ;
			if(self._func[name].get) val = self._func[name].get(val) ;
	//		WBind.log("get "+name+"="+this.value)
			if(self._func[name].input) self._func[name].input(val) ;
		})
	}
	if(this._func[name].get) v = this._func[name].get(v) ;
	this.prop[name] = v ;
	if(self._func[name].input) this._func[name].input(v) ;
	if(self._func[name].change) this._func[name].change(v) ;


	function _getprop(name) {
		var v ;
		if(self._check[name]) {
			v = [] ;
			for(var i in self._check[name]) {
				if(self._check[name][i]) v.push(i);
			}
			self.prop[name] = v ;
		} else  v = self.prop[name] ;
		return v ;
	}

	function _setval(name,v) {
		var e = self._elem[name] ;
		if(e instanceof NodeList || Array.isArray(e)) {
			if(e[0].type=="radio") {
				for(var i=0;i<e.length;i++ ) {
					if(e[i].value == v) e[i].checked = true ;
				}
			}
			else if(e[0].type=="checkbox") {
				var chk = {} ;
				for(var i=0; i<v.length;i++) {
					chk[v[i]] = true ;
				}
				for(var i=0;i<e.length;i++ ) {
					e[i].checked = chk[e[i].value] ;
				}
				self._check[name] = chk ;
			}
		} 
		else if(e.type=="checkbox") e.checked = v ;
		else if(e.type=="select-multiple") {
			var o = e.querySelectorAll("option") ;
			for(var i=0;i<o.length;i++ ) {
				o[i].selected = false ;
				for(var vi=0;vi<v.length;vi++) {
					if(o[i].value==v[vi]) o[i].selected = true ;
				}
			}			
		}
		else if(e.type=="file") ;
		else e.value = v ;	
	}
	return this ;
}

WBind.obj.prototype.getCheck = function(name) {
	return this._check[name] ;
}
//set callback function
WBind.obj.prototype.setFunc = function(name,func) {
	for(var f in func) {
		this._func[name][f] = func[f] ;
	}
	var val = WBind._getval( this._elem[name]) ;
	if(this._func[name].get) val = this._func[name].get(val) ;
	this.prop[name] = val ;
	return this._func[name]  ;
}
//bind all input elements
WBind.obj.prototype.bindAllInput = function(base) {
	if(!base) base = document ;
	var o = base.querySelectorAll("input,select,textarea") ;
	var na = {} ;
	for(var i=0;i<o.length;i++) {
		var n = o[i].name ;
		if(na[n]) {
			if(Array.isArray(na[n])) na[n].push(o[i]) ;
			else na[n] = [na[n],o[i]] ;
		} else na[n] = o[i] ;
	}
	for(var i in na) {
		this.bindInput(i,na[i])
	}
	return na ;
}
WBind.obj.prototype.bindAll = function(selector,base) {
	if(base==null) base = document ;
	var b = base.querySelectorAll(selector) ;
	for(var i=0;i<b.length;i++) {
		var name = b[i].getAttribute("data-bind") ;
		if(b[i].tagName=="INPUT"||b[i].tagName=="SELECT") {
			this.bindInput(name,b[i]) ;
		} else {
			this.bindHtml(name,b[i])
		}
	}
}
//bind timer
WBind.obj.prototype.setTimer = function(name,to,ttime,opt) {
	if(Array.isArray(to)) {
		return this.setTimerM(name,to) ;
	}
	if(!opt) opt = {} ;
	var cd ;
	var sfx = null ;
	if(opt.from) cd = opt.from  ;
	else cd = this[name] ;
	if(isNaN(cd)) {
		if(cd.match(/^([0-9\-\.]+)(.*)$/)) {
			cd = parseFloat(RegExp.$1) ;
			opt.sfx = RegExp.$2 ;
		}
		else cd = 0 ;	
	} ;
	if(cd == to) return this;
	var delay = 0 ;
	if(opt.delay) delay = opt.delay ;
	var now = new Date().getTime() ;
	var o =  {from:cd,to:to,st:now+delay,et:now+delay+ttime,opt:opt} ;
	this._tobjs[name] = {tl:[o],tc:0} ;
//	WBind.log(o) ;
	return this ;
}
WBind.obj.prototype.setTimerM = function(name,s) {
	var o = [] ;
	var now = new Date().getTime() ;
	var cd = this[name] ;
	for(var i=0;i<s.length;i++) {
		var to = s[i].to ;
		var ttime = s[i].time ;
		var opt = s[i].opt ;
		if(!opt) opt = {} ;

		var sfx = null ;
		if(isNaN(cd)) {
			if(cd.match(/^([0-9\-\.]+)(.*)$/)) {
				cd = parseFloat(RegExp.$1) ;
				opt.sfx = RegExp.$2 ;
			}
			else cd = 0 ;	
		} ;
//		if(cd == to) continue ;
		var delay = 0 ;
		if(opt.delay) delay = opt.delay ;
		o.push({from:cd,to:to,st:now+delay,et:now+delay+ttime,opt:opt}) ;
		cd = to ;
	}
	this._tobjs[name] = {tl:o,tc:0} ;
	console.log(o);
	return this ;
}
WBind.obj.prototype.clearTimer = function(name) {
	delete(this._tobjs[name])
}
WBind.obj.prototype.updateTimer = function() {
	var now = new Date().getTime() ;
	for(var name in this._tobjs) {
		var obj = (this._tobjs[name])
		var o = obj.tl[obj.tc] ;
//		console.log(o);
		if(o===undefined) continue ;
		
		if(o.st>now) continue ;
		if(o.et<=now) {
			var v = o.to ;
			if(o.opt.sfx) v = v + o.opt.sfx ;
			this[name] = v ;
//			WBind.log("timeup "+o.key) ;
			obj.tc++ ;
			if(this._tobjs[name].tl.length<obj.tc) delete(this._tobjs[name]) ;
			if(o.opt.efunc) o.opt.efunc(o.to) ;

		} else {
			var t = (now-o.st)/(o.et-o.st) ;
			if(o.opt.tfunc) {
				if(typeof o.opt.tfunc =="string") {
					switch(o.opt.tfunc) {
						case "ease-in":
							t = t*t ;
							break ;
						case "ease-out":
							t = t*(2-t) ;
							break ;
						case "ease-inout":
							t = t*t*(3-2*t) ;
							break;
					}
				} else t = o.opt.tfunc(t) ;
			}
			var v = o.from + (o.to-o.from)* t;
			if(o.opt.sfx) v = v + o.opt.sfx ;
//			WBind.log(o.key+"="+v) ;
			this[name] = v ;
		}
	}
}


//utils
WBind.log = function(msg) {
	console.log(msg) ;
}
WBind.addev = function(id,event,fn,root) {
	var e = WBind._getobj(id,root) ;
	if(e) {
		if(!(e instanceof NodeList) && !Array.isArray(e)) e = [e] 
		for(var i=0;i<e.length;i++) {
			e[i].addEventListener(event,function(ev) {
				if(!fn(ev)) ev.preventDefault() ;
			}) ;
		}
	}
}
WBind.set = function(data,root) {
	if(!root) root = document ;
	if(!(data instanceof Array)) data = [data] ;

	for(var i =0;i<data.length;i++) {
		var d = data[i] ;
		var e ;
		if(d.obj) e = WBind._getobj(d.obj,root) ;
		if(d.id) e = root.getElementById(d.id) ;
		if(d.sel) e = root.querySelectorAll(d.sel) ;
		if(!e) continue ;
		if(!(e instanceof NodeList || Array.isArray(e))) e = [e] ;
		for(var ee=0;ee<e.length;ee++ ) {
			if(d.html !=undefined) e[ee].innerHTML = d.html ;
			if(d.value !=undefined) e[ee].value = d.value ;
			if(d.attr !=undefined) e[ee].setAttribute(d.attr,d.value) ;
			if(d.style !=undefined) {
				for(s in d.style) e[ee].style[s] = d.style[s] ;
			}
		}
	}
}
//draw canvas from json data
//				2018 wakufactory 
//
// shapes box,roundbox,text,textbox,img 
// property str,src ,rect,x,y,width,height 
// styles radius,color,border,background,lineWidth,font,lineHeight,align,offsetx,offsety
//
//export {json2canvas}
class json2canvas {

constructor(can) {
	this.canvas = can 
	this.data = null 
	this.width = can.width
	this.height = can.height 
	this.ctx = can.getContext("2d");
	this.bx = 0
	this.by = 0 
	this.default = {
		font:"20px sans-serif",
		borderColor:"black",
		textColor:"black",
//		backgroundColor:"white"
	}
	this.class = {}
	this.km = /[。、\.\-,)\]｝、〕〉》」』】〙〗〟’”｠»ゝゞーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇷ゚ㇺㇻㇼㇽㇾㇿ々〻‐゠–〜～?!‼⁇⁈⁉・:;\/]/
	this.tm = /[(\[｛〔〈《「『【〘〖〝‘“｟«]/
	this.am = /[a-zA-Z—―]/
}

clear(clearColor) {
	this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
	if(clearColor) {
		this.ctx.fillStyle = clearColor
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
	}
}
_ax(v) {
	return v + this.bx
}
_ay(v) {
	return v + this.by 
}
_aw(v) {
	return v 
}
_ah(v) {
	return v  
}

async draw(data){
	this.data = data 
	this.ctx.font = this.default.font 
	for(let i=0;i<data.length;i++) {
		const d = data[i]
		if(d.classdef) {
			this.class[d.classdef] = d.style ;
			continue ;
		}
		let style = {lineWidth:1,boder:this.default.borderColor}
		if(d.class) {
			for(let s in this.class[d.class]) {
				style[s] = this.class[d.class][s]	
			}
		}
		if(d.style) {
			for(let s in d.style) {
				style[s] = d.style[s]	
			}
		}
		let x = 0 ; let y = 0 ;
		let w=10; let h = 10 ;
		if(d.rect) style.rect = d.rect 
		if(d.x!=undefined) style.x = d.x 
		if(d.y!=undefined) style.y = d.y
		if(d.width!=undefined) style.width = d.width
		if(d.height!=undefined) style.height = d.height 
		if(style.rect) {
			x = style.rect[0] ;y=style.rect[1];w=style.rect[2];h=style.rect[3]
		} 
		if(style.x!=undefined) x = style.x 
		if(style.y!=undefined) y = style.y 
		if(style.width!=undefined) w = style.width
		if(style.height!=undefined) h = style.height
		
		this.ctx.save()
		switch(d.shape) {
			case "box":
				if(style.lineWidth) this.ctx.lineWidth = style.lineWidth
				if(style.background) {
					this.ctx.fillStyle = style.background 
					this.ctx.fillRect(this._ax(x),this._ay(y),this._aw(w),this._ah(h))
				}
				if(style.border) {
					this.ctx.strokeStyle = style.border
					this.ctx.strokeRect(this._ax(x),this._ay(y),this._aw(w),this._ah(h))
				}
				break ;
			case "roundbox":
				const radius = (style.radius)?style.radius:20 
				this.ctx.beginPath()
				this.ctx.moveTo(this._ax(x+radius),this._ay(y))
				this.ctx.lineTo(this._ax(x+w-radius),this._ay(y))
				this.ctx.arcTo(this._ax(x+w),this._ay(y),this._ax(x+w),this._ay(y+radius),radius)
				this.ctx.lineTo(this._ax(x+w),this._ay(y+h-radius))
				this.ctx.arcTo(this._ax(x+w),this._ay(y)+h,this._ax(x+w-radius),this._ay(y+h),radius)
				this.ctx.lineTo(this._ax(x+radius),this._ay(y+h))
				this.ctx.arcTo(this._ax(x),this._ay(y+h),this._ax(x),this._ay(y+h-radius),radius)
				this.ctx.lineTo(this._ax(x),this._ay(y+radius))
				this.ctx.arcTo(this._ax(x),this._ay(y),this._ax(x+radius),this._ay(y),radius)
				if(style.lineWidth) this.ctx.lineWidth = style.lineWidth
				if(style.background) {
					this.ctx.fillStyle = style.background 
					this.ctx.fill()
				}
				if(style.border) {
					this.ctx.strokeStyle = style.border
					this.ctx.stroke()
				}
				break ;
			case "line":
				
				break ;
			case "text":
				if(style.color) this.ctx.fillStyle = style.color ;else this.ctx.fillStyle = this.default.textColor
				if(style.font) this.ctx.font = style.font 
				if(style.align) this.ctx.textAlign = style.align ; else this.ctx.textAlign  = "left"
				if(style.width) {
					if(style.align=="right") x += w
					if(style.align=="center") x += w/2 
				} else w = undefined
				this.ctx.fillText(d.str,this._ax(x),this._ay(y),w)
				break ;
			case "textbox":
				let l 
				if(d.str) {
					l = this.boxscan(d,style)
					data[i].lines = l
				} else if(d.lines) {
					l = d.lines 
				}
				let lh = (style.lineHeight!=undefined)?style.lineHeight:20
				if(style.color) this.ctx.fillStyle = style.color ;else this.ctx.fillStyle = this.default.textColor
				if(style.font) this.ctx.font = style.font 
				if(style.align) this.ctx.textAlign = style.align ; else this.ctx.textAlign  = "left"
				if(style.align=="right") x += w
				if(style.align=="center") x += w/2 
				const ox = ((style.offsetx!=undefined)?style.offsetx:0)
				const oy = ((style.offsety!=undefined)?style.offsety:0)
				let lx =  - ox
				let ly =  lh - oy
				this.ctx.rect(this._ax(x),this._ay(y),w,h)
				this.ctx.clip() 
				for(let i=0;i<l.length;i++) {
					if(ly>0)
						this.ctx.fillText(l[i],this._ax(lx+x),this._ay(ly+y),w)
					if(ly>h+lh) break ;
					ly += lh 
				}
				break
			case "img":
				let img = await json2canvas.loadImageAjax(d.src)
				if(style.width!=undefined && style.height==undefined) {
					w = style.width ; h = style.width * img.height / img.width
				} else 
				if(style.width==undefined && style.height!=undefined) {
					h = style.height ; w = style.height * img.width / img.height
				} else
				if(style.width!=undefined && style.height!=undefined) {
					w = style.width ; h = style.height 
				} else {w=img.width;h=img.height}
				this.ctx.drawImage(img,x,y,w,h)
				break ;
		}
		if(d.children) {
			const bbx = this.bx ; const bby = this.by 
			this.bx = x ; this.by = y 
			this.draw(d.children)
			this.bx = bbx ;this.by = bby 
		}
		this.ctx.restore()
	}
}

getElementById(id,data) {
	if(!data) data = this.data 	
	for(let i=0;i<data.length;i++) {
		if(data[i].id == id) {
			return data[i] ;
		}
		if(data[i].children) {
			var c =  this.getElementById(id,data[i].children) ;
			if(c) return c ;
		}
	}
	return null
}
boxscan(d,style) {
	class unistr {
		constructor(str) {
			this._str = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
		}
		get length() { return this._str.length }
		get char() { return this._str }
		substr(i,n) {
			return this._str.slice(i,(n==undefined)?undefined:i+n).join("")
		}
	}
	let x = d.rect[0] ;let y=d.rect[1];let w=d.rect[2];let h=d.rect[3]
	let str = new unistr(d.str)
	this.ctx.save()
	if(style.font) this.ctx.font = style.font 
	let si =0 
	let lines = [] 

	for(let i =1 ;i<str.length;i++) {
		if(str.char[i] == "\n") {
			lines.push(str.substr(si,i-si))
			i++
			si = i 						
		} else 
		if(this.ctx.measureText(str.substr(si,i-si+1)).width > w) {
			let ii = i 
			while(i>ii-4 && str.char[i-1].match(this.tm)) i--	//行末禁則追い出し
			while(i<ii+4 && str.char[i].match(this.km)) i++		//行頭禁則追い込み

			while(str.char[i-1].match(this.am) && str.char[i].match(this.am)) { //分離禁止追い出し
				i-- 
				if(i==si) {
					i=ii ; break ; 
				}
			}
			lines.push(str.substr(si,i-si))
			si = i				
		}
	}
	if(si<str.length) {
		lines.push(str.substr(si))
	}
	this.ctx.restore()
	return lines
}

static async loadImageAjax(src) {
	return new Promise((resolve,reject)=>{
		json2canvas.loadAjax(src,{type:"blob"}).then((b)=>{
			const timg = new Image ;
			const url = URL.createObjectURL(b);
			timg.onload = ()=> {
				URL.revokeObjectURL(url)
				resolve(timg) ;
			}
			timg.src = url
		}).catch((err)=>{
			resolve(null) ;
		})
	})
}
static loadAjax(src,opt) {
	return new Promise((resolve,reject)=> {
		const req = new XMLHttpRequest();
		req.open("get",src,true) ;
		req.responseType = (opt && opt.type)?opt.type:"text" ;
		req.onload = ()=> {
			if(req.status==200) {
				resolve(req.response) ;
			} else {
				reject("Ajax error:"+req.statusText) ;					
			}
		}
		req.onerror = ()=> {
			reject("Ajax error:"+req.statusText)
		}
		req.send() ;
	})
}

static loadFont(name,path) {
	return new Promise((resolve,reject)=>{
		if(!document.fonts) {
			resolve(null)
			return 
		}
		let f = new FontFace(name,`url(${path})`,{})
		if(!f) {
			resolve(null)
			return 
		}
		f.load().then((font)=>{
			document.fonts.add(font)
			resolve(font) 
		}).catch((err)=> {
			reject(err) 
		})
	})
}
}  //class json2canvas//poxplayer.js
//  PolygonExplorer Player
//   wakufactory.jp
"use strict" ;
const Mat4 = CanvasMatrix4 // alias
const RAD = Math.PI/180 ;
class PoxPlayer {

constructor(can,opt) {
	this.version = "3.0.0" 
	if(!Promise) {
		throw "This browser is not supported!!"	
	}
	if(!opt) opt = {} 
	this.can = (can instanceof HTMLElement)?can:document.querySelector(can)  ;

	// wwg initialize
	const wwg = new WWG() ;
	const initopt = {preserveDrawingBuffer: opt.capture,antialias:true, xrCompatible: true }
	const useWebGL2 = !opt.noWebGL2
	if(!(useWebGL2 && wwg.init2(this.can,initopt)) && !wwg.init(this.can,initopt)) {
		throw "wgl not supported!"
	}
	if(opt.needWebGL2 && wwg.version!=2) {
		throw "needs wgl2"
	}
	this.wwg = wwg ;
//	if(window.WAS!=undefined) this.synth = new WAS.synth() 
	
	const Param = WBind.create() ;
	this.param = Param ;
	Param.bindInput("isStereo",(opt.ui && opt.ui.isStereo)?opt.ui.isStereo:"#isstereo") ;
	Param.bindInput("autorot",(opt.ui && opt.ui.autorot)?opt.ui.autorot:"#autorot") ;
	Param.bindInput("pause",(opt.ui && opt.ui.pause)?opt.ui.pause:"#pause") ;
	Param.bindHtml("fps",(opt.ui && opt.ui.fps)?opt.ui.fps:"#fps") ;
	Param.bindInput("camselect",(opt.ui && opt.ui.camselect)?opt.ui.camselect:"#camselect") ;
	
	this.pixRatio = 1 
	this.pox = {can:this.can,wwg:this.wwg,synth:this.synth,poxp:this}
	this.setpox(this.pox)
	this.eventListener = {}
	this.clearEvent() 

	if(window.GPad) {
		this.pox.gPad = new GPad()
		this.pox.gPad.name = "1"
		this.pox.gPad2 = new GPad()
		this.pox.gPad2.name = "2"
		if(!this.pox.gPad.init(0,(pad,f)=>{
			if(f) {
				this.pox.log("set 1"+pad.gp.hand)
			}
		}))
		if(!this.pox.gPad2.init(1,(pad,f)=>{
			if(f) {
				this.pox.log("set 2"+pad.gp.hand)
			}
		}))
//		console.log(this.pox.gPad)
		this.pox.gPad.ev = (pad)=> {
			this.callEvent("gpad",pad) ;
		}
		this.pox.gPad2.ev = (pad,b,p)=> {
			this.callEvent("gpad",pad) ;
		}
	}
	// canvas initialize
	this.resize() ;
	window.addEventListener("resize",()=>{this.resize()}) ;
	this.pause = true ;

	this.setMouseEvent() ;
	// VR init 
	POXPDevice.checkVR(this).then(f=>{
		if(f) console.log("WebXR supported")
		this.vrReady = f 
	})
	this.scenes = []
	
	//create default camera
	this.cam0 = this.createCamera()
	this.cam1 = this.createCamera() ;
	this.ccam = this.cam1 
}

//event handling
addEvent(ev,cb) {
	let el = null
	switch(ev) {
		case "frame":
			el = {cb:cb,active:true}
			this.eventListener.frame.push(el)
			break 
		case "gpad":
			el = {cb:cb,active:true}
			this.eventListener.gpad.push(el)
			break 
		case "vrchange":
			el = {cb:cb,active:true}
			this.eventListener.vrchange.push(el)
			break 
		case "param":
			el = {cb:cb,active:true}
			this.eventListener.param.push(el)
			break 
	}
	return el
}
removeEvent (ev) {
	this.eventListener.frame = this.eventListener.frame.filter((e)=>(e!==ev))
	this.eventListener.gpad = this.eventListener.gpad.filter((e)=>(e!==ev))
	this.eventListener.vrchange = this.eventListener.vrchange.filter((e)=>(e!==ev))
	this.eventListener.param = this.eventListener.param.filter((e)=>(e!==ev))
}
clearEvent() {
	this.eventListener.frame = []
	this.eventListener.gpad = []
	this.eventListener.vrchange = []
	this.eventListener.param = []
}

// load soure jsonfile
async load(d) {
	return new Promise((resolve,reject) => {
		if(typeof d == "string") {
			const req = new XMLHttpRequest();
			req.open("get",d,true) ;
			req.responseType = "json" ;
			req.onload = () => {
				if(req.status==200) {
//					console.log(req.response) ;
					resolve(req.response) ;
				} else {
					reject("Ajax error:"+req.statusText) ;
				}
			}
			req.onerror = ()=> {
				reject("Ajax error:"+req.statusText)
			}
			req.send() ;
		} else resolve(d) ;
	})
}

loadImage(path) {
	if(path.match(/^https?:/)) {
		return this.wwg.loadImageAjax(path)
	}else {
		return new Promise((resolve,reject) => {
			const img = new Image() ;
			img.onload = ()=> {
				resolve( img ) ;
			}
			img.onerror = ()=> {
				reject("cannot load image") ;
			}
			img.src = path ;
		})
	}
}

setpox(POX) {
	POX.log = (msg)=> {
		if(this.errCb) this.errCb(msg) ;
	}
	POX.loadImage = this.loadImage 
	POX.loadAjax = this.wwg.loadAjax
	POX.addEvent = (e,f) => this.addEvent(e,f)
	POX.exitVR = this.exitVR 
	try {
		POX.profile = new PoxProfile(this)
	} catch(err) {POX.profile=null }
	
	POX.setScene = async (scene)=> {
		return new Promise((resolve,reject) => {
			this.setScene(scene).then( () => {
				resolve() ;
			}).catch((err)=>	 {
				console.log("render err"+err.stack)
			})
		})
	}
	POX.getModule = (n)=>this.m1
	POX.getWorker = (n)=>this.w1
	POX.loadModule = (m)=>this.loadModule(m) 
	POX.initModule = (m)=>this.initModule(m) 

	POX.addModel = (model)=>{ if(this.render) return this.render.addModel(model) }
	POX.removeModel = (model)=>{ if(this.render) return this.render.removeModel(model) }
	POX.getModelData = (model)=>{ if(this.render) return this.render.getModelData(model) }
	POX.setModelData = (model,data)=>{
		const m = this.render.getModelData(model)
		if(data.matrix) m.mm = data.matrix
		if(data.fs_uni) {
			for(let k in data.fs_uni) m.fs_uni[k] = data.fs_uni[k]  
		}
		if(data.vs_uni) {
			for(let k in data.vs_uni) m.vs_uni[k] = data.vs_uni[k]  
		}
		for(let k of ["hide","parent","blend","cull"]) if(data[k]!==undefined) m[k] = data[k] 
		if(data.geo) {
			this.render.updateModel(model,"vbo",data.geo.vtx,data.geo.subdata)
		}
		if(data.inst) {
			this.render.updateModel(model,"inst",data.inst.data,data.inst.subdata)		
		}
	}
	POX.setSceneData = (data) =>{
		if(data.fs_uni) {
			for(let k in data.fs_uni) this.render.data.fs_uni[k] = data.fs_uni[k]  
		}
		if(data.vs_uni) {
			for(let k in data.vs_uni) this.render.data.vs_uni[k] = data.vs_uni[k]  
		}
		if(data.env) {
			for(let k in data.env) this.render.data.env[k] = data.env[k]  
		}		
	}
	POX.addTex = (tex)=>this.render.addTex(tex)
	POX.updateTex = (tex,data)=>this.render.updateTex(tex,data)
	POX.removeTex = (tex)=>this.render.removeTex(tex)
	POX.loading = (f)=>{
		if($('loading')) $('loading').style.display = f?"block":"none"
	}
}
async loadScene(scene) {

	
}
//set js soure and init 
async setsrc(sc,settings) {
	this.pox.src = sc 
	this.pox.setting = settings 
	this.loadModuleSrc(sc.js).then(mod=>{
		this.initModule(mod)
	})
}

// load module from string source
loadModuleSrc(src,param) {
	function b64EncodeUnicode(str) {
	    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
	        function toSolidBytes(match, p1) {
	            return String.fromCharCode('0x' + p1);
	    }));
	}
	return this.loadModule("data:text/javascript;base64," 
		+ b64EncodeUnicode(src),param)
}
// load module from path
async loadModule(path,param) {
	return new Promise((resolve,reject) => {
		import(path).then((module)=> {
			resolve(module)
		}).catch((err)=>{
			this.pox.log("module "+err.stack )
			reject(["module",err.stack])
		})
	})	
}
initModule(module) {
	return new Promise(async (resolve,reject) => {
			if(module.init) {
				try {
					await module.init(this.pox)
				} catch(err) {
					this.pox.log("init "+err.stack)
					reject(["init",err.stack])
				}
			}
			if(module.frame) {
				this.addEvent("frame",module.frame )
			} 
			resolve(module)
	})	
}

stop() {
	window.cancelAnimationFrame(this.loop) ; 
	if(this.pox.unload) this.pox.unload() ;
}
cls() {
	if(this.render) this.render.clear() ;
}
setError(err) {
	this.errCb = err ;
}
callEvent(kind,ev,opt) {
	if(typeof ev == "object") ev.rtime = this.rtime
	let ret = true 
	if(this.pox.event) {
		try {
			ret = this.pox.event(kind,ev,opt)
		} catch(err) {
			this.errCb(err.stack)
		}
	}
	if(kind=="vrchange") {
		this.cam1.vrchange(ev)
		for(let i=0;i<this.eventListener.vrchange.length;i++) {	//attached event
			const f = this.eventListener.vrchange[i]
			if(f.active) {
				f.cb({vrmode:ev})
			}
		}
	}
	if(kind=="gpad") {
		if(ev.dbtn[5]==-1) POXPDevice.closeVR()
		for(let i=0;i<this.eventListener.gpad.length;i++) {	//attached event
			const f = this.eventListener.gpad[i]
			if(f.active) {
				let p = {gpad:ev}
				if(ev.hand=="left") p.leftPad = ev
				if(ev.hand=="right") p.rightPad = ev
				if(this.pox.setting.primaryPad == ev.hand) p.primaryPad = ev
				else p.secondaryPad = ev 
				f.cb(p)
			}
		}		
	}
	if(kind=="param") {
		for(let i=0;i<this.eventListener.param.length;i++) {	//attached event
			const f = this.eventListener.param[i]
			if(f.active) {
				f.cb(ev)
			}
		}
	}
	return ret 
}
setParam(param,dom) {
	if(param===undefined) return ;
	this.uparam = WBind.create()
	const input = [] ;
	for(let i in param) {
		const p = param[i] ;
		const name = (p.name)?p.name:i ;
		let size = ""
		if(!p.type) p.type = "range" 
		if(!p.step) p.step = 100 ;
		if(p.size) size = "size="+p.size
		let tag = `<div class=b><div class=t>${name}</div> <input type=${p.type} id="_p_${i}" ${size} min=0 max=${p.step} style="${(p.type=="disp")?"display:none":""}"  /><div class=v id=${"_p_d_"+i}></div></div>`
		input.push(tag)
	}
	dom.innerHTML = input.join("") 
	function _tohex(v) {
		let s = (v*255).toString(16) ;
		if(s.length==1) s = "0"+s ;
		return s ;
	}
	function _setdisp(i,v) {
		if(v===undefined || param[i].type=="file"|| param[i].type=="text"|| param[i].type=="button") return 
		if(param[i].type=="color" && v ) {
			document.getElementById('_p_d_'+i).innerHTML = v.map((v)=>v.toString().substr(0,5)) ;
		} else if(param[i].type=="range")  {
			if(param[i].enum) {
				document.getElementById('_p_d_'+i).innerHTML = param[i].enum[Math.floor(v)]
			} else document.getElementById('_p_d_'+i).innerHTML = v.toString().substr(0,5) ;	
		} else document.getElementById('_p_d_'+i).innerHTML = v
	}
	for(let i in param) {
		let p = param[i]
		this.uparam.bindInput(i,"#_p_"+i)
		this.uparam.setFunc(i,{
			set:(v)=> {
				let ret = v ;
				if(p.type=="color") {
					ret = "#"+_tohex(v[0])+_tohex(v[1])+_tohex(v[2])
				} else if(p.type=="range") {
					if(p.scale=="log10") ret = Math.log10(v/p.min)/Math.log10(p.max/p.min)*p.step
					else ret = (v - p.min)*(p.step)/(p.max - p.min)
				}
//				console.log(ret)
				_setdisp(i,ret)
				return ret 	
			},
			get:(v)=> {
				let ret = v ;
				if(p.type=="color" ) {
					if(typeof v =="string" && v.match(/#[0-9A-F]+/i)) {
						ret =[parseInt(v.substr(1,2),16)/255,parseInt(v.substr(3,2),16)/255,parseInt(v.substr(5,2),16)/255] ;
					} else ret = v ;
				} else if(p.type=="range" ) {
					if(p.scale=="log10") ret = Math.pow(10,Math.log10(p.min)+Math.log10(p.max/p.min)*v/p.step)
					else ret = v*(p.max-p.min)/(p.step)+p.min 
				}		
				return ret ;
			},
			input:(v)=>{
				_setdisp(i,this.uparam[i])
//				this.keyElelment.focus()
				this.callEvent("param",{key:i,value:v})
			}
		})
		this.uparam[i] = p.value ;
	}
	this.pox.param = this.uparam ;
}


setScene(sc) {
	const wwg = this.wwg ;
	const pox = this.pox ;
	const can = this.can ;

	const pixRatio = this.pixRatio
	const Param = this.param ;
	const sset = pox.setting || {} ;
	if(!sset.scale) sset.scale = 1.0 ;
	if(!sset.primaryPad) sset.primaryPad = "right";
	
	if(sc.cam) pox.setting.cam = sc.cam
	if(sc.param) pox.param = sc.param
	sc.vshader = {text:pox.src.vs} ;
	sc.fshader = {text:pox.src.fs} ;
	pox.scene = sc ;

	//create render unit
	const r = wwg.createRender() ;
	this.render = r ;
	pox.render = r ;

	let ccam = this.ccam
	
	this.isVR = false 
	const self = this 
	const bm = new CanvasMatrix4()
	const mMtx = []
	const vMtx = []
	const mvMtx = []
	const vpMtx = []
	const iMtx = []
	const miMtx = []	
	return new Promise((resolve,reject) => {
	r.setRender(sc).then(()=> {	
		if(this.errCb) this.errCb("scene set ok") ;
		if(this.renderStart) this.renderStart() ;

		if(pox.setting && pox.setting.pixRatio) { 
			this.pixRatio = pox.setting.pixRatio ;
		} else {
			this.pixRatio = 1 ;
		}
		this.resize();
		
		if(pox.setting.cam) {
			this.cam0.setCam(pox.setting.cam)
			this.cam0.setCam({camMode:"bird"})
			this.cam1.setCam(pox.setting.cam)
		}
//		if(ccam.cam.camMode=="walk") this.keyElelment.focus() ;
		this.keyElelment.value = "" ;
		this.clearEvent()
		
		resolve()
		//draw loop
		let st = new Date().getTime() ;
		this.ctime = st 
		this.ltime = st 
		let tt = 0 ;
		let rt = 0 ;
		let ft = st ;
		let fc = 0 ;
		let gpad 
		const loopf = (timestamp,frame) => {
//			console.log("************loop")
			POXPDevice.animationFrame(this,loopf,frame)

			const ct = new Date().getTime() ;
			this.ctime = ct 
			if(Param.pause) {
				Param.fps=0;
				tt = rt ;
				st = ct ;
				return ;
			}
			rt = tt + ct-st ;
			fc++ ;
			if(ct-ft>=500) {
//				if(this.isVR) console.log(fc)
				Param.fps = Math.floor(fc*1000/(ct-ft)+0.5) ;
				fc = 0 ;
				ft = ct ; 
			}
			this.ccam = (Param.camselect && !this.isVR)?this.cam0:this.cam1
			ccam = this.ccam 
			pox.cam = ccam.cam ;

			if(Param.autorot) ccam.setCam({camRY:(rt/100)%360}) ;
			let rp=null,lp=null,pp=null,sp=null
			const xi = POXPDevice.getInput() 
			if(0) {
				rp = xi.gamepad?.right?.gamepad
				lp= xi.gamepad?.left?.gamepad
			} else if(pox.gPad) {
				let p1 = pox.gPad.get()
				let p2 = pox.gPad2.get() 
				if(this.isVR) {
					if(!p1.emu && p1.hand == "right") rp = p1 ;
					if(!p1.emu && p1.hand == "left") lp = p1 ;
					if(!p2.emu && p2.hand == "right") rp = p2 ;
					if(!p2.emu && p2.hand == "left") lp = p2 
				} else {
					if(p1.hand == "right" ) rp = p1
					if(p2.hand == "right" ) rp = p2				
					if(p1.hand == "left" ) lp = p1
					if(p2.hand == "left" ) lp = p2
				}
			}
			if(sset.primaryPad=="left") pp = lp,sp = rp
			else pp=rp,sp=lp
			if(!pp || !pp.conn) pp = sp, sp = null 
//				console.log(pp)
//				console.log(sp)
			if(ccam.cam.gPad) ccam.setPad(pp,sp)

			ccam.update()	// camera update
			let camm = ccam.getMtx(sset.scale,(Param.isStereo || self.isVR)?1:0) ;
			
			for(let i=0;i<this.eventListener.frame.length;i++) {	//attached event
				const f = this.eventListener.frame[i]
				if(f.active) {
					try {
					f.cb({render:r,pox:pox,ccam:ccam,cam:ccam.cam,rtime:rt/1000,
						xrinput:xi,
						rightPad:rp,leftPad:lp,
						primaryPad:pp,secondaryPad:sp})
					} catch(err) {
						this.pox.log(err.stack)
						Param.pause = true
					}
				}
			}
			let upd = {}
			if(pox.update)  upd = pox.update(r,ccam.cam,rt,-1)
			Param.updateTimer() ;
			update(r,pox,camm,rt,upd) ; // scene update 
			POXPDevice.submitFrame(this)
			this.ltime = ct 
			this.rtime = rt
		}
		loopf() ;		
	}).catch((err)=>{
		console.log(err) ;
		if(this.errCb) this.errCb(err.stack?err.stack:err) ;
		reject(err) 
	})
	}) // promise
	
	function getParentMtx(render,parent) {
		let p = render.getModelData(parent) 
		if(!p) return new Mat4() 
		let mm = new Mat4(p.bm)
		if(!mm) mm = new Mat4() 
		if(p.mm) mm.multRight(p.mm)
		if(p.parent!==undefined) {
			mm.multRight( getParentMtx(render,p.parent)) 
		} 
		return mm 
	}
	// calc model matrix
	function modelMtx2(render,camm) {

		// calc each mvp matrix and invert matrix
		const mod = [[],[]] ;	
		const models = render.data.model 	
		for(let i=0;i<models.length;i++) {
			let d = models[i] ;
			if(!d) continue 
			bm.load(d.bm)
			if(d.mm) bm.multRight(d.mm) ;
			if(d.parent!==undefined) {
				bm.multRight( getParentMtx(render,d.parent ))
			}
			if(render.data.group) {
				let g = render.data.group ;
				for(let gi = 0 ;gi < g.length;gi++) {
					let gg = g[gi] ;
					if(!gg.bm) continue ;
					for(let ggi=0;ggi<gg.model.length;ggi++) {
						if(render.getModelIdx(gg.model[ggi])==i) bm.multRight(gg.bm) ;
					}
				}
			}
			if(!mMtx[i]) mMtx[i] = new CanvasMatrix4()
			if(!iMtx[i]) iMtx[i] = new CanvasMatrix4()
			if(!miMtx[i]) miMtx[i] = new CanvasMatrix4()
			if(!mvMtx[i]) mvMtx[i] = [new CanvasMatrix4(),new CanvasMatrix4()]			
			if(!vpMtx[i]) vpMtx[i] = [new CanvasMatrix4(),new CanvasMatrix4()]			
			d.modelMtx = mMtx[i]
			const uni0 = {
				vs_uni:{
					modelMatrix:mMtx[i].load(bm).getAsWebGLFloatArray(),
					vpMatrix:vpMtx[i][0].load((d.camFix)?camm[0].camP:camm[0].camVP).getAsWebGLFloatArray(),
					mvpMatrix:mvMtx[i][0].load(bm).multRight( (d.camFix)?camm[0].camP:camm[0].camVP).getAsWebGLFloatArray(),
					invMatrix:iMtx[i].load(bm).
						invert().transpose().getAsWebGLFloatArray(),
					minvMatrix:miMtx[i].load(bm).
						invert().getAsWebGLFloatArray()}
			}
			const uni1 = {
				vs_uni:{
					modelMatrix:mMtx[i].load(bm).getAsWebGLFloatArray(),
					vpMatrix:vpMtx[i][1].load((d.camFix)?camm[1].camP:camm[1].camVP).getAsWebGLFloatArray(),
					mvpMatrix:mvMtx[i][1].load(bm).multRight( (d.camFix)?camm[1].camP:camm[1].camVP).getAsWebGLFloatArray(),
					invMatrix:iMtx[i].load(bm).
						invert().transpose().getAsWebGLFloatArray(),
					minvMatrix:miMtx[i].load(bm).
						invert().getAsWebGLFloatArray()}
			}
			uni0.fs_uni = uni0.vs_uni
			uni1.fs_uni = uni1.vs_uni
			uni0.fs_uni.vpMatrix_l = uni0.fs_uni.vpMatrix 
			uni0.fs_uni.vpMatrix_r = uni1.fs_uni.vpMatrix 
			uni1.fs_uni.vpMatrix_l = uni0.fs_uni.vpMatrix 
			uni1.fs_uni.vpMatrix_r = uni1.fs_uni.vpMatrix 			
			mod[0][i] = uni0 
			mod[1][i] = uni1 
			
			d.modelMtx = mMtx[i]
		}
		let up = [{model:mod[0],fs_uni:{},vs_uni:{}},
			{model:mod[1],fs_uni:{},vs_uni:{}}]

		up[0].fs_uni.stereo = 1 ;
		up[0].fs_uni.resolution = [can.width,can.height]
		up[0].fs_uni.camMatirx = camm[0].camV.getAsWebGLFloatArray()
		up[0].fs_uni.eyevec = [camm[0].camX,camm[0].camY,camm[0].camZ]
		up[0].vs_uni.stereo = 1 ;
		up[0].vs_uni.camMatirx = up[0].fs_uni.camMatirx
		up[0].vs_uni.eyevec = up[0].fs_uni.eyevec 
	
		up[1].fs_uni.stereo = 2  ;
		up[1].fs_uni.resolution = up[0].fs_uni.resolution
		up[1].fs_uni.camMatirx = camm[1].camV.getAsWebGLFloatArray()
		up[1].fs_uni.eyevec = [camm[1].camX,camm[1].camY,camm[1].camZ]
		up[1].vs_uni.stereo = 2  ;	
		up[1].vs_uni.camMatirx = up[1].fs_uni.camMatirx
		up[1].vs_uni.eyevec = up[1].fs_uni.eyevec 	
		return up ;		
	}
	// update scene

	function update(render,pox,camm,time,update) {
		// draw call 

		render.data.model.sort((a,b)=>{
			if(a===null) return -1
			if(b===null) return 1
			let al = a.layer, bl = b.layer 
			if(al===undefined) al = 0 
			if(bl===undefined) bl = 0 
			return al- bl  
		}) 
		let mtx2 = modelMtx2(render,camm) ;
		if(Param.isStereo || self.isVR) {
			let vp = POXPDevice.getViewport(can)
			render.viewport = vp 
			if(POXPDevice.isPresenting) {
//				console.log("fbs")
				render.gl.bindFramebuffer(render.gl.FRAMEBUFFER, 
					POXPDevice.webGLLayer.framebuffer)
			}
	
			if(update.vs_uni===undefined) update.vs_uni = {} ;
			if(update.fs_uni===undefined) update.fs_uni = {} ;
			update.fs_uni.rtime = time/1000 ;
			update.fs_uni.time = update.fs_uni.rtime
			update.vs_uni.rtime = time/1000 ;		
			update.vs_uni.time = update.vs_uni.rtime
			render.gl.viewport(vp.leftViewport.x,vp.leftViewport.y, vp.leftViewport.width,vp.leftViewport.height) ;
			render.draw([update,mtx2[0]],false) ;
			render.gl.viewport(vp.rightViewport.x,vp.rightViewport.y, vp.rightViewport.width,vp.rightViewport.height) ;
			render.draw([update,mtx2[1]],true) ;
			if(POXPDevice.isPresenting) {
//				console.log("fbe")
				render.gl.bindFramebuffer(render.gl.FRAMEBUFFER,null)
			}
		} else {
			if(update.vs_uni===undefined) update.vs_uni = {} ;
			if(update.fs_uni===undefined) update.fs_uni = {} ;
			mtx2[0].vs_uni.stereo = 0 ;
			update.fs_uni.rtime = time/1000 ;
			update.fs_uni.time = update.fs_uni.rtime
			update.vs_uni.rtime = time/1000 ;	
			update.vs_uni.time = update.vs_uni.rtime
			render.gl.viewport(0,0,can.width,can.height) ;
			render.draw([update,mtx2[0]],false) ;
		}
	}
}

//----------------------------------
//device dependent
enterVR() {
	let ret = true
	if(POXPDevice.VRReady) {
		console.log("enter VR")
		POXPDevice.presentVR(this)
	} else if(document.body.webkitRequestFullscreen) {
		console.log("fullscreen")
		const base = this.can.parentNode
		this.ssize = {width:base.offsetWidth,height:base.offsetHeight}
		document.addEventListener("webkitfullscreenchange",(ev)=>{
			if( document.webkitFullscreenElement) {
				base.style.width = window.innerWidth + "px"
				base.style.height = window.innerHeight + "px"				
			} else {
				base.style.width = this.ssize.width + "px"
				base.style.height = this.ssize.height + "px"					
			}
		})
		base.webkitRequestFullscreen()
	} else ret = false 
	return ret 
}
exitVR() {
	if(POXPDevice.VRReady) {
		POXPDevice.closeVR(this)
	}
}
setMouseEvent() {
	//set key capture dummy input
	const e = document.createElement("input") ;
	e.setAttribute("type","checkbox") ;
	e.style.position = "absolute" ; e.style.zIndex = -100 ;
	e.style.top = 0 ;e.style.left = "-20px"
	e.style.width = "10px" ; e.style.height ="10px" ; e.style.padding = 0 ; e.style.border = "none" ; e.style.opacity = 0 ;
	this.can.parentNode.appendChild(e) ;
	this.keyElelment = e ;
	this.keyElelment.focus() ;
	
	// mouse and key intaraction
	let dragging = false ;
	const Param = this.param ;
	const can = this.can ;

	//mouse intraction
	const m = new Pointer(can,{
		down:(d)=> {
			if(!this.ccam || Param.pause) return true ;
			let ret = true ;
			ret = this.callEvent("down",{x:d.x*this.pixRatio,y:d.y*this.pixRatio,sx:d.sx*this.pixRatio,sy:d.sy*this.pixRatio}) ;
			if(ret) this.ccam.event("down",d)
			dragging = true ;
			if(this.ccam.cam.camMode=="walk") this.keyElelment.focus() ;
			return false ;
		},
		move:(d)=> {
			if(!this.ccam || Param.pause) return true;
			let ret = true ;
			ret = this.callEvent("move",{x:d.x*this.pixRatio,y:d.y*this.pixRatio,ox:d.ox*this.pixRatio,oy:d.oy*this.pixRatio,dx:d.dx*this.pixRatio,dy:d.dy*this.pixRatio}) ;
			if(ret) this.ccam.event("move",d) 
			return false ;
		},
		up:(d)=> {
			if(!this.ccam) return true ;
			dragging = false ;
			let ret = true ;
			ret = this.callEvent("up",{x:d.x*this.pixRatio,y:d.y*this.pixRatio,dx:d.dx*this.pixRatio,dy:d.dy*this.pixRatio,ex:d.ex*this.pixRatio,ey:d.ey*this.pixRatio}) ;
			if(ret) this.ccam.event("up",d)
			return false ;
		},
		out:(d)=> {
			if(!this.ccam) return true ;
			dragging = false ;
			let ret = true ;
			ret = this.callEvent("out",{x:d.x*this.pixRatio,y:d.y*this.pixRatio,dx:d.dx*this.pixRatio,dy:d.dy*this.pixRatio}) ;
			if(ret) this.ccam.event("out",d) 
			return false ;
		},
		wheel:(d)=> {
			if(!this.ccam || Param.pause) return true;
			let ret = true ;
			ret = this.callEvent("wheel",d) ;
			if(ret) this.ccam.event("wheel",d) 
			return false ;
		},
		gesture:(z,r)=> {
			if(!this.ccam || Param.pause) return true;
			let ret = true ;
			ret = this.callEvent("gesture",{z:z,r:r}) ;
			if(ret) this.ccam.event("gesture",{z:z,r:r}) 
			return false ;
		},
		gyro:(ev)=> {
			if(!this.ccam || Param.pause || POXPDevice.VRReady ) return true;
			if(dragging) return true ;
			let ret = true ;
			ret = this.callEvent("gyro",ev) ;
			if(ret) this.ccam.event("gyro",ev) 
			return false ;
		}
	})
	WBind.addev(this.keyElelment,"keydown", (ev)=>{
//		console.log("key:"+ev.key);
		if( Param.pause) return true ;
		if(this.pox.event) {
			if(!this.callEvent("keydown",ev)) return true ;
		}
		if(this.ccam) this.ccam.event("keydown",ev) 
		return false ;
	})
	WBind.addev(this.keyElelment,"keyup", (ev)=>{
//		console.log("key up:"+ev.key);
		if(Param.pause) return true ;
		if(this.pox.event) {
			if(!this.callEvent("keyup",ev)) return true ;
		}
		if(this.ccam) this.ccam.event("keyup",ev)
		return false ;
	})		
	document.querySelectorAll("#bc button").forEach((o)=>{
		o.addEventListener("mousedown", (ev)=>{
			this.callEvent("btndown",ev.target.id) ;
			this.ccam.event("keydown",{key:ev.target.getAttribute("data-key")})
			ev.preventDefault()
		})
		o.addEventListener("touchstart", (ev)=>{
			this.callEvent("touchstart",ev.target.id) ;
			this.ccam.event("keydown",{key:ev.target.getAttribute("data-key")})
			ev.preventDefault()
		})
		o.addEventListener("mouseup", (ev)=>{
			this.callEvent("btnup",ev.target.id) ;
			this.ccam.event("keyup",{key:ev.target.getAttribute("data-key")})
			this.keyElelment.focus() ;
			ev.preventDefault()
		})
		o.addEventListener("touchend", (ev)=>{
			let ret = true; 
			ret = this.callEvent("touchend",ev.target.id) ;
			if(ret) this.ccam.event("keyup",{key:ev.target.getAttribute("data-key")})
			ev.preventDefault()
		})
	})

}
resize() {
//	console.log("wresize:"+document.body.offsetWidth+" x "+document.body.offsetHeight);
	if(this.can.offsetWidth < 300 || 
		(POXPDevice.isPresenting)) return 
	this.can.width= this.can.offsetWidth*this.pixRatio*window.devicePixelRatio  ;
	this.can.height = this.can.offsetHeight*this.pixRatio*window.devicePixelRatio  ;
//	console.log("canvas:"+this.can.width+" x "+this.can.height);		
}

} //class PoxPlayer

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
				navigator.xr.requestSession("immersive-vr",
				{optionalFeatures: [ 'hand-tracking' ]}).then((xrSession)=> {
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
}// poxplayercamera object
PoxPlayer.prototype.createCamera = function(cam) {
	return new this.Camera(this,cam) ;
}
PoxPlayer.prototype.Camera = class Camera {
constructor(poxp,cam) {
	this.poxp = poxp ;
	//camera initial
	this.cam = {
		camCX:0,
		camCY:0,
		camCZ:0,
		camVX:0,
		camVY:0,
		camVZ:1,
		camUPX:0,
		camUPY:1,
		camUPZ:0,
		camRX:30,
		camRY:-30,
		camRZ:0,
		camd:20,
		camAngle:90,	//cam angle(deg) 
		camWidth:1.0,
		camNear:0.01, 	//near
		camFar:1000, 	//far
		camGyro:true, // use gyro
		gPad:true, //use gpad
		sbase:0.06, 	//streobase 
		moveSpeed:1.3,		// m/sec
		rotAngle:30,
		moveY:false,
		padMoveUD:true,
		padRot:true,
		headVec:[0,0,0]	//head direction
	} ;
	for(let i in cam) {
		this.cam[i] = cam[i] ;
	}

	this.cama = false ; // on animation
	this.rotX = 0 ;
	this.rotY = 0 ;
	this.gev = null ;
	this.gx = 0 ; this.gy = 0 ; this.gz = 0 ;
	this.vcx = 0 ;this.vcy = 0 ; this.vcz=0
	this.vrx = 0 ;this.vry = 0 ; this.vrz=0
	this.keydown = false ;
	this.vr = false ;
	this.camVP = [new CanvasMatrix4(),new CanvasMatrix4()]
	this.camP =  [new CanvasMatrix4(),new CanvasMatrix4()]
	this.camV =  [new CanvasMatrix4(),new CanvasMatrix4()]
	this.vrv =  [new CanvasMatrix4(),new CanvasMatrix4()]
	this.vrp =  [new CanvasMatrix4(),new CanvasMatrix4()]
	this.tempM =  new CanvasMatrix4()
	this.pvy = false 
	this.pvx = false 
//	if(window.VRFrameData!=undefined) this.vrFrame = new VRFrameData()
}
setCam(cam) {
	for(let i in cam) {
		this.cam[i] = cam[i] ;
	}
	this.cama = false 
}
getCam() {
	const ret = {
		basePos:[this.cam.camCX,this.cam.camCY,this.cam.camCZ],
		baseRot:[this.cam.camRX,this.cam.camRY,this.cam.camRZ],
		position:Array.from(this.cam.campos),
		headVec:Array.from(this.cam.headVec),
	}
	if(this.cam.orientation) ret.headOri = Array.from(this.cam.orientation)
	else ret.headOri = [0,0,0,1]
	if(this.cam.position) ret.headPos = Array.from(this.cam.position)
	else ret.headPos = [0,0,0]
	return ret 
}
vrchange(f) {
	if(f) {
		this.cam.camRX = 0
		this.cam.camRZ = 0
	}
}
event(ev,m) {
	const mag = 300*this.poxp.pixRatio /this.poxp.can.width;
	const scale = (this.poxp.pox.setting && this.poxp.pox.setting.scale)? this.poxp.pox.setting.scale :1 ;

//	console.log("cam "+ev+" key:"+m.key)
	switch(ev) {
		case "down":
			this.rotX = this.cam.camRX
			this.rotY = this.cam.camRY
			break ;
		case "move":
			this.cam.camRX = this.rotX+m.dy*mag ;
			this.cam.camRY = this.rotY+m.dx*mag ;
			if(this.cam.camRX>89)this.cam.camRX=89;
			if(this.cam.camRX<-89)this.cam.camRX=-89;
			break ;
		case "up":
			this.rotX += m.dy*mag ;
			this.rotY += m.dx*mag; 
			if(this.gev!==null) {
				this.gx = this.gev.rx - this.rotX ;
				this.gy = this.gev.ry - this.rotY ;
//				console.log(this.gx+"/"+this.gy) ;
			}
			break ;
		case "out":
			this.rotX += m.dy*mag ;
			this.rotY += m.dx*mag; 
			break ;	
		case "wheel":
			this.cam.camd += m/100 * scale ;
			break ;	
		case "gesture":
			if(m.z==0) {
				this.gz = this.cam.camd ; 
				return false ;
			}
			this.cam.camd = this.gz / m.z ;
			break ;	
		case "gyro":
//		console.log(m)
			if(this.keydown || !this.cam.camGyro) return true ;
			if(m.rx===null) return true ;
			this.gev = m ;
			this.cam.camRX = m.rx - this.gx;
			this.cam.camRY = m.ry - this.gy ;
//		console.log(gx+"/"+gy) ;
			if(this.cam.camRX>89)this.cam.camRX=89 ;
			if(this.cam.camRX<-89)this.cam.camRX=-89 ;
			break ;
		case "keydown":
			const z = this.cam.camd ;
			const keymag= this.cam.moveSpeed ;
			let md = "" ;
			this.keydown = true ;
			if(m.altKey) {
				switch(m.key) {
					case "ArrowUp":this.cam.camd = this.cam.camd - keymag; if(this.cam.camd<0) cthis.am.camd = 0 ; break ;
					case "ArrowDown":this.cam.camd = this.cam.camd + keymag ; break ;
				}				
			} else {
				switch(m.key) {
					case "ArrowLeft":
					case "Left":
					case "h":
						this.vry = -keymag ;
						break ;
					case "ArrowUp":
					case "Up":
					case "k":
						this.vrx = -keymag ;
						break ;
					case "ArrowRight":
					case "Right":
					case "l":
						this.vry = keymag ;
						break ;
					case "ArrowDown":
					case "Down":
					case "j":
						this.vrx = keymag ;
						break ;
				
					case "w":
						md = "f" ; break ;
					case "s":
						md = "b" ;break ;
					case "a":
						md = "l" ;break ;
					case "d":
						md = "r" ;break ;	
					case "q":
						md = "u" ;break ;
					case "e":
						md = "d" ;break ;
				}
			}
			if(md!="") {
				const dir = ((md=="b"||md=="d")?-1:1)*keymag*scale 
				const cam = this.cam ;
				if(md=="u"||md=="d") {
					this.vcy = dir ;
				} else {
					let ry = cam.camRY ;
					if(md=="l") ry = ry -90 ;
					if(md=="r") ry = ry +90 ;
					this.vcx =  Math.sin(ry*RAD) *dir ;
					this.vcz = -Math.cos(ry*RAD)* dir ;						
				}
			}
			break ;
		case "keyup":
			this.keydown = false ;
			if(this.gev!==null) {
				this.gx = this.gev.rx - this.cam.camRX ;
				this.gy = this.gev.ry - this.cam.camRY ;
//				console.log(this.gx+"/"+this.gy) ;
			}
			switch(m.key) {
				case "ArrowLeft":
				case "Left":
				case "h":
				case "ArrowRight":
				case "Right":
				case "l":
					this.vry = 0 ; break ;
				case "ArrowUp":
				case "Up":
				case "k":
				case "ArrowDown":
				case "Down":
				case "j":
					this.vrx = 0  ; break ;
				case "w":
				case "d":
				case "a":
				case "s":
				case " ":
					this.vcx = 0 ; this.vcz = 0 ; break ;
				case "q":
				case "e":
					this.vcy = 0 ;break ;
				case "Dead": //mobile safari no keyup key
					this.vrx = 0 ; this.vry = 0 ; this.vcx = 0 ; this.vcz = 0 ; 
					break ;
			}			
			break ;	
		}
}
update(time) {
	const ft = (this.poxp.ctime - this.poxp.ltime)/1000
//console.log(ft)
	if(this.cam.camMode!="fix") {
		this.cam.camRX += this.vrx ;
		if(this.cam.camRX<-89) this.cam.camRX = -89 ; 
		if(this.cam.camRX>89) this.cam.camRX = 89 ; 
		this.cam.camRY += this.vry ;
	}
	if(this.cam.camMode=="walk") {
		if(!this.cama) {
			this.cam.camCX += this.vcx *ft ;
			this.cam.camCY += this.vcy *ft ;
			this.cam.camCZ += this.vcz *ft ;
		}
		this.cam.camRY += this.vry *ft ;
	}
	if(this.cama) {
		this.cam.camCX += this.acx *ft ;
		this.cam.camCY += this.acy *ft ;
		this.cam.camCZ += this.acz *ft ;	
		this.ad += this.av * ft 
		if( this.ad > this.al ) {
			this.cam.camCX = this.aex
			this.cam.camCY = this.aey
			this.cam.camCZ = this.aez
			this.cama = false 
		}
	}
}
setPad(gpad,gpad2) {
	let gp = gpad?gpad:gpad2
	if(!gp) return 
	if(this.cam.camMode=="walk") {
		let axes = [gp.axes[0],gp.axes[1]]
		if(gp.axes[2]!=undefined && gp.axes[2]!=0) axes[0] = gp.axes[2]
		if(gp.axes[3]!=undefined && gp.axes[3]!=0) axes[1] = gp.axes[3]
		if(this.cam.padMoveUD && gp.buttons[1] && gp.buttons[1].pressed) {
			this.vcy = -axes[1]*this.cam.moveSpeed
			this.pvy = true ;
			return
		} else if(this.pvy) {
			this.vcy = 0 
			this.pvy = false
		}
		let m = gp.buttons[2] && gp.buttons[2].pressed
		let mv = (m)?this.cam.moveSpeed*5:this.cam.moveSpeed
		if(Math.abs(axes[0])<Math.abs(axes[1]) && Math.abs(axes[1])>0 ) {
				this.vcx = -this.cam.headVec[0] * axes[1]*mv
				if(this.cam.moveY) this.vcy = -this.cam.headVec[1] * axes[1]*mv
				this.vcz = -this.cam.headVec[2] * axes[1]*mv
				this.pvx = true
				return 
		} else if(this.pvx) {		
				this.vcx = 0 
				this.vcy = 0
				this.vcz = 0 
				this.pvx = false 
		}
		if(this.cam.padRot && gp.dpad[0]>0) {
			let rot = ((axes[0]>0)?1:-1) * this.cam.rotAngle
			this.cam.camRY += rot
			if(false && this.cam.position) {
				let th = rot * RAD 
				this.cam.camCX += Math.cos(th)*this.cam.position[0]+ Math.sin(th)*this.cam.position[2]
				this.cam.camCZ += -Math.sin(th)*this.cam.position[0]+ Math.cos(th)*this.cam.position[2]
				console.log(Math.cos(th)*this.cam.position[0]+ Math.sin(th)*this.cam.position[2]
				,-Math.sin(th)*this.cam.position[0]+ Math.cos(th)*this.cam.position[2])
			}
		}
	}
}
moveTo(x,y,z,opt) {
	if(this.cama) return 
	let cx = (x!==null)?x:this.cam.camCX
	let cy = (y!==null)?y:this.cam.camCY
	let cz = (z!==null)?z:this.cam.camCZ 
	if(opt && opt.velocity) {
		let vx = cx - this.cam.camCX 
		let vy = cy - this.cam.camCY 
		let vz = cz - this.cam.camCZ
		let l = opt.velocity / Math.hypot(vx,vy,vz)
		vx *= l , vy *= l, vz *= l
		this.acx = vx 
		this.acy = vy
		this.acz = vz
		this.aex = cx 
		this.aey = cy 
		this.aez = cz
		this.al = opt.velocity/l
		this.ad = 0 
		this.av = opt.velocity 
		this.cama = true 
	} else {
		this.cam.camCX = cx 
		this.cam.camCY = cy 
		this.cam.camCZ = cz 
		this.cama = false 
	}
}
moveCancel() {
	this.cama = false 
}
getMtx(scale,sf) {
	const cam = this.cam ;
	const can = this.poxp.render.wwg.can ;

	const aspect = can.width/(can.height*((sf)?2:1)) ;
	const cams = [];
//console.log(cam);
//console.log(cam.camRX+"/"+cam.camRY) ;
	let cx,cy,cz,ex,ey,ez,upx,upy,upz,camd ;
	let vrFrame = null
	upx = cam.camUPX ;
	upy = cam.camUPY ;
	upz = cam.camUPZ ;	
	ex =[0,0], ey=[0,0],ez=[0,0] ;
	if(!this.poxp.isVR) {
		if(cam.camMode=="fix") {
			cx = cam.camVX ;
			cy = cam.camVY ;
			cz = cam.camVZ ;
			this.cam.headVec = [cx,cy,cz,0]
		}
		else if(cam.camMode=="vr" || cam.camMode=="walk") {
			// self camera mode 
			cx = cam.camCX + Math.sin(cam.camRY*RAD)*1*Math.cos(cam.camRX*RAD)
			cy = cam.camCY + -Math.sin(cam.camRX*RAD)*1 ; 
			cz = cam.camCZ + -Math.cos(cam.camRY*RAD)*1*Math.cos(cam.camRX*RAD)	
			let cmat = new Mat4().rotate(-this.cam.camRX,1,0,0).rotate(-this.cam.camRY,0,1,0).rotate(-this.cam.camRZ,0,0,1)
			upx = -Math.sin(cam.camRZ*RAD)
			upy = Math.cos(cam.camRZ*RAD)
			this.cam.headVec = cmat.multVec4(0,0,-1,0)
		} else  {
		// bird camera mode 
			camd=  cam.camd*scale ;
			cam.camCX  = -Math.sin(cam.camRY*RAD)*camd*Math.cos(cam.camRX*RAD)
			cam.camCY = Math.sin(cam.camRX*RAD)*camd ; 
			cam.camCZ = Math.cos(cam.camRY*RAD)*camd*Math.cos(cam.camRX*RAD)
			cx = 0 ,cy = 0, cz = 0 ;
			if(camd<0) {
				cx = cam.camCX*2 ;cy = cam.camCY*2 ;cz = cam.camCZ*2 ;
			}
			let l = Math.hypot(cam.camCX,cam.camCY,cam.camCZ)
			this.cam.headVec = [-cam.camCX/l,-cam.camCY/l,-cam.camCZ/l,0] 
		}
		this.cam.campos = [cam.camCX,cam.camCY,cam.camCZ]

		this.camVP[0].makeIdentity()
		this.camVP[1].makeIdentity()
		this.camP[0].makeIdentity()
		this.camP[1].makeIdentity()
		this.camV[0].makeIdentity()
		this.camV[1].makeIdentity()
			
		if(sf) {		// for stereo
			const dx = -cam.sbase * scale ;	// stereo base
			ex[0] =  upy * (cam.camCZ-cz) - upz * (cam.camCY-cy);
			ey[0] = -upx * (cam.camCZ-cz) + upz * (cam.camCX-cx);
			ez[0] =  upx * (cam.camCY-cy) - upy * (cam.camCX-cx);
			const mag = Math.hypot(ex[0],ey[0],ez[0]);
			ex[0] *= dx/mag ; ey[0] *=dx/mag ; ez[0] *= dx/mag ;
			ex[1] = -ex[0] ; ey[1] = -ey[0] ; ez[1] = -ez[0] ;
	//			console.log(dx+":"+xx+"/"+xy+"/"+xz)
			this.camV[0].lookat(ex[0]+cam.camCX, ey[0]+cam.camCY, ez[0]+cam.camCZ, cx+ex[0], cy+ey[0], cz+ez[0], upx,upy,upz) ;
			this.camV[1].lookat(ex[1]+cam.camCX, ey[1]+cam.camCY, ez[1]+cam.camCZ, cx+ex[1], cy+ey[1], cz+ez[1], upx,upy,upz) ;

			if(cam.camAngle!=0) this.camP[0].perspective(cam.camAngle,aspect, cam.camNear, cam.camFar)
			else this.camP[0].pallarel(cam.camd,aspect, cam.camNear, cam.camFar) ;
			this.camP[1] = this.camP[0]
			this.camVP[0].load(this.camV[0]).multRight(this.camP[0])
			this.camVP[1].load(this.camV[1]).multRight(this.camP[1])
		} else {
			this.camV[0].lookat(cam.camCX, cam.camCY, cam.camCZ, cx, cy, cz, upx,upy,upz) ;
			if(cam.camAngle!=0) this.camP[0].perspective(cam.camAngle,aspect, cam.camNear, cam.camFar)
			else this.camP[0].pallarel(cam.camd,aspect, cam.camNear, cam.camFar) ;
			this.camVP[0].load(this.camV[0]).multRight(this.camP[0])
		}
	}
	if(this.poxp.isVR) {
		
		POXPDevice.setDepth({camNear:cam.camNear,camFar:cam.camFar})

		vrFrame = POXPDevice.getFrameData()
//		console.log(vrFrame)
		if(!vrFrame) return 
		this.cam.orientation = vrFrame.pose.orientation
		this.cam.position = vrFrame.pose.position
		if(!this.cam.position) this.cam.position = [0,0,0]
		this.vrv[1].load(vrFrame.rightViewMatrix)
		this.vrv[0].load(vrFrame.leftViewMatrix)
		this.vrp[1].load(vrFrame.rightProjectionMatrix)
		this.vrp[0].load(vrFrame.leftProjectionMatrix)
 
		this.tempM.makeIdentity()
			.translate(-cam.camCX,-cam.camCY,-cam.camCZ)
			.rotate(cam.camRX,1,0,0)
			.rotate(cam.camRY,0,1,0)
			.rotate(cam.camRZ,0,0,1)

		this.camV[0].load(this.vrv[0])
		if(this.leftCorrMtx) this.camV[0].multRight(this.leftCorrMtx)
		this.camV[0].multLeft( this.tempM )
		this.camVP[0].load(this.camV[0]).multRight(this.vrp[0]) 
		this.camP[0].load(this.vrp[0])
		
		this.camV[1].load(this.vrv[1])
		if(this.rightCorrMtx) this.camV[1].multRight(this.rightCorrMtx)
		this.camV[1].multLeft( this.tempM )
		this.camVP[1].load(this.camV[1]).multRight(this.vrp[1]) 
		this.camP[1].load(this.vrp[1])
		
		let cx =0,cy =0,cz=1
		if(this.cam.orientation ) {
			let x = this.cam.orientation[0] ;
			let y = this.cam.orientation[1] ;
			let z = this.cam.orientation[2] ;
			let w = this.cam.orientation[3] ;
			cx = 2*(-x*z-y*w) 
			cy = 2*(-y*z+x*w)
			cz = (x*x+y*y-z*z-w*w)
			let l = Math.hypot(cx,cy,cz)
			cx /= l ,cy /=l, cz /= l 
		}
		this.tempM.invert() 
//		let cmat = new Mat4().rotate(-this.cam.camRX,1,0,0).rotate(-this.cam.camRY,0,1,0)
//		cmat.translate(cam.camCX,cam.camCY,cam.camCZ)
		let cmat = this.tempM 
		this.cam.headVec = cmat.multVec4(cx,cy,cz,0)
		this.cam.campos = cmat.multVec4(this.cam.position[0],this.cam.position[1],this.cam.position[2],1).slice(0,3)

		let ivr = new Mat4().load(this.camV[1]).invert() ;
		let ivl = new Mat4().load(this.camV[0]).invert() ;
		ex[0] = ivl.buf[12] -cam.camCX
		ey[0] = ivl.buf[13] -cam.camCY
		ez[0] = ivl.buf[14] -cam.camCZ 
		ex[1] = ivr.buf[12] -cam.camCX
		ey[1] = ivr.buf[13] -cam.camCY
		ez[1] = ivr.buf[14] -cam.camCZ
	}
//	console.log(camVP)
	return [{camX:cam.camCX+ex[0],camY:cam.camCY+ey[0],camZ:cam.camCZ+ez[0], 
		camV:this.camV[0],camVP:this.camVP[0],camP:this.camP[0], vrFrame:vrFrame},
	{camX:cam.camCX+ex[1],camY:cam.camCY+ey[1],camZ:cam.camCZ+ez[1],
		camV:this.camV[1],camVP:this.camVP[1],camP:this.camP[1],vrFrame:vrFrame}] ;
}
} // class Camera
//utils
//console panel

class Cpanel {
constructor(render,opt) {
	this.hide = false 
	if(!opt) opt = {}
	if(opt.width===undefined) opt.width = 100 
	if(opt.height===undefined) opt.height = 50 
	if(opt.font===undefined) opt.font = "10px monospace"
	if(opt.color===undefined) opt.color = "red" 
	if(opt.lines===undefined) opt.lines = 5
	if(opt.lheight===undefined) opt.lheight = 10
	if(opt.ry===undefined) opt.ry = 40 
	if(opt.pos===undefined) opt.pos = [-0.2,0.2,-0.8]
	if(opt.camFix===undefined) opt.camFix = true 

	this.pcanvas = document.createElement('canvas') ;
	this.pcanvas.width = opt.width ;
	this.pcanvas.height = opt.height ;	
	this.j2c = new json2canvas(this.pcanvas)
	this.j2c.default.font = opt.font
	this.j2c.default.textColor = opt.color
	this.clearColor = opt.clearColor 
	this.ctx = this.j2c.ctx

	this.dd = []
	let y = opt.lheight 
	for(let i=0;i<opt.lines;i++,y+=opt.lheight) 
		this.dd.push({shape:"text",str:"",x:0,y:y,width:opt.width})
	this.j2c.draw(this.dd)

	this.id = new Date().getTime()+Math.floor(Math.random()*1000)
		
	const ptex = {name:"cpanel"+this.id,canvas:this.pcanvas,opt:{flevel:1,repeat:2,nomipmap:true}}
	render.addTex(ptex) 
	this.model = 
		{name:"panel"+this.id,
			geo:new WWModel().primitive("plane",{wx:opt.width/1000,wy:opt.height/1000
		}).objModel(),
			camFix:opt.camFix,layer:opt.layer,
			bm:new CanvasMatrix4().rotate(opt.ry,0,1,0).translate(opt.pos),
			blend:"alpha",
			vs_uni:{uvMatrix:[1,0,0, 0,1,0, 0,0,0]},
			fs_uni:{tex1:"cpanel"+this.id,colmode:2,shmode:1}
		}
	render.addModel(this.model)
}
show(flag) {
	this.hide = !flag 
	this.model.hide = this.hide 
}
update(render,text) {
	if(this.hide) return 
	this.j2c.clear(this.clearColor)
	for(let i=0;i<text.length;i++) 
		if(text[i]!==null) this.dd[i].str = text[i]
	this.j2c.draw(this.dd)
	render.updateTex("cpanel"+this.id,this.pcanvas)	
}
}

// controller beam
class Beam {
constructor(render) {
	this.len = 200
	this.color = [1,1,0,1]
	this.cofs = [0.3,-0.5,0.2]
	this.vs = this.cofs.slice(0)
	this.ve = [this.len/2,this.len/2,-this.len]
	this.bv = [0,0,-1]

	render.addModel(
		{name:"beam",
		geo:{mode:"lines",
			vtx_at:["position"],
			vtx:this.vs.concat(this.ve)},
			fs_uni:{colmode:0,shmode:1,bcolor:this.color}}
	)
}
update(render,cam) {
	let bm = render.getModelData("beam")
	let vd = bm.geo.vtx
	let gp = POX.poxp.gPad
	if(gp && gp.pose) {
		this.ori=gp.pose.orientation
		let sx = this.cofs[0] * ((gp.hand=="right")?1:-1)
		let sy = this.cofs[1]
		let sz = this.cofs[2]
		let cq = Mat4.v2q(-cam.camRY,0,1,0) 
		let bm = new Mat4().q2m(
			Mat4.qMult(cq,this.ori) )
		bm.translate(cam.camCX,cam.camCY,cam.camCZ)
		this.vs = bm.multVec4(sx,0,sz,1)
		this.vs[1] = sy + cam.camCY
		this.ve = bm.multVec4(0,0,-this.len,1)
		this.bv = Mat4.V3norm(Mat4.V3sub(this.ve,this.vs))
		vd[0]=this.vs[0],vd[1]=this.vs[1],vd[2]=this.vs[2]
		vd[3]=this.ve[0],vd[4]=this.ve[1],vd[5]=this.ve[2]
		render.updateModel("beam","vbo",vd)
	}	
}
}

class Pool  {
	constructor() {
		this._use = [] 
		this._free = [] 
	}
	CreateInstance() {
		return {} 
	}
	InitInstance(obj) {
		return obj
	}
	Rent() {
		let obj 
		if(this._free.length>0) {
			obj = this._free[this._free.length-1]
			this._free.pop() 
		} else {
			obj = this.CreateInstance()
		}
		this.InitInstance(obj)
		this._use.push(obj)
		return obj
	}
	Return(obj) {
		for(let i in this._use) {
			if(this._use[i]===obj) {
				this._use.splice(i,1)
				break 
			}
		}
		this._free.push(obj)
	}
	Alloc(num) {
		for(let i=0;i<num;i++) this._free.push(this.CreateInstance())
	}
	GetInstances() {
		return this._use 
	}
}
