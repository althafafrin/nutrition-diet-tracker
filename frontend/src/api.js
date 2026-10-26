const BASE='http://localhost:4000';
function headers(){const t=localStorage.getItem('token');return {'Content-Type':'application/json',...(t?{Authorization:`Bearer ${t}`}:{})};}
async function request(path,options={}){const r=await fetch(BASE+path,{...options,headers:{...headers(),...(options.headers||{})}});let data={};try{data=await r.json();}catch{}if(!r.ok)throw new Error(data.error||`Request failed (${r.status})`);return data;}
const API={
 login:(body)=>request('/auth/login',{method:'POST',body:JSON.stringify(body)}),
 register:(body)=>request('/auth/register',{method:'POST',body:JSON.stringify(body)}),
 me:()=>request('/auth/me'),
 summary:(period='day')=>request(`/logs/summary?period=${period}`),
 logs:(from,to)=>request(`/logs${from||to?`?from=${from||''}&to=${to||''}`:''}`),
 createLog:(body)=>request('/logs',{method:'POST',body:JSON.stringify(body)}),
 deleteLog:(id)=>request(`/logs/${id}`,{method:'DELETE'}),
 barcode:(code)=>request('/logs/barcode/'+encodeURIComponent(code)),
 goal:(daily_calorie_goal)=>request('/auth/goal',{method:'PUT',body:JSON.stringify({daily_calorie_goal})}),
 profile:(body)=>request('/auth/profile',{method:'PUT',body:JSON.stringify(body)})
};
export default API;
