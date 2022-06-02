Deepkit OpenAPI

# Development

```
npm install
npm run bootstrap
npm run link
```

# Limitations

1. Functional routers not supported.

```ts
// Will not be documented
router.get('/user/:id', async (id: number, database: Database) => {
    return await database.query(User).filter({id}).findOne();
});
```

2. Parameter default values cannot depend on other parameters.

# References

[Deepkit Framework](https://deepkit.io/documentation/framework)

[Deepkit Book](https://deepkit-book.herokuapp.com/deepkit-book-english.html#_input)

