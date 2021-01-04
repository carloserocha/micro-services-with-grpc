const {
    Model
} = require('./../db')

async function AlreadyCreatedByEmail(email) {
    const result = await Model.findOne({
        where: { email },
        attributes: {
            exclude: ['id']
        }
    })

    return result && result.dataValues ? result.dataValues : null
}

async function Create(_, callback) {
    const body = _.request || {}

    const taxvat = body.taxvat
    const email = body.email

    const result = await Model.findOne({
        where: { taxvat },
        attributes: {
            exclude: ['id']
        }
    })

    if (result) callback({ code: 302, message: 'Cliente já cadastrado anteriormente.' })
    else if (await AlreadyCreatedByEmail(email)) return callback({ code: 302, message: 'O Email informado já está sendo utilizado'})
    else {
        const data = await Model.create(body)

        const c = extractOnlyAllowFields(
            convertNullFieldToEmpty(
                convertEmptyFieldToNewObject(data.dataValues)
            ), ['id']
        )

        callback(null, c)
    }
}

async function Update(_, callback) {
    const body = _.request || {}

    const taxvat = body.taxvat
    const data = extractOnlyAllowFields(
        convertEmptyFieldToNewObject(body), ['taxvat']
    )

    const n = await Model.update(data, {
        where: { taxvat }
    }).then(async ([ result ]) => {
        if (!result) return null

        const c = await Model.findOne({
            where: { taxvat },
            attributes: {
                exclude: ['id']
            }
        })

        return c.dataValues
    })

    if (!n) callback({ error: 404, message: 'Cliente não cadastrado anteriormente.' })
    else callback(null,
        convertEmptyFieldToNewObject(
            convertNullFieldToEmpty(n)
        )
    )    
}

async function Delete(_, callback) {
    const body = _.request || {}

    callback(null, {
        is_removed: !!await Model.destroy({
            where: {
                taxvat: body.taxvat
            }
        })
    })
}

async function GetByTaxvat(_, callback) {
    const body = _.request || {}

    const search = await Model.findOne({
        where: {
            taxvat: body.taxvat
        },
        attributes: {
            exclude: ['id']
        }
    });

    callback(null, convertNullFieldToEmpty(search.dataValues))
}

async function GetByEmail(_, callback) {
    const body = _.request || {}

    const email = body.email

    const search = await Model.findOne({
        where: { email },
        attributes: {
            exclude: ['id']
        }
    });

    callback(null, convertNullFieldToEmpty(search.dataValues))
}

function convertNullFieldToEmpty(data) {
    for (const field in data) {
        //const o = data[field]
        if (isValidDate(data[field])) data[field] = new Date().toISOString()
        else if (isDate(data[field])) data[field] = data[field].toISOString()
        else data[field] = data[field] || ''
    }

    return data
}

function extractOnlyAllowFields(data, fields) {
    return Object.entries(data).map((c) => {
        const [key, value] = c

        const [ found ] = fields.filter(field => field === key)
        if (found) return undefined
        return { [key]: value }
    }).filter(c => c).reduce((acc, key)=>({...acc, ...key}))
}

function convertEmptyFieldToNewObject(data) {
    return Object.entries(data).map((c) => {
        const [key, value] = c

        if (String(value).length === 0) return undefined
        //if (value === null) return undefined
        return { [key]: value }
    }).filter(c => c).reduce((acc, key)=>({...acc, ...key}))
}

function isValidDate(d) {
    return d instanceof Date && isNaN(d);
}

function isDate(d) {
    return d instanceof Date
}

module.exports = {
    Create,
    Update,
    Delete,
    GetByTaxvat,
    GetByEmail
}