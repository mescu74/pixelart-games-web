/* Real street graph and arcade steering, independent of rendering. */
(function(root){
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function nearest(nodes,p){let best=0;nodes.forEach((n,i)=>{if(dist(n,p)<dist(nodes[best],p))best=i;});return best;}
function field(nodes,target){const d=Array(nodes.length).fill(Infinity);d[target]=0;const q=[target];for(let i=0;i<q.length;i++)for(const l of nodes[q[i]].links)if(d[l.to]===Infinity){d[l.to]=d[q[i]]+1;q.push(l.to);}return d;}
function direction(nodes,a,b){const n=nodes[a],m=nodes[b],len=dist(n,m);return{x:(m.x-n.x)/len,y:(m.y-n.y)/len};}
function steer(nodes,at,wanted,heading){const links=nodes[at].links;const pick=v=>links.map(l=>({...l,dot:direction(nodes,at,l.to).x*v.x+direction(nodes,at,l.to).y*v.y})).sort((a,b)=>b.dot-a.dot)[0];const requested=pick(wanted);if(requested?.dot>.76)return requested;const straight=pick(heading);return straight?.dot>.25?straight:null;}
const api={dist,nearest,field,direction,steer};if(typeof module!=='undefined')module.exports=api;root.Fuga=api;
})(typeof window!=='undefined'?window:globalThis);
