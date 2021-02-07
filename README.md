<div><h1>duckfficer-method-di</h1></div>

<p>
    <a href="https://www.npmjs.com/package/duckfficer-method-di" target="_blank"><img src="https://img.shields.io/npm/v/duckfficer-method-di.svg" alt="Version"></a>
<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p>
    a simple dependency injection module
</p>

## Installation

```sh
$ npm i duckfficer-method-di --save
# or
$ yarn add duckfficer-method-di
```

## Features

- [builds an object appending all method found in given paths](#builds-an-object-appending-all-method-found-in-given-paths)
- [validates input](#validates-input)
- [validates output](#validates-output)


<a name="builds-an-object-appending-all-method-found-in-given-paths"></a>

## builds an object appending all method found in given paths


```js
const container = duckfficerMethodDi({
  Gateway: 'gateways',
  Service: 'services'
}, {
  baseDir: path.join(__dirname, './__tests__/fixtures')
})

const { OrderService } = container
t.deepEqual(await OrderService.payment({
  id: '123',
  amount: 99
}), {
  id: '123',
  result: 'paying 99$'
})
```

<a name="validates-input"></a>

## validates input


```js
const container = duckfficerMethodDi({
  Gateway: 'gateways',
  Service: 'services'
}, {
  baseDir: path.join(__dirname, './__tests__/fixtures')
})

const { PayPalGateway } = container
const { originalError } = await t.throwsAsync(() => PayPalGateway.pay('100'), {
  message: 'Invalid input'
})
t.like(originalError, {
  message: 'Invalid number'
})
```

<a name="validates-output"></a>

## validates output


```js
const container = duckfficerMethodDi({
  Gateway: 'gateways',
  Service: 'services'
}, {
  baseDir: path.join(__dirname, './__tests__/fixtures')
})

const { PayPalGateway } = container

const { originalError } = await t.throwsAsync(() => PayPalGateway.pay(0), {
  message: 'Invalid output'
})

t.like(originalError, {
  message: 'Invalid string'
})
```


<br><a name="duckfficerMethodDi"></a>

### duckfficerMethodDi(pathResolvers, [baseDir], [methodsPath]) ⇒ <code>Object</code>

| Param | Type | Default |
| --- | --- | --- |
| pathResolvers | <code>Object</code> |  | 
| [baseDir] | <code>String</code> | <code>process.cwd()</code> | 
| [methodsPath] | <code>String</code> | <code>methods</code> | 

**Returns**: <code>Object</code> - container  

* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2020-present Martin Rafael Gonzalez <tin@devtin.io>
