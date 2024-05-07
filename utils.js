module.exports = {
    messagesFromErrors: (errors) => {
        return errors.array().map(value => value.msg)
    }
}