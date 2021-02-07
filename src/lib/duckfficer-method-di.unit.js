import test from 'ava'
import path from 'path'
import { duckfficerMethodDi } from './duckfficer-method-di.js'

test('builds an object appending all method found in given paths', async (t) => {
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
})

test('validates input', async (t) => {
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
})

test('validates output', async (t) => {
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
})

test('emits events', async (t) => {
  const container = duckfficerMethodDi({
    Gateway: 'gateways',
    Service: 'services'
  }, {
    baseDir: path.join(__dirname, './__tests__/fixtures')
  })

  const { PayPalGateway } = container

  PayPalGateway.on('Paid', (payload) => {
    t.log(payload)
    t.pass()
  })

  return PayPalGateway.pay(100)
})
