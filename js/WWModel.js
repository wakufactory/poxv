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
	let ninv = (param.ninv)?-1:1 ;
	let p = [] ;
	let n = [] ;
	let t = [] ;
	let s = [] ;
	let PHI = Math.PI *2 ;
		let m = { "r05":{"v":[[-0.52573111,-0.7236068,0.4472136],[-0.85065081,0.2763932,0.4472136],[-0,0.89442719,0.4472136],[0.85065081,0.2763932,0.4472136],[0.52573111,-0.7236068,0.4472136],[0,-0.89442719,-0.4472136],[-0.85065081,-0.2763932,-0.4472136],[-0.52573111,0.7236068,-0.4472136],[0.52573111,0.7236068,-0.4472136],[0.85065081,-0.2763932,-0.4472136],[0,0,1],[-0,0,-1]],"s":[[0,1,6],[0,6,5],[0,5,4],[0,4,10],[0,10,1],[1,2,7],[1,7,6],[1,10,2],[2,3,8],[2,8,7],[2,10,3],[3,4,9],[3,9,8],[3,10,4],[4,5,9],[5,6,11],[5,11,9],[6,7,11],[7,8,11],[8,9,11]]},
		"r04":{"v":[[-0.35682209,-0.49112347,0.79465447],[0.35682209,-0.49112347,0.79465447],[0.57735027,-0.79465447,0.18759247],[0,-0.98224695,-0.18759247],[-0.57735027,-0.79465447,0.18759247],[-0.57735027,0.18759247,0.79465447],[0.57735027,0.18759247,0.79465447],[0.93417236,-0.303531,-0.18759247],[-0,-0.607062,-0.79465447],[-0.93417236,-0.303531,-0.18759247],[-0.93417236,0.303531,0.18759247],[0,0.607062,0.79465447],[0.93417236,0.303531,0.18759247],[0.57735027,-0.18759247,-0.79465447],[-0.57735027,-0.18759247,-0.79465447],[-0.57735027,0.79465447,-0.18759247],[0,0.98224695,0.18759247],[0.57735027,0.79465447,-0.18759247],[0.35682209,0.49112347,-0.79465447],[-0.35682209,0.49112347,-0.79465447]],"s":[[0,1,6,11,5],[0,5,10,9,4],[0,4,3,2,1],[1,2,7,12,6],[2,3,8,13,7],[3,4,9,14,8],[5,11,16,15,10],[6,12,17,16,11],[7,13,18,17,12],[8,14,19,18,13],[9,10,15,19,14],[15,16,17,18,19]]},
		"r03":{"v":[[-0.57735027,-0.57735027,0.57735027],[-0.57735027,0.57735027,0.57735027],[0.57735027,0.57735027,0.57735027],[0.57735027,-0.57735027,0.57735027],[-0.57735027,-0.57735027,-0.57735027],[-0.57735027,0.57735027,-0.57735027],[0.57735027,0.57735027,-0.57735027],[0.57735027,-0.57735027,-0.57735027]],"s":[[0,1,5,4],[0,4,7,3],[0,3,2,1],[1,2,6,5],[2,3,7,6],[4,5,6,7]]},
		"r02":{"v":[[-0.70710678,-0.70710678,0],[-0.70710678,0.70710678,0],[0.70710678,0.70710678,0],[0.70710678,-0.70710678,0],[0,0,-1],[0,0,1]],"s":[[0,1,4],[0,4,3],[0,3,5],[0,5,1],[1,2,4],[1,5,2],[2,3,4],[2,5,3]]},
		"r01":{"v":[[-0.81649658,-0.47140452,0.33333333],[0.81649658,-0.47140452,0.33333333],[0,0,-1],[0,0.94280904,0.33333333]],"s":[[0,1,3],[0,3,2],[0,2,1],[1,2,3]]},
		"s11":{"v":[[-0.13149606,-0.40470333,0.90494412],[-0.34426119,-0.25012042,0.90494412],[-0.42553024,-1.0e-8,0.90494412],[-0.34426119,0.2501204,0.90494412],[-0.13149606,0.40470332,0.90494412],[0.13149611,0.40470332,0.90494412],[0.34426124,0.2501204,0.90494412],[0.42553028,-1.0e-8,0.90494412],[0.34426124,-0.25012042,0.90494412],[0.13149611,-0.40470333,0.90494412],[-0.13149606,-0.62841783,0.76668096],[-0.34426119,-0.69754941,0.6284178],[-0.42553024,-0.80940666,0.4047033],[-0.34426119,-0.92126391,0.18098881],[-0.13149606,-0.99039549,0.04272564],[0.13149611,-0.99039549,0.04272564],[0.34426124,-0.92126391,0.18098881],[0.42553028,-0.80940666,0.4047033],[0.34426124,-0.69754941,0.6284178],[0.13149611,-0.62841783,0.76668096],[-0.55702632,-0.5429665,0.6284178],[-0.55702632,-0.319252,0.76668096],[-0.63829537,-0.06913159,0.76668096],[-0.76979145,0.11185724,0.6284178],[-0.90128753,0.15458291,0.4047033],[-0.98255658,0.04272566,0.1809888],[-0.98255658,-0.18098884,0.04272564],[-0.90128753,-0.43110925,0.04272564],[-0.76979145,-0.61209808,0.18098881],[-0.63829537,-0.65482375,0.4047033],[-0.82001848,0.54296648,0.18098881],[-0.82001848,0.40470332,0.4047033],[-0.6885224,0.36197765,0.6284178],[-0.47575727,0.43110923,0.76668096],[-0.26299214,0.58569215,0.76668096],[-0.13149606,0.76668098,0.6284178],[-0.13149606,0.90494414,0.4047033],[-0.26299214,0.94766981,0.18098881],[-0.47575727,0.87853823,0.04272564],[-0.6885224,0.72395531,0.04272564],[0.47575732,0.87853821,0.04272564],[0.26299219,0.94766979,0.1809888],[0.13149611,0.90494413,0.4047033],[0.13149611,0.76668098,0.6284178],[0.26299219,0.58569215,0.76668096],[0.47575732,0.43110923,0.76668096],[0.68852245,0.36197765,0.6284178],[0.82001853,0.4047033,0.40470331],[0.82001853,0.54296646,0.18098881],[0.68852245,0.72395529,0.04272564],[0.63829541,-0.65482375,0.4047033],[0.7697915,-0.61209808,0.18098881],[0.90128758,-0.43110925,0.04272564],[0.98255663,-0.18098884,0.04272564],[0.98255647,0.04272561,0.18098879],[0.9012875,0.15458288,0.40470331],[0.7697915,0.11185724,0.6284178],[0.63829541,-0.06913159,0.76668096],[0.55702637,-0.319252,0.76668096],[0.55702637,-0.5429665,0.6284178],[-0.47575727,-0.87853824,-0.04272569],[-0.6885224,-0.72395533,-0.04272569],[-0.82001848,-0.5429665,-0.18098886],[-0.82001848,-0.40470333,-0.40470335],[-0.6885224,-0.36197767,-0.62841785],[-0.47575727,-0.43110925,-0.76668101],[-0.26299214,-0.58569216,-0.76668101],[-0.13149605,-0.76668099,-0.62841784],[-0.13149606,-0.90494416,-0.40470335],[-0.26299214,-0.94766982,-0.18098885],[-0.90128753,-0.15458292,-0.40470335],[-0.98255658,-0.04272567,-0.18098885],[-0.98255658,0.18098882,-0.04272569],[-0.90128753,0.43110923,-0.04272569],[-0.76979145,0.61209806,-0.18098885],[-0.63829536,0.65482373,-0.40470335],[-0.55702632,0.54296648,-0.62841785],[-0.55702632,0.31925199,-0.76668101],[-0.63829537,0.06913157,-0.76668101],[-0.76979145,-0.11185726,-0.62841785],[-0.13149606,0.62841781,-0.76668101],[-0.34426119,0.6975494,-0.62841785],[-0.42553023,0.80940665,-0.40470335],[-0.34426119,0.92126389,-0.18098885],[-0.13149606,0.99039547,-0.04272569],[0.13149611,0.99039546,-0.04272569],[0.34426124,0.92126387,-0.18098886],[0.42553028,0.80940661,-0.40470335],[0.34426124,0.69754939,-0.62841785],[0.13149611,0.62841781,-0.76668101],[0.76979153,-0.11185725,-0.62841782],[0.63829541,0.06913155,-0.76668097],[0.55702634,0.31925197,-0.76668097],[0.55702635,0.54296649,-0.62841782],[0.63829541,0.6548237,-0.40470335],[0.76979149,0.61209803,-0.18098885],[0.9012875,0.43110919,-0.04272571],[0.98255648,0.18098877,-0.04272572],[0.9825564,-0.04272561,-0.18098874],[0.90128711,-0.15458281,-0.4047032],[0.26299219,-0.94766982,-0.18098885],[0.13149611,-0.90494416,-0.40470335],[0.13149611,-0.76668098,-0.62841784],[0.26299219,-0.58569215,-0.76668099],[0.47575682,-0.43110886,-0.76668009],[0.68852237,-0.36197738,-0.6284173],[0.82001805,-0.40470325,-0.40470322],[0.82001853,-0.5429665,-0.18098885],[0.68852245,-0.72395533,-0.04272569],[0.47575732,-0.87853824,-0.04272569],[-0.13149606,-0.40470333,-0.90494417],[-0.34426119,-0.25012042,-0.90494417],[-0.42553024,-0,-0.90494417],[-0.34426119,0.2501204,-0.90494417],[-0.13149606,0.40470332,-0.90494417],[0.13149611,0.40470332,-0.90494417],[0.3442612,0.25012038,-0.90494414],[0.42553027,-3.0e-8,-0.90494414],[0.3442606,-0.25012001,-0.90494332],[0.13149611,-0.40470332,-0.90494416]],"s":[[0,1,21,20,11,10],[0,10,19,9],[0,9,8,7,6,5,4,3,2,1],[1,2,22,21],[2,3,33,32,23,22],[3,4,34,33],[4,5,44,43,35,34],[5,6,45,44],[6,7,57,56,46,45],[7,8,58,57],[8,9,19,18,59,58],[10,11,12,13,14,15,16,17,18,19],[11,20,29,12],[12,29,28,61,60,13],[13,60,69,14],[14,69,68,101,100,15],[15,100,109,16],[16,109,108,51,50,17],[17,50,59,18],[20,21,22,23,24,25,26,27,28,29],[23,32,31,24],[24,31,30,73,72,25],[25,72,71,26],[26,71,70,63,62,27],[27,62,61,28],[30,31,32,33,34,35,36,37,38,39],[30,39,74,73],[35,43,42,36],[36,42,41,85,84,37],[37,84,83,38],[38,83,82,75,74,39],[40,41,42,43,44,45,46,47,48,49],[40,49,95,94,87,86],[40,86,85,41],[46,56,55,47],[47,55,54,97,96,48],[48,96,95,49],[50,51,52,53,54,55,56,57,58,59],[51,108,107,52],[52,107,106,99,98,53],[53,98,97,54],[60,61,62,63,64,65,66,67,68,69],[63,70,79,64],[64,79,78,112,111,65],[65,111,110,66],[66,110,119,103,102,67],[67,102,101,68],[70,71,72,73,74,75,76,77,78,79],[75,82,81,76],[76,81,80,114,113,77],[77,113,112,78],[80,81,82,83,84,85,86,87,88,89],[80,89,115,114],[87,94,93,88],[88,93,92,116,115,89],[90,91,92,93,94,95,96,97,98,99],[90,99,106,105],[90,105,104,118,117,91],[91,117,116,92],[100,101,102,103,104,105,106,107,108,109],[103,119,118,104],[110,111,112,113,114,115,116,117,118,119]]},
		"s06":{"v":[[-0.20177411,-0.27771823,0.93923362],[-0.40354821,-0.55543646,0.72707577],[-0.20177411,-0.8331547,0.51491792],[0.20177411,-0.8331547,0.51491792],[0.40354821,-0.55543646,0.72707577],[0.20177411,-0.27771823,0.93923362],[-0.32647736,0.10607893,0.93923362],[-0.65295472,0.21215785,0.72707577],[-0.85472883,-0.06556038,0.51491792],[-0.73002557,-0.44935754,0.51491792],[-0.73002557,-0.66151539,0.17163931],[-0.40354821,-0.89871508,0.17163931],[-0.20177411,-0.96427546,-0.17163931],[0.20177411,-0.96427546,-0.17163931],[0.40354821,-0.89871508,0.17163931],[0.73002557,-0.66151539,0.17163931],[0.73002557,-0.44935754,0.51491792],[0.85472883,-0.06556038,0.51491792],[0.65295472,0.21215785,0.72707577],[0.32647736,0.10607893,0.93923362],[-0,0.34327861,0.93923362],[-0.65295472,0.55543646,0.51491792],[-0.85472883,0.48987608,0.17163931],[-0.97943209,0.10607893,0.17163931],[-0.97943209,-0.10607892,-0.17163931],[-0.85472883,-0.48987608,-0.17163931],[-0.65295472,-0.55543646,-0.51491792],[-0.32647736,-0.79263615,-0.51491792],[-0,-0.68655723,-0.72707577],[0.32647736,-0.79263615,-0.51491792],[0.65295472,-0.55543646,-0.51491792],[0.85472883,-0.48987608,-0.17163931],[0.97943209,-0.10607893,-0.17163931],[0.97943209,0.10607893,0.17163931],[0.85472883,0.48987608,0.17163931],[0.65295472,0.55543646,0.51491792],[0.32647736,0.79263615,0.51491792],[0,0.68655723,0.72707577],[-0.32647736,0.79263615,0.51491792],[-0.73002557,0.66151539,-0.17163931],[-0.73002557,0.44935754,-0.51491792],[-0.85472883,0.06556038,-0.51491792],[-0.65295472,-0.21215785,-0.72707577],[-0.32647736,-0.10607892,-0.93923362],[0,-0.34327861,-0.93923362],[0.32647736,-0.10607892,-0.93923362],[0.65295472,-0.21215785,-0.72707577],[0.85472883,0.06556038,-0.51491792],[0.73002557,0.44935754,-0.51491792],[0.73002557,0.66151539,-0.17163931],[0.40354821,0.89871508,-0.17163931],[0.20177411,0.96427546,0.17163931],[-0.20177411,0.96427546,0.17163931],[-0.40354821,0.89871508,-0.17163931],[-0.20177411,0.83315469,-0.51491792],[-0.40354821,0.55543646,-0.72707577],[-0.20177411,0.27771823,-0.93923362],[0.2017741,0.27771823,-0.93923362],[0.40354821,0.55543646,-0.72707577],[0.20177411,0.83315469,-0.51491792]],"s":[[0,5,19,20,6],[0,6,7,8,9,1],[0,1,2,3,4,5],[1,9,10,11,2],[2,11,12,13,14,3],[3,14,15,16,4],[4,16,17,18,19,5],[6,20,37,38,21,7],[7,21,22,23,8],[8,23,24,25,10,9],[10,25,26,27,12,11],[12,27,28,29,13],[13,29,30,31,15,14],[15,31,32,33,17,16],[17,33,34,35,18],[18,35,36,37,20,19],[21,38,52,53,39,22],[22,39,40,41,24,23],[24,41,42,26,25],[26,42,43,44,28,27],[28,44,45,46,30,29],[30,46,47,32,31],[32,47,48,49,34,33],[34,49,50,51,36,35],[36,51,52,38,37],[39,53,54,55,40],[40,55,56,43,42,41],[43,56,57,45,44],[45,57,58,48,47,46],[48,58,59,50,49],[50,59,54,53,52,51],[54,59,58,57,56,55]]}
		} ;
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
		let divy = (param.divy)?param.divy:1
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
		s.push([j,0,div])
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
		},{start:1.0,end:0,div:div},{start:0,end:1,div:div},{ninv:param.ninv}) ;
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
			
		},{start:0,end:1.0,div:div*2},{start:0,end:1,div:div},{ninv:param.ninv}) ;
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
	console.log(" vert:"+v.length);
	console.log(" poly:"+ibuf.length/3);
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
			for(let j=0;j<sn[i].length;j++) {
				let ii = sn[i][j] ;
				nx += sf[ii][0] ;
				ny += sf[ii][1] ;
				nz += sf[ii][2] ;
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
	let self = this ;
	if(!scale) scale=1.0 ;
	return new Promise(function(resolve,reject) {
		self.loadAjax(path).then(function(data) {
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
			self.obj_v = [] ;
			if(c.length>0) self.obj_c = [] 
			self.obj_i =x ;
			if(n.length>0) self.obj_n = [] ;
			if(t.length>0) self.obj_t = [] ;
			if(x.length>0) {
				for(let i in xi) {
					let si = i.split("/") ;
					let ind = xi[i] ;
					self.obj_v[ind] = v[si[0]-1] ;
					if(c.length>0) self.obj_c[ind] = c[si[0]-1]  
					if(t.length>0) self.obj_t[ind] = t[si[1]-1] ;
					if(n.length>0) self.obj_n[ind] = n[si[2]-1] ;
				}
			} else {
				self.obj_v = v 
				if(c.length>0) self.obj_c = c
				if(n.length>0) self.obj_n = n
			}
			console.log("loadobj "+path+" vtx:"+v.length+" norm:"+n.length+" tex:"+t.length+" idx:"+x.length+" vbuf:"+self.obj_v.length) ;
			resolve(self) ;
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
			console.log(xl)
			console.log(rxi)
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
			} else resolve((nogroup)?{objs:objs}:{groups:groups})
						
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
			const ll = l.split(/\s+/) 
			const cmd = ll[0]
			if(cmd=="newmtl") {
				mtlname = ll[1] 
				mtls[mtlname] = {}
				return  
			}
			switch(cmd) {
				case "Kd":
				case "Ks":
				case "Ka":
				case "Tf":
					mtls[mtlname][cmd] = [parseFloat(ll[1]),parseFloat(ll[2]),parseFloat(ll[3])]
					break ;
				case "Ni":
				case "d":
				case "Ns":
					mtls[mtlname][cmd] = parseFloat(ll[1])
					break ;
				case "illum":
					mtls[mtlname][cmd] = parseInt(ll[1])
					break ;
				case "map_Kd":
				case "map_Ka":
				case "map_Ks":
					mtls[mtlname][cmd] = ll[1]
					break;
			}
		}).then(r=>{
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
