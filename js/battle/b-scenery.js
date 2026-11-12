/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function(){'use strict';window.O81B=window.O81B||{};
var Z=[],P=[],M=Math;
// seeded generator, high bits of a 32-bit congruential step
function RN(s){return function(){s=(s*69069+12345)>>>0;return(s>>>8)/16777216}}
// mesh kit: b={p:[points],t:[tone],g:[glow]}, one entry per vertex; b.r turns points about +Z, b.o shifts x
function B(){return{p:[],t:[],g:[],r:0,o:0}}
function cr(u,v){return[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]}
function sb(a,c){return[a[0]-c[0],a[1]-c[1],a[2]-c[2]]}
function nz(v){var l=M.hypot(v[0],v[1],v[2]);return[v[0]/l,v[1]/l,v[2]/l]}
function T(b,a,c,d,t,g){var n=cr(sb(c,a),sb(d,a));
 if(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]<4e-12)return;
 [a,c,d].forEach(function(p){var k=M.cos(b.r),s=M.sin(b.r);b.p.push([p[0]*k-p[1]*s+b.o,p[0]*s+p[1]*k,p[2]]);b.t.push(t);b.g.push(g||0)})}
function Q(b,a,c,d,e,t,g){T(b,a,c,d,t,g);T(b,a,d,e,t,g)}
// box: centre c, full size s
function X(b,c,s,t,g){for(var i=0;i<3;i++)for(var q=-1;q<2;q+=2){var u=(i+1)%3,v=(i+2)%3,r=[];
 [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(k){var p=c.slice();p[i]+=q*s[i]/2;p[u]+=k[0]*s[u]/2;p[v]+=k[1]*s[v]/2;r.push(p)});
 if(q<0)r.reverse();Q(b,r[0],r[1],r[2],r[3],t,g)}}
// frustum from a (radius r0) to e (radius r1), n sides, capped
function C(b,a,e,r0,r1,n,t,g){var w=nz(sb(e,a)),h=M.abs(w[1])<.9?[0,1,0]:[1,0,0],u=nz(cr(h,w)),v=cr(w,u),i;
 function pt(c,r,k){var A=k*M.PI*2/n,x=M.cos(A)*r,y=M.sin(A)*r;return[c[0]+u[0]*x+v[0]*y,c[1]+u[1]*x+v[1]*y,c[2]+u[2]*x+v[2]*y]}
 for(i=0;i<n;i++){var a0=pt(a,r0,i),a1=pt(a,r0,i+1),b0=pt(e,r1,i),b1=pt(e,r1,i+1);
  Q(b,a0,a1,b1,b0,t,g);T(b,e,b0,b1,t,g);T(b,a,a1,a0,t,g)}}
// lumpy rock: octahedron split 3 times, radial lumps from sines of the direction, two basins, axis ratios ar
function RK(sd,ar,R,t0){var r=RN(sd),b=B(),W=[],D=[],i;
 for(i=0;i<6;i++)W.push([r()*2-1,r()*2-1,r()*2-1,r()*5+2.5,r()*6.28,.03+.05*r()]);
 for(i=0;i<2;i++)D.push(nz([r()-.5,r()-.5,r()-.5]));
 function f(d){var s=1,i,w,c,k;for(i=0;i<6;i++){w=W[i];s+=w[5]*M.sin(w[3]*(w[0]*d[0]+w[1]*d[1]+w[2]*d[2])+w[4])}
  for(i=0;i<2;i++){c=d[0]*D[i][0]+d[1]*D[i][1]+d[2]*D[i][2];k=M.max(0,(c-.8)/.2);s-=.22*k*k*(3-2*k)}
  return[d[0]*s*R*ar[0],d[1]*s*R*ar[1],d[2]*s*R*ar[2]]}
 function S(a,c,d,n){if(n){var x=nz([a[0]+c[0],a[1]+c[1],a[2]+c[2]]),y=nz([c[0]+d[0],c[1]+d[1],c[2]+d[2]]),z=nz([d[0]+a[0],d[1]+a[1],d[2]+a[2]]);
  S(a,x,z,n-1);S(x,c,y,n-1);S(z,y,d,n-1);S(x,y,z,n-1)}else T(b,f(a),f(c),f(d),t0+((r()*3|0)-1)*10,0)}
 for(i=0;i<8;i++){var sx=i&1?-1:1,sy=i&2?-1:1,sz=i&4?-1:1,A=[sx,0,0],Bq=[0,sy,0],Cq=[0,0,sz];
  if(sx*sy*sz<0){S(A,Cq,Bq,3)}else S(A,Bq,Cq,3)}
 return b}
