async function fetchModels() {
    try {
        const response = await trickleListObjects('ai-model', 100, true);
        return response.items.map(item => item.objectData);
    } catch (error) {
        reportError(error);
        return [];
    }
}

async function createModel(modelData) {
    try {
        await trickleCreateObject('ai-model', modelData);
    } catch (error) {
        reportError(error);
        throw error;
    }
}

async function updateModel(modelId, modelData) {
    try {
        await trickleUpdateObject('ai-model', modelId, modelData);
    } catch (error) {
        reportError(error);
        throw error;
    }
}

async function deleteModel(modelId) {
    try {
        await trickleDeleteObject('ai-model', modelId);
    } catch (error) {
        reportError(error);
        throw error;
    }
}

async function createStore(storeData) {
    try {
        await trickleCreateObject('store', storeData);
    } catch (error) {
        reportError(error);
        throw error;
    }
}

async function fetchStores() {
    try {
        const response = await trickleListObjects('store', 100, true);
        return response.items.map(item => item.objectData);
    } catch (error) {
        reportError(error);
        return [];
    }
}

async function fetchStoreProducts(storeId) {
    try {
        const response = await trickleListObjects(`product:${storeId}`, 100, true);
        return response.items.map(item => item.objectData);
    } catch (error) {
        reportError(error);
        return [];
    }
}

async function createOrder(orderData) {
    try {
        await trickleCreateObject('order', orderData);
    } catch (error) {
        reportError(error);
        throw error;
    }
}

async function fetchUserOrders(userId) {
    try {
        const response = await trickleListObjects(`order:${userId}`, 100, true);
        return response.items.map(item => item.objectData);
    } catch (error) {
        reportError(error);
        return [];
    }
}

async function createReview(reviewData) {
    try {
        await trickleCreateObject('review', reviewData);
    } catch (error) {
        reportError(error);
        throw error;
    }
}
