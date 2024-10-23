- Create a new User `SignUp` feature and pass the `JWT` token in cookies.
- If user already exits in DB then create `Login` feature and pass the `JWT` token in cookies.

- `POST/transaction`: Only authenticate user can create their transactions.
- `GET/transactions`: Only authenticate user can Retrieve all transactions.
- `GET/transactions/:id`: Only authenticate user can Retrieve a specific transaction by ID.
- `PUT/transactions/:id`: Only authenticate user can Update a specific transaction by ID.
- `DELETE/transactions/:id`: Only authenticate user can Delete a specific transaction by ID.
- `GET/summary`: Only authenticate user can Retrieve a summary of transactions, such as `total income`, `total expenses`, and `balance`. Optionally this can be filtered by date range or category.
