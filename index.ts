// shim to allow node and native browser module path support with the same code
// @ts-expect-error TypeScript can't find this
import Is from '../strong-type/index.js';

const is=new Is;

type Handler = (...args: unknown[]) => unknown;
class EventPubSub {
    constructor() {
        
    }

    on(type: string, handler: Handler, once=false) {
        is.string(type);
        is.function(handler);
        is.boolean(once);
        
        if(type=='*'){
            type=this.#all as unknown as string;
        }

        if (!this.#events[type]) {
            this.#events[type] = [];
        }

        handler[this.#once] = once;

        this.#events[type].push(handler);
        
        return this;
    }

    once(type: string, handler: (...args: unknown[]) => unknown) {
        //sugar for this.on with once set to true 
        //so let that do the validation
        return this.on(type,handler,true);
    }

    off(type='*', handler: string | Handler ='*') {
        is.string(type);
        
        if(type==this.#all.toString()||type=='*'){
            type=this.#all as unknown as string;
        }
        
        if (!this.#events[type]) {
            return this;
        }

        if (handler=='*') {
            delete this.#events[type];
            return this;
        }

        //If we are not removing all the handlers,
        //we need to know which one we are removing.
        is.function(handler);

        const handlers = this.#events[type];

        while (handlers.includes(handler as unknown as Handler)) {
            handlers.splice(
                handlers.indexOf( handler as unknown as Handler ),
                1
            );
        }

        if (handlers.length < 1) {
            delete this.#events[type];
        }

        return this;
    }

    emit(type: string, ...args: unknown[]) {
        is.string(type);
        
        const globalHandlers=this.#events[this.#all as unknown as string]||[];
        
        this.#handleOnce(this.#all.toString(), globalHandlers, type, ...args);
        
        if (!this.#events[type]) {
            return this;
        }

        const handlers = this.#events[type];        

        this.#handleOnce(type, handlers, ...args);

        return this;
    }

    reset(){
        this.off(this.#all.toString());
        for(let type in this.#events){
            this.off(type);
        }

        return this
    }

    get list(){
        return Object.assign({},this.#events);
    }

    #handleOnce=(type: string, handlers: Handler[], ...args: unknown[])=>{
        is.string(type);
        is.array(handlers);
        
        const deleteOnceHandled=[];

        for (let handler of handlers) {
            handler(...args);
            if(handler[this.#once]){
                deleteOnceHandled.push(handler);
            }
        }

        for(let handler of deleteOnceHandled){
          this.off(type,handler);
        }
    }

    #all =Symbol.for('event-pubsub-all')
    #once=Symbol.for('event-pubsub-once')

    #events: Record<string, Handler[]> = {}
}

export {EventPubSub as default, EventPubSub};