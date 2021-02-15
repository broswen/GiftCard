
![diagram](./images/diagram.png)


Card creation response body

```json
{
    "id": "8388-4659-8965-7120",
    "code": "747311",
    "value": 120
}
```

Use card request body

```json
{
    "code": "747311",
    "id": "8388-4659-8965-7120",
    "amount": 20
}
```

Use card response body

```json
{
    "amountDue": 0,
    "cardValue": 100
}
```