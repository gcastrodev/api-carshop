import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function bootsctrap() {
    const app = await buildApp();

    try{
        await app.listen({
            port: env.PORT,
            host: "0.0.0.0", 
        })

    }catch(err){
        app.log.error(err, "falha ao inicializar.")
        process.exit(1);
    }
}


void bootsctrap();