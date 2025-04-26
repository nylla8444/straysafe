import { NextResponse } from 'next/server';

// LRU Cache implementation to prevent memory leaks
class LRUCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (!this.cache.has(key)) return undefined;

        // Access refreshes the item in cache
        const item = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, item);
        return item;
    }

    set(key, value, ttl) {
        // Remove oldest entry if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        // Set expiration time
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });

        // Schedule cleanup
        setTimeout(() => {
            if (this.cache.has(key) && this.cache.get(key).expiry <= Date.now()) {
                this.cache.delete(key);
            }
        }, ttl);
    }
}

const requestCache = new LRUCache(200);

// Default cache duration of 30 seconds
const DEFAULT_CACHE_DURATION = 30 * 1000;

export async function withCache(request, handler, options = {}) {
    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
        return handler(request);
    }

    const duration = options.duration || DEFAULT_CACHE_DURATION;
    const cacheKey = request.url;

    // Check cache
    const cachedItem = requestCache.get(cacheKey);
    if (cachedItem && cachedItem.expiry > Date.now()) {
        // Return cached response
        return NextResponse.json(cachedItem.value);
    }

    // Execute handler
    const response = await handler(request);

    // Only cache successful responses
    if (response.status === 200) {
        try {
            // Clone the response to read its body
            const clone = response.clone();
            const data = await clone.json();

            // Store in cache
            requestCache.set(cacheKey, data, duration);
        } catch (error) {
            console.error('Failed to cache response:', error);
        }
    }

    return response;
}