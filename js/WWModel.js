//Model library for WWG
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
