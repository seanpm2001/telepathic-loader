import { importModule } from "https://uupaa.github.io/dynamic-import-polyfill/importModule.js";
//IIFE to try and load all *-element - class name must match SomethingElement while tag must match something-element
export default class TelepathicLoader{
    static async Load(dom){
        let nodeList = dom.querySelectorAll('*');
        nodeList.forEach(async (element)=>{
            if(element.tagName.includes('-ELEMENT')){
                let tagName = element.tagName.toLowerCase();
                let jsFileName = `${tagName}.js`;
                let htmlFileName = `${tagName}.html`;
                let classParts = tagName.split('-');
                let className = "";
                classParts.forEach((part)=>{
                    className += part.charAt(0).toUpperCase() + part.slice(1);
                });
    
                //First see if there is already something in the custom element registry
                if(!window.customElements.get(tagName)){
                    //console.log(`${tagName} : ${className} is ${fileName}`);
                    //console.log(`${tagName} is unregistered`);
                    //Try to instantiate
                    
                    let path = window.location.pathname.split('/');
                    path.pop();
                    path = path.join('/');
                    let jsloc = `${path}/${tagName}/${jsFileName}`;
                    let htmlLoc = `${path}/${tagName}/${htmlFileName}`;
                    window[tagName] = className;
                    window[className] = htmlLoc;
                    console.log(`Expecting template at ${window[className]}`);
                   
                    console.log(`importing ${jsloc}`);
                    let module = await importModule(jsloc);
                    console.log(tagName+" module is ",module);
                    TelepathicLoader.delayLoad(htmlLoc,tagName,className,module,1);

                }else{
                    console.log(`${tagName} already loaded, skipping!`);
                }
            }
        });
    }

    static delayLoad(htmlLoc,tagName,className,module,delay){
        setTimeout(()=>{
            if(!window.customElements.get(tagName)){
                if(window[className]){
                    try{
                        window.customElements.define(tagName,module.default);
                    }catch(err){
                        console.error(`${tagName} : ${err}`);
                        TelepathicLoader.delayLoad(htmlLoc,tagName,className,module,delay +1000);
                    }
                }else{
                    window[className] = htmlLoc;
                    console.error("Template location missing for ",className);
                    TelepathicLoader.delayLoad(htmlLoc,tag,className,module,delay + 1000);
                }
            }
        },delay);
    }
}
window.TelepathicLoader = TelepathicLoader;  
TelepathicLoader.Load(document);