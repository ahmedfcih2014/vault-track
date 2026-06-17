## Problem statement:

I have an issue to keep track for my income/spending/saving

and after carefully thinking I have decide to build a mobile app using react native to keep track for my money

### The provided data structure (database) is:

1. Saving object
```json
{
    balance: {
        usd: 100,
        sar: 110,
        gold_21: 5
    },
    transactions: [
        {
            amount: 5,
            accountType: 'usd'|'sar'|'gold_21',
            note: 'testing note here',
            operationType: 'withdraw'|'deposit'
        }
    ]
}
```

2. SpendingIncome object
```json
{
    startedAt: '2026-06-16T10:00:00+03:00',
    resetedAt: null,
    balance: 250|-250,
    transactions: [
        {
            amount: 100,
            note: 'test note',
            createdAt: '2026-06-16T10:01:00+03:00',
            operationType: 'withdraw'|'deposit'
        }
    ]
}
```

### The needed actions are:

1. deposit or withdraw in Saving
2. deposit or withdraw in SpendingIncome 
3. reset SpendingIncome --> set resetedAt attribute as now --> clone the object to a json file --> reset the main object as fresh with startedAt attribute as now 


### Non-Functional requirement

the app assumed to be used by myself by my mobile device only with ability to move it to a server then the mobile will act as user interface only with proper authentication