// finish: flat unit normal per triangle
function F2(b){var n=b.p.length,po=new Float32Array(3*n),nr=new Float32Array(3*n),i,j,m;
 for(i=0;i<n;i+=3){m=nz(cr(sb(b.p[i+1],b.p[i]),sb(b.p[i+2],b.p[i])));
  for(j=0;j<3;j++){po.set(b.p[i+j],3*(i+j));nr.set(m,3*(i+j))}}
 return{n:n,pos:po,nrm:nr,tone:new Uint8Array(b.t),glow:new Uint8Array(b.g),band:new Uint8Array(n)}}
var F="#version 300 es\nprecision highp float;\nuniform vec2 uRes;\nuniform float uPx;\nuniform float uMpp;\nuniform float uCamY;\nuniform float uT;\nuniform float uTheme;\nuniform float uQ;\nout vec4 o;\nconst float TP=6.2831853;\nconst float S1[5]=float[5](.0038,.008,.0043,.0031,.0031);\nconst float S2[5]=float[5](.012,.045,.025,.011,.011);\nconst float R1[5]=float[5](.3,.5,.15,.3,.3);\nconst float R2[5]=float[5](.3,.7,.2,.4,.4);\nconst vec3 SP[8]=vec3[8](vec3(170.,-90.,34.),vec3(262.,-150.,24.),vec3(330.,-60.,14.),vec3(540.,-30.,58.),vec3(-480.,120.,40.),vec3(-400.,80.,22.),vec3(-560.,40.,15.),vec3(-250.,210.,26.));\nfloat ph,px,hw,g1,g2,cid;\nconst vec2 PD[5]=vec2[5](vec2(-390.,-264.),vec2(90.,-154.),vec2(495.,330.),vec2(-760.,520.),vec2(760.,-560.));\nfloat h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.7)))*9137.31);}\nvec2 h2(vec2 p){return fract(sin(vec2(dot(p,vec2(41.3,289.7)),dot(p,vec2(269.5,183.3))))*9137.31);}\nfloat n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}\nfloat fb(vec2 p,int L){float s=0.,a=.5;for(int i=0;i<4;i++){if(i<L)s+=a*n(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}return s*1.07;}\nvec2 cc(float k){float t=TP*ph*k;return vec2(cos(t),sin(t));}\nvec2 vor(vec2 p){vec2 i=floor(p),f=fract(p);float a=9.,b=9.,bs=0.,ws=0.;\nfor(int y=-1;y<2;y++)for(int x=-1;x<2;x++){vec2 g=vec2(x,y),k=h2(i+g);float d=length(g+.5+.4*sin(TP*(ph+k))-f)*(.7+.6*k.y);\nfloat wg=exp(-10.*d*d);bs+=pow(k.x,1.6)*wg;ws+=wg;\nif(d<a){b=a;a=d;}else if(d<b)b=d;}\ncid=bs/ws;return vec2(a,b);}\nvec3 st(vec2 q){vec2 c=q/22.,i=floor(c);float r=h(i);if(r<.95)return vec3(0);vec2 f=fract(c)-vec2(h(i+7.1),h(i+3.7))*.6-.2;return smoothstep(1.4*px/22.,0.,length(f))*(r-.95)*16.*mix(vec3(.7,.8,1.),vec3(1.,.85,.65),fract(r*77.))*.4;}\nvec3 z0(vec2 q,float a){\nvec3 c=vec3(.004,.005,.008)+st(q);\nvec2 mc=q/40.,mi=floor(mc);float mr=h(mi+4.7),an=TP*(ph*(step(.5,fract(mr*91.))*2.-1.)+fract(mr*113.));\nif(mr>.95)c+=vec3(.5,.45,.4)*.22*smoothstep((.7+.8*fract(mr*57.))*px/40.,0.,length(fract(mc)-.5-.25*vec2(cos(an),sin(an))));\nfloat b=dot(q,vec2(-.6,.8))/900.+.15*(g1-.5),e=(b+.02)/.12;\nc+=vec3(.034,.034,.045)*exp(-b*b*1.1)*(1.-.85*exp(-e*e))*(.5+g1)*(.7+.6*g2);\nvec2 d=(q-vec2(-1650.,-110.))/1500.;\nfloat r=length(d);\nif(r<1.01){\nfloat cv=clamp((1.-r)*1500./(1.5*px)+.5,0.,1.)*smoothstep(.46,.2,a);\nvec3 nn=vec3(d,sqrt(max(1.-r*r,0.)));\nfloat l=smoothstep(0.,.2,dot(nn,normalize(vec3(.85,.1,-.6))));\nfloat lt=1.5*(d.y+.08*d.x),w=lt*34.+(g1-.5)*7.+(g2-.5)*3.2+.4*sin(TP*ph+lt*9.);\nfloat bd=.5+.5*sin(w),b2=.5+.5*sin(lt*13.+(g1-.5)*4.);\nbd=mix(mix(bd,b2,.4),.5+.5*sin(lt*67.+(g2-.5)*6.),.3);\nvec3 cb=mix(mix(vec3(.26,.31,.38),vec3(.5,.36,.2),smoothstep(0.,.5,bd)),vec3(.47,.44,.26),smoothstep(.5,1.,bd))*(.7+.6*g2);\nfloat ld=.35+.65*nn.z;\nc=mix(c,cb*l*.65*ld+vec3(.35,.3,.2)*.1*smoothstep(.9,1.,r)*l+vec3(.003,.003,.005),cv);}\nreturn c;}\nvec3 z1(vec2 q,float a){\nfloat aa=abs(a),sg=sign(a),e=.46-.08*q.x*q.x/1.9e6,m=aa/e,mu=sqrt(max(1.-m*m,0.)),dd=aa-e;\nvec2 v=vor(q/36.+(g1-.5)*.8);\nfloat lm=clamp(.35+3.*cid*(.4+.6*smoothstep(0.,.8,v.y-v.x))*(.35+smoothstep(.2,.8,g1))*(1.15-.4*v.x),0.,1.4)*(.55+.9*smoothstep(.2,.8,g1));\nvec3 c=mix(vec3(.09,.018,.007),vec3(.4,.11,.02),clamp(lm*.85,0.,1.));\nc*=mix(.25,1.,mu);c.gb*=mix(.5,1.,mu);\nfloat sd=9.;vec2 dv=vec2(1,0);\nfor(int i=0;i<8;i++){vec2 w=q-SP[i].xy*vec2(1.3,2.2);float s=length(w)/SP[i].z;if(s<sd){sd=s;dv=w;}}\nfloat fib=.92+.08*sin(atan(dv.y,dv.x)*22.+sd*5.+g2*3.);\nc=mix(c,c*(.3+.35*fib),smoothstep(1.2,.95,sd));\nc=mix(c,vec3(.05,.013,.006),smoothstep(.55,.4,sd));\nc*=clamp(-dd/.0054,0.,1.);\nc+=vec3(.7,.2,.04)*.2*smoothstep(.4,.7,g1)*exp(-abs(dd)*40.)*step(dd,0.);\nfloat s0=floor(q.x/300.);vec2 k=h2(vec2(s0,sg*3.));\nfloat vv=max(dd,0.)*2400./(25.+35.*k.y);vec2 u=vec2((q.x-(s0+.3+.4*k.x)*300.)/(40.+45.*fract(k.x*9.))-(k.y-.5)*vv*1.4,vv);\nfloat r=length(u),ar=exp(-pow((r-1.)/.4,2.))*.5+.1*smoothstep(1.2,0.,r);\nc+=vec3(.9,.3,.06)*.1*ar*step(.5,k.x)*step(0.,dd)*(.8+.2*sin(TP*ph*3.+k.y*9.));\nc+=vec3(.1,.025,.01)*exp(-max(dd,0.)*9.3)*step(0.,dd);\nfloat tf=smoothstep(.5,.38,aa);vec2 t=q-vec2(.72*hw,-250.),di=normalize(vec2(.3,.95));\nfloat al=dot(t,di),pe=t.x*di.y-t.y*di.x+4.*sin(al*.035-TP*ph*2.);\nc+=tf*vec3(.25,.5,1.)*step(0.,al)*exp(-pe*pe/(2.*pow(5.+.018*al,2.)))*exp(-al/650.)*.5;\nfloat pd=t.x-.25*t.y-.00055*t.y*t.y;\nc+=tf*vec3(.75,.6,.38)*step(0.,t.y)*exp(-pd*pd/pow(25.+.15*t.y,2.))*exp(-t.y/500.)*.3*(.7+.6*g2);\nc+=tf*vec3(.9,.7,.5)*exp(-dot(t,t)/1400.)*.25;\nreturn c;}\nfloat bu(vec2 q){return step(.955,h(floor(q/8.)))*smoothstep(.45,.1,length(fract(q/8.)-.5));}\nvec3 z2(vec2 q,float a){\nfloat x=length(q-vec2(-6000.,100.))+70.*(g1-.5)+25.*sin(q.y*.006),tt=(x+90.*sin(x*.0042+1.3))/440.,id=floor(tt),f=fract(tt),k=h(vec2(id,3.)),rw=.05+.07*k;\nfloat ri=smoothstep(0.,.012,f)*smoothstep(rw+.012,rw-.012,f)*(.55+.8*g2)*(.75+.5*k);\nfloat sh=smoothstep(rw-.01,rw+.03,f)*(1.-smoothstep(.5+.3*k,.9,f));\nvec3 c=vec3(.1,.095,.09)*(.45+1.1*g2)*(1.-.55*sh);\nc=mix(c,vec3(.27,.245,.21)*(.7+.6*g2),clamp(ri,0.,1.));\nfloat b=bu(q);c+=.14*b*(1.-sh)*vec3(1.,.95,.88)-.05*bu(q-vec2(5.,0.))*(1.-b);\nvec2 u=q/120.,i=floor(u);float r0=h(i);\nif(r0>.88){vec2 d=(fract(u)-vec2(.28+.2*h(i+3.1),.2+.5*h(i+9.7)))/(.08+.18*fract(r0*13.));float r=length(d);\nfloat inb=smoothstep(1.05,.85,r);\nc*=1.+inb*d.x*.9*(.4+.6*r)+(1.-inb)*smoothstep(1.4,1.,r)*step(d.x,0.)*.6;\nc*=1.-.7*smoothstep(.9,1.1,d.x)*smoothstep(2.,1.4,d.x)*smoothstep(.7,.3,abs(d.y));}\nfloat fs=fract(60.*ph),bl=smoothstep(.15,.25,fs)*smoothstep(.75,.65,fs);\nfor(int i=0;i<5;i++){vec2 w=q-PD[i];float rr=length(w);\nc=mix(c,vec3(.14,.13,.12)*(.8+.4*g2),smoothstep(57.,53.,rr)*.85);\nif(rr<62.){float sg=TP/16.,da=(fract(atan(w.y,w.x)/sg+.5)-.5)*sg*55.;c+=bl*1.*smoothstep(1.2+px*.6,.3,length(vec2(rr-55.,da)));}}\nreturn c*smoothstep(.54,.36,abs(a));}\nvec3 z3(vec2 q,float a){\nfloat lm=-.44+.04*q.x*q.x/1.96e6,d=a-lm,u=-d,sr=smoothstep(-200.,1100.,q.x);\nvec3 c=vec3(.004,.005,.009);\nif(d<0.){c+=st(q)*smoothstep(0.,.0135,u)+vec3(.025,.06,.14)*exp(-u*38.);}\nelse{\nfloat cl=smoothstep(.45,.78,g2+(g1-.5)*1.3+1.1*smoothstep(.12,.55,a));\nvec3 cw=mix(vec3(.028,.036,.055),vec3(.1,.11,.13),smoothstep(.2,.55,a));\ncw=mix(cw,vec3(.3,.12,.04),sr*exp(-d*12.)*.8);\nfloat Ln=n(q*.0034+3.7),ld=smoothstep(.5,.58,Ln),cs=exp(-pow((Ln-.54)/.05,2.)),cm0=n(q*.0075+9.1),cm=smoothstep(.6,.8,cm0);\nvec3 sea=vec3(.004,.01,.026)*(.6+.8*g2)+vec3(.01,.02,.05)*exp(-d*33.);\nc=mix(mix(sea,vec3(.05,.042,.03)*(.6+.8*g2),ld),cw*(.6+.8*g2),cl);\nfloat dn=ld*(.04+.9*cm*cm+1.3*cs);\nc+=vec3(.06,.035,.01)*ld*cm*(1.-cl*.8);\nfloat Cn=Ln*.5+cm0*.5;\nc+=vec3(.5,.3,.1)*.1*ld*exp(-pow((Cn-.58)/.014,2.))*(1.-cl*.8);\nvec2 w=mat2(.96,.28,-.28,.96)*q/6.5,i=floor(w);float r=h(i),fr=fract(r*57.);\nif(r>1.-.5*dn){vec2 f=fract(w)-.25-.5*vec2(fract(r*113.),fract(r*29.));float l=length(f),rs=(.9+1.8*fr)*px/6.5;\nc+=vec3(1.,.68,.28)*(smoothstep(rs,0.,l)*(.15+.85*fr*fr)*.55+smoothstep(3.*rs,0.,l)*.05*fr*cm)*(1.-cl*.85)*(.88+.12*sin(TP*ph*3.+r*90.));}\nw=mat2(.8,-.6,.6,.8)*q/13.;i=floor(w);r=h(i);fr=fract(r*57.);\nif(r>1.-.12*ld){vec2 f=fract(w)-.25-.5*vec2(fract(r*91.),fract(r*37.));\nc+=vec3(1.,.68,.28)*smoothstep((.9+1.3*fr)*px/13.,0.,length(f))*(.1+.5*fr*fr)*(1.-cl*.85);}}\nc+=vec3(.16,.4,.95)*.5*exp(-pow((d+.0018)/.0054,2.));\nc+=vec3(.04,.2,.07)*.8*exp(-pow((u-.0225)/.004,2.));\nc+=sr*vec3(.7,.26,.05)*.4*exp(-abs(d)*73.);\nreturn c;}\nvec3 z4(vec2 q,float a){\nfloat rv=mod(q.y-(140.*sin(q.x*.0021+1.)+70.*sin(q.x*.0057)-40.)+550.,1100.)-550.,w=50.+22.*sin(q.x*.003)+14.*smoothstep(900.,-1300.,q.x);\nfloat D=g1+.4*(g2-.5)+.3*smoothstep(-.3,-.58,a)-.4*exp(-pow(rv/(w*2.4),2.)),cv=smoothstep(.33,.47,D);\nvec3 dk=vec3(.082,.092,.112)*(.55+.9*g2)+vec3(.035,.022,.01)*smoothstep(900.,-1300.,q.x)*cv;\nif(cv>.995)return dk;\nvec2 hh=h2(floor(q/520.));\nfloat an=hh.x*1.3,ca=cos(an),sa=sin(an);\nvec2 r=mat2(ca,sa,-sa,ca)*q,B=vec2(65.+60.*hh.y,75.+70.*fract(hh.x*7.));\nfloat b0=h(floor(r/B)),wt=smoothstep(w+px,w-px,abs(rv));\nvec2 gq=abs(fract(r/B)-.5)*B,ed=abs(fract(q/520.)-.5)*520.;\nfloat sx=B.x*.5-gq.x,sy=B.y*.5-gq.y,ar=min(260.-ed.x,260.-ed.y);\nfloat sl=max(smoothstep(3.6,1.4,min(sx,sy)),smoothstep(8.,3.,ar));\nvec3 c=mix(vec3(.026,.027,.031)*(.8+.6*b0)+vec3(.02,.014,.01)*b0*b0,vec3(.08,.08,.088),sl);\nc=mix(c,vec3(.02,.03,.02),step(b0,.2)*(1.-sl));\nvec2 wc=r/6.5,wi=floor(wc);float wh=h(wi);\nc+=vec3(1.,.72,.38)*step(1.-b0*b0*.55-.03,wh)*step(.2,b0)*(1.-sl)*(1.-wt)*smoothstep(.45,.2,length(fract(wc)-.5))*.4*(.6+.4*h(wi+5.))*(.85+.15*sin(TP*ph*2.+wh*60.));\nfloat al=260.-ed.x<260.-ed.y?q.y:q.x;\nc+=vec3(.75,.85,1.)*.3*(smoothstep(3.5,1.,length(vec2(sx,abs(fract(r.y/30.)-.5)*30.)))+smoothstep(3.5,1.,length(vec2(sy,abs(fract(r.x/30.)-.5)*30.))))*(1.-wt);\nc+=vec3(1.,.8,.5)*.5*smoothstep(3.,.8,length(vec2(ar,(fract(al/16.)-.5)*16.)));\nc=mix(c,vec3(.05,.058,.066)*(.7+.6*g2),wt);\nc+=.03*smoothstep(2.5,0.,abs(abs(rv)-w))*(1.-wt);\nfloat bx=abs(fract(q.x/700.+.3)-.5)*700.,br=smoothstep(w+8.,w+5.,abs(rv));\nc=mix(c,vec3(.09,.085,.08),smoothstep(7.,5.,bx)*br);\nc+=vec3(1.,.85,.6)*.45*smoothstep(2.6,.8,length(vec2(bx-5.,(fract(rv/14.)-.5)*14.)))*br;\nreturn mix(c*(.6+.4*(1.-cv)),dk,cv);}\nvec3 Z(int k,vec2 p,float a){vec2 q=p+vec2(0.,1000.*float(k));\nif(k==0)return z0(q,a);if(k==1)return z1(q,a);if(k==2)return z2(q,a);if(k==3)return z3(q,a);return z4(q,a);}\nvoid main(){\nif(uTheme>.5){o=vec4(.86,.87,.88,1.);return;}\nph=fract(uT/60.);ph=floor(ph*61440.+.5)/61440.;ph=ph<1.?ph:0.;\npx=uMpp/uPx;hw=uRes.x/uPx*uMpp*.5;\nvec2 d=(gl_FragCoord.xy-uRes*.5)/uPx*uMpp;\nfloat s=-(uCamY+d.y*(1.+625.*.26794919/(uRes.y/uPx*.5*uMpp)))/2000.,j=clamp(floor(s+.5),0.,4.),a=s-j;\nfloat nb=clamp(j+(a>0.?1.:-1.),0.,4.),wn=nb==j?0.:.5*smoothstep(.47,.5,abs(a));\nint ji=int(j),ni=int(nb);\nvec2 p=vec2(d.x,.5*uCamY+d.y);\ng1=fb(p*mix(S1[ji],S1[ni],wn)+cc(1.)*mix(R1[ji],R1[ni],wn),uQ>.5?4:3);\ng2=uQ>.5?fb(p*mix(S2[ji],S2[ni],wn)+(g1-.5)*1.5+cc(2.)*mix(R2[ji],R2[ni],wn),4):g1;\nvec3 c=Z(ji,p,a)*(1.-wn);\nif(wn>0.)c+=Z(ni,p,s-nb)*wn;\nc+=(h(gl_FragCoord.xy)-.5)/255.;\no=vec4(clamp(c,0.,1.),1.);}\n";
// props: true metres, axes as drawn; each build returns a Mesh
function pr(id,c,f){P.push({id:id,paint:c,build:function(){return F2(f())}})}
pr('rock-a',[.306,.29,.271],function(){return RK(11,[1,.8,.55],100,80)});
pr('rock-b',[.49,.447,.384],function(){return RK(23,[1,.7,.45],100,70)});
pr('rock-c',[.306,.29,.271],function(){return RK(37,[1,.62,.42],100,80)});
// station: truss along X, hub spindle along Z, radiators, two docking arms, lamps
pr('station',[.36,.35,.34],function(){var b=B(),i,s,y;
 X(b,[0,0,0],[900,12,12],120,0);
 for(i=-4;i<5;i++)if(i)X(b,[i*100,0,0],[8,15,15],150,0);
 C(b,[0,0,-130],[0,0,130],15,15,8,175,0);C(b,[0,0,130],[0,0,170],5,1.5,6,160,0);
 [-1,1].forEach(function(s){
  [-1,1].forEach(function(t){X(b,[s*200,t*30,-14],[120,30,2],55,0)});
  C(b,[s*100,s*6,0],[s*100,s*156,0],4,4,6,150,0);
  [60,100,140].forEach(function(y){C(b,[s*100,s*(y-3),0],[s*100,s*(y+3),0],7.5,7.5,6,190,180)});
  X(b,[s*450,0,0],[6,6,6],220,255)});
 X(b,[0,0,171],[3,3,3],230,255);return b});
