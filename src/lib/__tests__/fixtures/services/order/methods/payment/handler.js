module.exports = ({ PayPalGateway }) => {
  /**
   * @function Order.payment
   * @param {Object} payload.id
   * @param payload.id
   * @param payload.amount
   * @return {Object}
   */
  return async ({
    id,
    amount
  }) => {

    return {
      id,
      result: await PayPalGateway.pay(amount)
    }
  }
}
