// The package_id and registry_object_id should be updated after deploying the Move contract
export const CONTRACT = {
  PACKAGE_ID: "0xe3eefc47a6d4e643e86f4c17bc430c07bfff2d8ef75320ec3f32560027ff21df",
  REGISTRY_OBJECT_ID: "0x4f5d520f45e3c05438b80cdbdb50ab2149073e768fe645f8722c331ed94c533d",
  MOCK_MODE: false // Real blockchain mode
};

export const getMockAddress = () => localStorage.getItem('mock_wallet_address');
export const setMockAddress = (addr: string) => localStorage.setItem('mock_wallet_address', addr);
export const clearMockAddress = () => localStorage.removeItem('mock_wallet_address');