// solar wing: 150 long (Y) by 60 wide (X), boom towards -Y
pr('wing',[.13,.17,.27],function(){var b=B(),i,j;
 for(i=0;i<6;i++)for(j=0;j<3;j++)X(b,[(j-1)*19.5,-62.5+i*25,0],[19,24,1],(i+j)%2?100:128,0);
 X(b,[0,0,0],[2,152,3],140,0);C(b,[0,-75,0],[0,-95,0],2.5,2.5,6,150,0);return b});
// habitat ring: axis Z, 320 across, tube 24, four spokes, hub, warm windows on most segments
pr('ring',[.34,.33,.32],function(){var b=B(),i,a,c,N=16;
 function p(k,r){var A=k*M.PI*2/N;return[M.cos(A)*r,M.sin(A)*r,0]}
 for(i=0;i<N;i++)C(b,p(i,160),p(i+1,160),12,12,6,140+(i%2)*14,i%3?30:0);
 for(i=0;i<4;i++)C(b,p(i*4,18),p(i*4,148),3,3,4,120,0);
 C(b,[0,0,-15],[0,0,15],18,18,8,170,0);return b});
// heat-shield back: a ribbed dark sector of the cone (radius 640 to 960, 32 degrees), rim glowing orange
pr('shield',[.816,.439,.18],function(){var b=B(),i,a0,a1,A=.28,N=6,h=8;
 function q(r,a,z){return[r*M.cos(a)-800,r*M.sin(a),z]}
 for(i=0;i<N;i++){a0=-A+i*A*2/N;a1=a0+A*2/N;
  Q(b,q(640,a0,h),q(946,a0,h),q(946,a1,h),q(640,a1,h),36,0);
  Q(b,q(946,a0,h),q(960,a0,h),q(960,a1,h),q(946,a1,h),60,70);
  Q(b,q(640,a0,0),q(640,a1,0),q(960,a1,0),q(960,a0,0),28,0);
  Q(b,q(960,a0,0),q(960,a1,0),q(960,a1,h),q(960,a0,h),60,70);
  Q(b,q(640,a0,0),q(640,a0,h),q(640,a1,h),q(640,a1,0),32,0)}
 Q(b,q(640,-A,0),q(960,-A,0),q(960,-A,h),q(640,-A,h),32,0);
 Q(b,q(640,A,0),q(640,A,h),q(960,A,h),q(960,A,0),32,0);
 b.o=-800;for(i=0;i<7;i++){b.r=-A+(i+.5)*A*2/7;X(b,[800,0,h+1.5],[300,5,3],40,0)}b.r=b.o=0;
 return b});
