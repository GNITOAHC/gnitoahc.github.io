---
title: Golang In-memory Cache
date: 2024-05-30
description: Create a simple in-memory cache in Golang.
readTime: 3 min read
tags: ['Golang']
type: writing
---

# Golang In-memory Cache Implementation

I'm currently building a simple Go web app and wanted to optimize the performance by introducing an in-memory cache.
Caching is crucial for improving the speed of data retrieval operations, reducing the load on databases, and enhancing the overall user experience.
In this blog, I will walk through the process of creating a basic in-memory cache in Golang, which can be used to store key-value pairs.

## Create a New Go Module

Create a `cache` package in a new Go module named `cache`.

```txt
internal
├── your go package
│  └── your go file
└── cache
   └── cache.go <- Create this file
```

### Step 1: Define the Cache Structure and the `New()` function

```go
package cache

import (
	"sync"
	"time"
)

type item[V any] struct {
	value      V
	expiration time.Time
} // Single Item type

type Cache[K comparable, V any] struct {
	items map[K]item[V] // map of items
	mu    sync.Mutex
} // Cache type
```

In the above code snippet, we define two custom types: `item` and `Cache`.
The `item` type represents a single key-value pair along with the expiration time. The `item` starts with a lowercase letter, which makes it private to the package.
The `Cache` type is a collection of items stored in a map with a mutex to handle concurrent access.

```go
func (i item[V]) isExpired() bool {
	return i.expiration.Before(time.Now())
}

func New[K comparable, V any]() *Cache[K, V] {
	c := &Cache[K, V]{
		items: make(map[K]item[V]),
	}

	go func() {
		for range time.Tick(24 * time.Hour) { // Check every day
			c.mu.Lock()
			for k, v := range c.items {
				if v.isExpired() {
					delete(c.items, k)
				}
			}
			c.mu.Unlock()
		}
	}()

	return c
}
```

In the above code snippet, we define a `New()` function that creates a new cache instance.
The function initializes the cache with an empty map and starts a goroutine to periodically check for expired items and remove them from the cache.

Note: The `sync.Mutex` in the `Cache` struct ensures that access to the `items` map is thread-safe.
The `Lock()` and `Unlock()` methods are used to prevent race conditions when multiple goroutines attempt to read from or write to the cache concurrently.
This is essential for maintaining data integrity in a concurrent environment.

### Step 2: Implement the `Set()` & `Get()` methods

- `Set()` method is used to add or update a key-value pair in the cache with a specified time-to-live (TTL).
- `Get()` method is used to retrieve a value from the cache based on the key.

```go
func (c *Cache[K, V]) Set(key K, val V, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = item[V]{
		value:      val,
		expiration: time.Now().Add(ttl),
	}
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	item, ok := c.items[key]
	if !ok {
		return item.value, false // Zero value
	}
	if item.isExpired() {
		delete(c.items, key)
		return item.value, false
	}
	return item.value, true
}
```

> Note: Remember to use `c.mu.Lock()` to acquire the lock before accessing the `items` map and `defer c.mu.Unlock()` to release the lock when done.

### Step 3: Implement the `Delete()` & `Pop()` methods

- `Delete()` method is used to remove a key-value pair from the cache.
- `Pop()` method is used to retrieve and remove a key-value pair from the cache based on the key.

```go
func (c *Cache[K, V]) Delete(key K) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

func (c *Cache[K, V]) Pop(key K) (V, bool) {
	val, has := c.Get(key)
	if !has {
		return val, has
	}
	c.Delete(key)
	return val, has
}
```

## Test the In-memory Cache

Create a test file named `cache_test.go` in the `cache` package to write unit tests for the cache implementation.

```txt
internal
├── your go package
│  └── your go file
└── cache
   ├── cache.go
   └── cache_test.go <- Create this file
```

### Step 1: Import the Required Packages

```go
package cache

import (
	"testing"
	"time"
)
```

### Step 2: Create Test Cases

```go
func TestCache(t *testing.T) {
	type Value struct {
		Name string
	}
	c := New[string, Value]() // Create a new cache with string keys and Value values
    // Add 2 key value pairs of TTL 30 seconds
	c.Set("chaotingchen10@gmail.com", Value{Name: "Tim"}, time.Second*30)
	c.Set("dev@dev.com", Value{Name: "dev"}, time.Second*30)

	c.Pop("dev@dev.com") // First pop the key value pair with key "dev@dev.com"
	v, ok := c.Get("dev@dev.com") // Check if the key value pair is deleted
	if ok {
		t.Error("(Error) expected value to be deleted")
	} else {
		t.Log("(Success) Value poped")
	}

	v, ok = c.Get("chaotingchen10@gmail.com") // Get a key value pair which isn't deleted
	if !ok {
		t.Error("(Error) expected value to be found")
	} else {
		t.Log("(Success) Found: ", v)
	}

	time.Sleep(time.Second * 35) // Wait for 35 seconds to expire the key value pair
	v, ok = c.Get("chaotingchen10@gmail.com")
	if ok {
		t.Error("(Error) expected value to be expired")
	} else {
		t.Log("(Success) Expired")
	}
}
```

### Step 3: Run the Test

Run `go test` in the `cache` package directory to execute the test cases.

```bash
go test
```

To print the logs, run the test with the `-v` flag, i.e., `go test -v`.

## Conclusion

Although their are many ways to implement caching, including using Redis, Memcached, or other third-party services, an in-memory cache can be a simple and effective solution for small-scale applications.
Hope you found this blog helpful in understanding how to create an in-memory cache in Golang.

Happy coding!!
