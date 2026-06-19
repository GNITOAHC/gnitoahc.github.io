---
title: Golang Routing Methods and Middleware Handling
date: 2025-04-03
description: A guide to routing methods and middleware handling in Golang.
readTime: 3 min read
tags: ['Golang']
type: writing
---

# Golang Routing

In this blog, we'll explore techniques for routing in Golang, including the use of middleware. And compare it to NodeJs Express routing.

## Method Based Routing

**ExpressJs**

```javascript
const app = express();
app.get('/user', (req, res) => {
	res.send('User GET');
});
```

**Golang**

In Golang, we can define a singles route's method by adding the methid name to the route pattern.

```go
func Routes() http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /user", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("User GET"))
    })
    mux.HandleFunc("POST /user", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("User POST"))
    })
    mux.HandleFunc("/matchall", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("This route matches all methods"))
    })
    return mux
}
```

## Path Parameters

**ExpressJs**

```javascript
const router = express.Router();
router.get('/user/:id', (req, res) => {
	res.send(`User ID: ${req.params.id}`);
});
```

**Golang**

```go
func Routes() http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("/user/{id}", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("User ID: " + r.PathValue("id")))
    })
    return mux
}
```

## Sub-Routes

**ExpressJs**

Following codes will create a sub-route for `/api` i.e. `/api/a` and `/api/b`.

```javascript
const app = express();

apiRouter = express.Router();
apiRouter.get('/a', (req, res) => {...})
apiRouter.get('/b', (req, res) => {...})

app.use('/api', apiRouter);
```

**Golang**

Handling sub-routes in Golang is a bit different. Their are multiple ways to do this. One of the most common way is to use `http.ServeMux` and `http.StripPrefix`.

```go
func Routes() http.Handler {
    subrouter := http.NewServeMux()
    subrouter.HandleFunc("GET /posts", handlePosts)
    subrouter.HandleFunc("GET /users", handleUsers)

    mainRouter := http.NewServeMux()
    mainRouter.Handle("/api/", http.StripPrefix("/api", subrouter))
}
```

Or you can simply handle the sub-routes in the main router.

```go
func Routes() http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/posts", handlePosts)
    mux.HandleFunc("/api/users", handleUsers)
    return mux
}
```

## Middleware

**ExpressJs**

```javascript
function middleware(req, res, next) {
	console.log('Middleware executed');
	next();
}
router.post('/user', middleware, (req, res) => {
	res.send('User POST');
});
```

**Golang**

Their are multiple ways to implement middleware in Golang, I'll show you some of them.

First, we'll use the basic one, which is to create a middleware function that takes an `http.Handler` and returns an `http.Handler`.

```go
func middlewareOne(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Do something before the request
		w.Write([]byte("[middlewareOne] "))
		print("Middleware One\n")
		next.ServeHTTP(w, r)
	})
}
func one(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("[one] Hello, World!"))
}

func Routes() http.Handler {
    mux := http.NewServeMux()
    mux.Handle("/one", middlewareOne(http.HandlerFunc(one))) // Return: [middlewareOne] [one] Hello, World!
    return mux
}
```

When handling multiple middlewares, we can create a chain of middlewares.

```go
func middlewareTwo(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Do something before the request
		w.Write([]byte("[middlewareTwo] "))
		print("Middleware Two\n")
		next.ServeHTTP(w, r)
	})
}

func Routes() http.Handler {
    mux := http.NewServeMux()
    mux.Handle("/one", middlewareOne(middlewareTwo(http.HandlerFunc(one)))) // Return: [middlewareOne] [middlewareTwo] [one] Hello, World!
    return mux
}
```

This will call the `middlewareOne` first, then `middlewareTwo`, and finally the handler function.

On the other hand, if you want to use the middleware for all routes, you can create a wrapper function that takes the main handler and returns a new handler with the middleware applied.

```go
func Chain(handler http.Handler, middlewares ...func(next http.Handler) http.Handler) http.Handler {
  for i := len(middlewares) - 1; i >= 0; i-- {
	  handler = middlewares[i](handler)
	}

	return handler
}
func Routes() http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("/one", one) // Return: [middlewareOne] [middlewareTwo] [one] Hello, World!
    mux.HandleFunc("/two", two) // Return: [middlewareOne] [middlewareTwo] [two] Hello, World!
    return Chain(mux, middlewareOne, middlewareTwo)
}
```

Instead of wrapping the main handler, you can also simply wrap a single route through a custom `Handle` function.

```go
func Handle(mux *http.ServeMux, pattern string, handler http.HandlerFunc, middlewares ...Middleware) {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](http.HandlerFunc(handler)).ServeHTTP
	}
	mux.Handle(pattern, handler)
}
func Routes() http.Handler {
    mux := http.NewServeMux()
    Handle(mux, "/onewrapboth", one, middlewareOne, middlewareTwo) // Return: [middlewareOne] [middlewareTwo] [one] Hello, World!
    Handle(mux, "/twowrapboth", two, middlewareOne, middlewareTwo) // Return: [middlewareOne] [middlewareTwo] [two] Hello, World!

    Handle(mux, "/wrapone", one, middlewareOne) // Return: [middlewareOne] [one] Hello, World!
    Handle(mux, "/wraptwo", two, middlewareTwo) // Return: [middlewareTwo] [two] Hello, World!

    Handle(mux, "/nowrapone", one) // Return: [one] Hello, World!
    Handle(mux, "/nowraptwo", two) // Return: [two] Hello, World!
    return mux
}
```
