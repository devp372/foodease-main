const bcrypt = require("bcrypt");
const {ObjectId} = require("mongodb");
const xss = require("xss");
const saltRounds = 16;
const validateUsername = (username, name) => {
    name = name || 'Username'
    if (!username || typeof username !== 'string') throw "Invalid " + name;
    username = username.trim();
    if (username === '') throw name + " cannot be an empty";
    for (let usernameElement of username) {
        usernameElement += "";
        usernameElement = usernameElement.toUpperCase();
        const code = usernameElement.charCodeAt(0)
        if (!((code >= 48 && code <= 57) || (code <= 90 && code >= 65))) throw name + " only contains letters and alphabets";
    }
    if (username.length < 4) throw `Minimum length of ${name} is 4 required`;
    const firstEle = username[0].toUpperCase();
    const code = firstEle.charCodeAt(0);
    if (!(code <= 90 && code >= 65)) throw name + " first character should be alphabet";
    return username;
}
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') throw "Invalid password";
    if (password.includes(' ')) throw "Password should not contain space";
    if (password.length < 4) throw "Password should be at least 4 characters long";
    let upper = false, lower = false, special = false, num = false;
    for (let passwordElement of password) {
        passwordElement += "";
        const code = passwordElement.charCodeAt(0);
        if (code <= 90 && code >= 65) {
            upper = true;
        } else if (code <= 122 && code >= 97) {
            lower = true;
        } else if (code >= 48 && code <= 57) {
            num = true;
        } else if (passwordElement !== ' ') {
            special = true;
        }
    }
    if (!upper) throw "Password should contain at least 1 Uppercase letter"
    if (!lower) throw "Password should contain at least 1 Lowercase letter"
    if (!num) throw "Password should contain at least 1 Number"
    if (!special) throw "Password should contain at least 1 Special Character"
}
const validateTime = (time, fieldName) => {
    fieldName = fieldName || 'Time'
    if (typeof time !== 'string') throw "Invalid " + fieldName;
    const reg = new RegExp(`^\\d{2}:\\d{2}$`);
    if (!reg.test(time)) throw "Invalid " + fieldName;
}
const getPasswordIntoHash = async (password) => {
    return bcrypt.hash(password, saltRounds);
}
const comparePassword = async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
}
const validateString = (value, fieldName, minLength = -Infinity) => {
    if (typeof value !== 'string') throw `Invalid type ${fieldName}`;
    value = value.trim();
    if (value === '') throw `${fieldName}  should not be empty`

    if (value.length < minLength) throw `${fieldName} should have minimum length ${minLength}`
    return value;
}
const validateObjectId = (id, fieldName) => {
    validateString('Id', id);
    if (!ObjectId.isValid(id)) throw "Invalid objectId for " + fieldName;
    return new ObjectId(id)
}
const validateAddress = (address, fieldName) => {
    fieldName = fieldName || "address"
    address = address || "";
    const reg = new RegExp(`^[A-Za-z0-9][A-Za-z0-9 /,#-]+$`);
    address = address.trim();
    if (!address) throw "Address should not be empty";
    if (!reg.test(address)) throw `Invalid ${fieldName} (Address only allow alphabets number dash space and comma)`;
    if (['-', ','].includes(address[address.length - 1])) throw "Invalid " + fieldName;
    return address;
}
const validateDate = (date, fieldName) => {
    fieldName = fieldName || "Date "
    if (typeof date !== 'string') throw 'Invalid ' + fieldName;

    date = date.trim();

    const arr = date.split("-");

    if (arr.length !== 3) throw "Invalid " + fieldName;

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) throw "Invalid " + fieldName;

    if ((dateObj.getMonth() + 1) !== Number(arr[1]) || dateObj.getDate() + 1 !== Number(arr[2]) || dateObj.getFullYear() !== Number(arr[0])) {
        throw "Invalid " + fieldName;
    }
    if (dateObj.getDate() === 29 && (dateObj.getMonth() + 1) === 2) throw "Invalid " + fieldName;
    if (dateObj.getTime() > new Date().getTime()) throw fieldName + " should not be greater than current date"
    return date;
}
const validateOnlyAlphabets = (str, fieldName, minLength) => {
    minLength = -Infinity;
    if (typeof str !== 'string') throw `${fieldName} should be string`;
    str = str.trim();
    const reg = new RegExp(`^[A-Za-z]+$`, 'g');
    if (!reg.test(str)) throw `${fieldName} should only allow alphabets`;
    if (str.length < minLength) throw `${fieldName} should have min length of ${minLength}`;
    return str;
}
const validateOnlyNumber = (num, fieldName, minLength) => {
    if (!num) throw "Invalid " + fieldName;
    fieldName = fieldName || 'Number';
    num = num + "";
    minLength = -Infinity;
    num = num.trim();
    const reg = new RegExp(`^[0-9]+$`);
    if (!reg.test(num)) throw `${fieldName} should only allow positive numbers`;
    if (num.length < minLength) throw `${fieldName} should have min length of ${minLength}`;
    return num;
}
const passXss = (obj) => {
    obj = obj || {}
    try {
        Object.keys(obj).forEach(v => {
            obj[v] = xss(obj[v])
        })
    } catch (e) {
        throw "Invalid form parameters"
    }
    return obj;
}
const validateEmail = (email) => {
    if (!email) throw "Email not found";
    const reg = new RegExp(`^[.!?$&a-z0-9A-Z+%’#*/=^_\`{|}~-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*$`);
    if (!reg.test(email)) throw "Invalid email";
    const index = email.lastIndexOf('.');
    if (index === -1 || index === email.length - 1) throw "Invalid email"
    return email;
}

const validateAlphabetsSpaceAndDash = (name, fieldName, minLength) => {
    name = validateString(name, fieldName, minLength);
    const reg = new RegExp(`^[A-Za-z0-9 -]+$`, 'g');
    if (!reg.test(name)) throw "Invalid " + fieldName;
    if ([' ', '-'].includes(name[name.length - 1])) throw "Invalid " + fieldName;
    if (name.includes('--') || name.includes('  ') || name.includes(' - -')) throw "Invalid " + fieldName;
    return name;
}


module.exports = {
    validateUsername,
    validatePassword,
    getPasswordIntoHash,
    comparePassword,
    validateTime,
    validateString,
    validateObjectId,
    validateAddress,
    validateDate,
    validateOnlyAlphabets,
    validateOnlyNumber,
    passXss,
    validateEmail,
    validateAlphabetsSpaceAndDash
}
