import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageId = '0xe3eefc47a6d4e643e86f4c17bc430c07bfff2d8ef75320ec3f32560027ff21df';
const rpcUrl = 'https://rpc-testnet.onelabs.cc:443';

async function configure() {
    console.log("⚙️ Начинаем глубокий поиск Registry ID...");
    
    // 1. Ищем транзакции, связанные с пакетом
    const txQuery = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_queryTransactionBlocks",
        params: [
            { filter: { InputObject: packageId } }, 
            null, 10, true
        ]
    };

    // Если InputObject не сработает (для публикации), попробуем просто найти через MoveFunction или как ChangedObject
    const altTxQuery = {
        jsonrpc: "2.0",
        id: 2,
        method: "suix_queryTransactionBlocks",
        params: [
            { filter: { ChangedObject: packageId } },
            null, 1, true
        ]
    };

    const runRpc = (body: any) => {
        const cmd = `(Invoke-WebRequest -Uri "${rpcUrl}" -Method POST -ContentType "application/json" -Body '${JSON.stringify(body).replace(/'/g, "''")}' -UseBasicParsing).Content`;
        return JSON.parse(execSync(cmd, { shell: 'powershell.exe', encoding: 'utf-8' }));
    };

    try {
        console.log("🔍 Ищем транзакцию публикации...");
        let data = runRpc(altTxQuery);
        
        if (!data.result || !data.result.data || data.result.data.length === 0) {
            // Попробуем еще один вариант - поиск всех объектов этого пакета через QueryObjects без фильтра по типу (просто по модулю)
            console.log("Транзакция не найдена через ChangedObject. Пробуем поиск объектов модуля...");
            const objectQuery = {
                jsonrpc: "2.0",
                id: 3,
                method: "suix_queryObjects",
                params: [{ filter: { MoveModule: { package: packageId, module: "registry" } } }, null, 10]
            };
            data = runRpc(objectQuery);
            
            if (data.result && data.result.data && data.result.data.length > 0) {
                // Мы нашли какие-то объекты этого модуля!
                const registryId = data.result.data.find((obj: any) => obj.type && obj.type.includes("::Registry"))?.objectId || data.result.data[0].objectId;
                updateWallet(registryId);
                return;
            }
        } else {
            // Анализируем созданные объекты в транзакции
            const tx = data.result.data[0];
            const created = tx.effects?.created || [];
            const registryObj = created.find((c: any) => c.owner === "Shared" || (c.reference && c.reference.objectId));
            
            if (registryObj) {
                const id = registryObj.reference?.objectId || registryObj.owner?.Shared?.initial_shared_version || "unknown";
                // В эффектах Sui/One немного другой формат, попробуем вытащить ID
                // Если не получается красиво, просто выведем весь список созданных ID
                console.log("Найдено в транзакции!");
                updateWallet(tx.effects.created[0].reference.objectId);
                return;
            }
        }
        
        console.log("❌ Не удалось найти ID автоматически. Пожалуйста, скопируйте ID объекта Registry из эксплорера (он должен быть в списке Created Objects транзакции деплоя).");
    } catch (e: any) {
        console.error("❌ Ошибка:", e.message);
    }
}

function updateWallet(registryId: string) {
    console.log(`✅ Найдено: ${registryId}`);
    const walletPath = path.join(__dirname, '../src/wallet.ts');
    const content = `export const CONTRACT = {
  PACKAGE_ID: "${packageId}",
  REGISTRY_OBJECT_ID: "${registryId}",
  MOCK_MODE: false
};

export const getMockAddress = () => localStorage.getItem('mock_wallet_address');
export const setMockAddress = (addr: string) => localStorage.setItem('mock_wallet_address', addr);
export const clearMockAddress = () => localStorage.removeItem('mock_wallet_address');
`;
    fs.writeFileSync(walletPath, content);
    console.log(`📝 Конфиг ${walletPath} обновлен!`);
}

configure();