// radiator fin: 300 by 40, dull red glow, dark ribs
pr('fin',[.541,.227,.141],function(){var b=B(),i;
 X(b,[0,0,0],[300,40,2],40,80);X(b,[0,20,1.5],[300,3,3],30,0);X(b,[0,-20,1.5],[300,3,3],30,0);
 for(i=0;i<5;i++)X(b,[-120+i*60,0,1.5],[4,40,3],32,0);return b});
// habitat mound: bermed drum 40 across, 14 high, warm windows
pr('mound',[.3,.29,.27],function(){var b=B(),i,a;
 C(b,[0,0,0],[0,0,6],34,22,10,118,0);C(b,[0,0,0],[0,0,14],21,20,10,150,0);C(b,[0,0,14],[0,0,18],20,12,10,172,0);
 for(i=0;i<6;i++){a=i*1.0472;X(b,[17*M.cos(a),17*M.sin(a),14.3],[6,4,1],210,200)}return b});
// mast 120 high (along Y), dish 12, red beacon
pr('mast',[.34,.34,.33],function(){var b=B();
 C(b,[0,0,0],[0,8,0],7,2.2,6,130,0);C(b,[0,8,0],[0,120,0],2.2,.8,6,150,0);
 C(b,[0,100,0],[0,100,3],6,6,10,190,0);C(b,[0,100,-3],[0,100,0],1,1,4,110,0);
 X(b,[0,122,0],[4,4,4],200,255);return b});
