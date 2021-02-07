module.exports = () => {
  return async (amount, { emit }) => {
    if (amount === 0) {
      return amount
    }

    await emit('Paid', {
      something: 'was paid',
      amount
    })
    return `paying ${amount}$`
  }
}
