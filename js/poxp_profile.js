class PoxProfile {
	constructor(poxp) {
		this.poxp = poxp 
	}
	log(...args) {
		for(let m of args) {
			this.poxp.pox.log(m)
		}
	}
	lognow() {
		let dt = new Date() 
		this.poxp.pox.log("["+dt.toLocaleTimeString()+"."+("00"+dt.getUTCMilliseconds().toString()).substr(-3)+"]")
	}
	dumpobj(o,lv=1) {
		let ret  = o
		if(lv==0)return ret 
		if(Array.isArray(o)) ret =  "["+o.join(",")+"]"
		else if(typeof o == "object") {
			ret = "{"
			for(let k in o) {
				ret += k+":"+this.dumpobj(o[k],lv-1)+","
			}
			ret += "}"
		}
		return ret 
	}
	logobj(o,level=1) {
		this.log(this.dumpobj(o,level))
	}
	dumpModels() {
		this.lognow()
		const models = this.poxp.render.data.model
		for(let m of models) {
			this.log(
				"id:"+m.id,
				"  name:"+m.name,
				"  mode:"+m.geo.mode,
				"  vtx:"+m.geo.vtx.length/m.obuf.tl)
			if(m.geo.idx) this.log(
				"  idx:"+m.geo.idx?.length)
			if(m.inst) this.log(
				"  inst:"+m.inst.count)
		}
	}

	dumpModelUni(model) {
		const d = this.poxp.pox.getModelData(model)
		if(!d) return 
		this.lognow()
		this.log("vs_uni")
		for(let i in d.vs_uni) {
			this.log("  "+i+" = "+d.vs_uni[i])
		}
		this.log("fs_uni")
		for(let i in d.fs_uni) {
			this.log("  "+i+" = "+d.fs_uni[i])
		}
	}
}