// launch-track pylon: A-frame 30 high (along Y) under a 120 long deck 12 wide
pr('pylon',[.28,.28,.27],function(){var b=B();
 [-1,1].forEach(function(s){C(b,[0,0,s*12],[0,30,s*3],1.4,1.4,4,110,0)});
 X(b,[0,12,0],[3,2,22],100,0);X(b,[0,33,0],[120,6,12],136,0);return b});
// debris: torn truss bar, bent strut, panel, tank
pr('debris',[.36,.35,.34],function(){var b=B();
 X(b,[0,0,0],[40,2,2],104,0);X(b,[19,6,1],[2,14,2],96,0);X(b,[-9,-4,0],[14,.6,9],78,0);
 C(b,[-16,3,-2],[-6,6,-2],4,4,6,150,0);X(b,[-21,-1,2],[8,1.5,1.5],88,0);return b});
// quaternion helpers
function qa(x,y,z,d){var s=M.sin(d*M.PI/360);return[x*s,y*s,z*s,M.cos(d*M.PI/360)]}
function qm(a,c){return[a[3]*c[0]+a[0]*c[3]+a[1]*c[2]-a[2]*c[1],a[3]*c[1]-a[0]*c[2]+a[1]*c[3]+a[2]*c[0],a[3]*c[2]+a[0]*c[1]-a[1]*c[0]+a[2]*c[3],a[3]*c[3]-a[0]*c[0]-a[1]*c[1]-a[2]*c[2]]}
function vr(q,v){var u=[q[0],q[1],q[2]],t=cr(u,v).map(function(x){return 2*x}),w=cr(u,t);
 return[v[0]+q[3]*t[0]+w[0],v[1]+q[3]*t[1]+w[1],v[2]+q[3]*t[2]+w[2]]}
