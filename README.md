Deepkit OpenAPI

# Development

```
npm install
npm run bootstrap
npm run link
```

# Backlogs

## Functional

1. Simple type casting problems
   1. string, Date
   2. float, string ?
2. Handle serializer options
   1. Renaming
   2. Exclusion
   3. Groups
3. Swagger UI Hosting

## Structural

1. Unit tests
2. CI

# Limitations

1. Functional routers not supported.

```ts
// Will not be documented
router.get('/user/:id', async (id: number, database: Database) => {
    return await database.query(User).filter({id}).findOne();
});
```

2. Parameter default values cannot depend on other parameters.

3. Parameter resolver

```ts
@http.resolveParameter(User, UserResolver)
class MyWebsite {
    // Does not know user is derived from path parameter `id: number`
    @http.GET(':id')
    getUser(user: User) {
        return 'Hello ' + user.username;
    }
}
```

4. Binary fields: `Uint8Array` etc. are not documented.

5. Content type other than `application/json` are not documentated

# References

[Deepkit Framework](https://deepkit.io/documentation/framework)

[Deepkit Book](https://deepkit-book.herokuapp.com/deepkit-book-english.html#_input)

