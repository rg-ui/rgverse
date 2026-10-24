(function(){
    'use strict';
    const config=JSON.parse(document.getElementById('acPlayerConfig').textContent);
    const domReady=()=>document.readyState==='loading'?new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true})):Promise.resolve();
    window.__acBootstrapPromise=window.ApnaCollegePublic.playback(config.batch,config.index).then(async data=>{
        window.__acPlayback=data;
        window.AKKI_VIDEO_LIST=data.playlist.map(item=>({title:item.title,href:item.href}));
        // Cached/fast metadata can arrive before the body/loading overlay exists.
        await domReady();
        const list=document.getElementById('akkiVideoListData');
        if(list)list.textContent=JSON.stringify(window.AKKI_VIDEO_LIST);
        document.getElementById('acLoadingStatus')?.remove();
        return data;
    }).catch(async ()=>{
        await domReady();
        const status=document.getElementById('acLoadingStatus');
        if(status){status.textContent='Apna College video could not load. Check your connection and retry.';
            const retry=document.createElement('button');retry.textContent='Retry';retry.style.cssText='display:block;margin:12px auto;padding:12px 24px;cursor:pointer';retry.onclick=()=>window.location.reload();status.append(retry);}
        throw Error('Apna College player metadata unavailable');
    });
    // Handle failure even if a damaged template cannot attach its player handler.
    window.__acBootstrapPromise.catch(()=>{});
})();