var R=RN(77);
function rq(){var q=[R()-.5,R()-.5,R()-.5,R()-.5],l=M.hypot(q[0],q[1],q[2],q[3]);return q.map(function(x){return x/l})}
function A(k,n,p,s,q,ax,tn){Z[k].near.push({prop:n,p:p,q:q||rq(),axis:ax||nz([R()-.5,R()-.5,R()-.5]),turns:tn||0,s:s})}
// zones: lights, then placements (Z -450 to -800, Y within 900)
Z.push({id:'asteroid-field',light:{dir:[-.5199,.2999,.7998],color:[.95,.74,.5],ambient:[.012,.012,.016]},lightLight:{dir:[-.5199,.2999,.7998],color:[.95,.74,.5],ambient:[.012,.012,.016]},near:[]});
Z.push({id:'near-sun',light:{dir:[.1197,.0998,-.9878],color:[1,.6,.28],ambient:[.03,.01,.004]},lightLight:{dir:[.1197,.0998,-.9878],color:[1,.64,.32],ambient:[.04,.014,.006]},near:[]});
Z.push({id:'lunar-crater',light:{dir:[-.9903,0,.1392],color:[1,.93,.82],ambient:[.004,.004,.005]},lightLight:{dir:[-.9903,0,.1392],color:[1,.93,.82],ambient:[.012,.012,.014]},near:[]});
Z.push({id:'low-earth-orbit',light:{dir:[.3515,.1506,-.924],color:[.3,.19,.12],ambient:[.01,.018,.04]},lightLight:{dir:[.3515,.1506,-.924],color:[.4,.26,.17],ambient:[.02,.03,.06]},near:[]});
Z.push({id:'city',light:{dir:[.1505,.1004,.9835],color:[.55,.57,.6],ambient:[.22,.23,.25]},lightLight:{dir:[.1505,.1004,.9835],color:[.7,.72,.75],ambient:[.3,.31,.33]},near:[]});
(function(){var i,n,s,z,a,q,D=57.2958,ci=0;
 // Z -450 to -800; most within 250 m of the centre in Y (extents included), a few at 800 to 900; |X| 2600
 function rk(s,f){var b=135*s;n=[2,5,8].indexOf(ci%10)<0?(ci&1?2:0):1;ci++;z=-800+b+R()*(350-2*b);
  A(0,n,[(R()*2-1)*2600,f?f*(800+R()*(100-b)):(R()*2-1)*(250-b),z],s,0,0,R()<.4?1:0)}
 for(i=0;i<5;i++)rk(1.15+R()*.25,0);
 for(i=0;i<14;i++)rk(.6+R()*.4,0);
 for(i=0;i<35;i++)rk(.3+R()*.25,0);
 for(i=0;i<4;i++)rk(.3+R()*.15,i&1?1:-1);
 // 1: four groups of shield panels on an arc with fins standing out, alternately turned about
 function sg(x,f){var a0=f<0?180:0,cx=x-f*360,cy=0;
  for(i=0;i<3;i++){a=(i-1)*.3;A(1,6,[cx+f*360*M.cos(a),cy+f*360*M.sin(a),-625],.45,qa(0,0,1,a*D+a0),[0,0,1],0)}
  for(i=0;i<7;i++){a=(i-3)*.1;q=qm(qa(0,0,1,a*D+a0),qa(1,0,0,40+R()*30));A(1,7,[cx+f*560*M.cos(a),cy+f*560*M.sin(a),-625+(R()-.5)*160],.9,q,[0,0,1],0)}}
 sg(-2000,1);sg(-700,-1);sg(700,1);sg(2000,-1);
 for(i=0;i<3;i++)A(1,7,[-1800+i*1700,i&1?835:-835,-625],.9,qa(1,0,0,50),[0,0,1],0);
 // 2: two rings of six mounds, three masts, two rows of pylons 120 m apart (drawn 144), mounds far out
 function rg(x,y){for(i=0;i<6;i++){a=i*1.0472;A(2,8,[x+190*M.cos(a),y+190*M.sin(a),-625],1.6,[0,0,0,1],[0,0,1],0)}}
 rg(500,0);rg(-1900,-20);
 [[1000,100],[-650,-90],[2450,60]].forEach(function(m){A(2,9,[m[0],m[1],-700],1.5,qa(1,0,0,55),[0,1,0],0)});
 q=qm(qa(0,0,1,20),qa(1,0,0,55));
 for(i=0;i<8;i++){A(2,10,[-1250+i*144*M.cos(.349),-170+i*144*M.sin(.349),-625],1.2,q,[0,1,0],0);A(2,10,[1350+i*144*M.cos(.349),-170+i*144*M.sin(.349),-625],1.2,q,[0,1,0],0)}
 for(i=0;i<3;i++)A(2,8,[-1000+i*1500,i&1?835:-835,-625],1.6,[0,0,0,1],[0,0,1],0);
 // 3: two stations (tilted) with four wings and the turning ring each, debris
 function st(x,y,s,ra,rb){var q=qm(qa(0,0,1,ra),qa(1,0,0,rb));
  function at(v){var w=vr(q,v);return[x+w[0]*s,y+w[1]*s,-625+w[2]*s]}
  A(3,3,at([0,0,0]),s,q,[0,0,1],0);
  A(3,5,at([0,0,90]),s,q,vr(q,[0,0,1]),2);
  [-1,1].forEach(function(sx){[-1,1].forEach(function(sy){
   A(3,4,at([sx*380,sy*83,0]),s,sy<0?qm(qa(0,0,1,180),q):q,[0,0,1],0)})})}
 st(250,0,.85,12,28);st(-1750,-30,.6,-15,20);
 for(i=0;i<20;i++)A(3,11,[(R()*2-1)*2500,(R()*2-1)*200,-760+R()*260],1+R()*.7,0,0,R()<.5?1:0);
 for(i=0;i<4;i++)A(3,11,[(R()*2-1)*2500,(i&1?1:-1)*(830+R()*20),-760+R()*260],1+R()*.5,0,0,R()<.5?1:0)
})();
O81B.scenery={zones:Z,props:P,backdrop:{frag:F}};})();
