(function(){
const OLD=T['Stickers y marcos'];
let lista=null;
const B=()=>st.g('banco',{});
const sv=b=>st.s('banco',b);

async function cargar(){
 if(lista)return lista;
 const h=location.hostname,p=location.pathname.split('/').filter(Boolean)[0];
 if(!/\.github\.io$/.test(h)||!p)throw new Error('El banco solo funciona desde tu página de GitHub Pages.');
 let r;
 try{r=await fetch('https://api.github.com/repos/'+h.split('.')[0]+'/'+p+'/contents/')}
 catch(e){throw new Error('No hay conexión con GitHub. Revisa tu internet.')}
 if(!r.ok)throw new Error('GitHub no respondió (código '+r.status+'). Prueba en unos minutos.');
 const j=await r.json();
 lista=j.filter(x=>x.type==='file'&&/\.(png|webp|jpe?g)$/i.test(x.name)).map(x=>x.name);
 return lista;
}

T['Stickers y marcos']=function(m){
 let n=12;
