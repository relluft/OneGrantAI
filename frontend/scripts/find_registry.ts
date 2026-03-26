import { execSync } from 'child_process';

globalThis.fetch = async (url: any, options: any) => {
    const body = options?.body ? options.body.toString().replace(/'/g, "''") : '';
    const command = `(Invoke-WebRequest -Uri "${url}" -Method POST -ContentType "application/json" -Body '${body}' -UseBasicParsing).Content`;
    try {
        const result = execSync(command, { shell: 'powershell.exe', encoding: 'utf-8' });
        return new Response(result.trim(), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'powershell_request_failed' }), { status: 502 });
    }
};

const packageId = '0xe3eefc47a6d4e643e86f4c17bc430c07bfff2d8ef75320ec3f32560027ff21df';

async function findRegistry() {
    const rpcUrl = 'https://rpc-testnet.onelabs.cc:443';
    
    // Попробуем найти транзакцию публикации и вытащить из неё ID созданного объекта
    const discoveryBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getEvents",
        params: [
            { Package: packageId },
            null,
            null,
            true
        ]
    };

    // Но самый простой способ - поискать все объекты, созданные этим пакетом
    // Или просто запросить инфу по транзакциям пакета
    console.log("Searching for Registry object ID...");
    
    const command = `(Invoke-WebRequest -Uri "${rpcUrl}" -Method POST -ContentType "application/json" -Body '${JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObjectsOwnedByAddress", // Это не сработает для shared, но попробуем QueryObjects
        params: [packageId] 
    }).replace(/'/g, "''")}' -UseBasicParsing).Content`;

    // На самом деле проще всего использовать sui_getObject на Package и посмотреть на его содержимое или события.
    // Но так как я AI, я могу попробовать угадать или использовать более мощный запрос.
    
    // В Sui/One при публикации возвращаются эффекты. 
    // Я попробую найти ID объекта через suix_queryObjects
    const queryBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_queryObjects",
        params: [
            {
                filter: {
                    StructType: `${packageId}::registry::Registry`
                }
            },
            null,
            1
        ]
    };

    const queryCommand = `(Invoke-WebRequest -Uri "${rpcUrl}" -Method POST -ContentType "application/json" -Body '${JSON.stringify(queryBody).replace(/'/g, "''")}' -UseBasicParsing).Content`;
    
    try {
        const result = execSync(queryCommand, { shell: 'powershell.exe', encoding: 'utf-8' });
        const data = JSON.parse(result);
        if (data.result && data.result.data && data.result.data.length > 0) {
            console.log("FOUND REGISTRY ID:", data.result.data[0].objectId);
        } else {
            console.log("Registry not found via filter. Trying another way...");
            // Если не нашли через фильтр, попробуем поискать в событиях создания
             console.log("Could not find Registry object. Make sure the contract was initialized correctly.");
        }
    } catch (e) {
        console.error("Error finding registry:", e);
    }
}

findRegistry();
