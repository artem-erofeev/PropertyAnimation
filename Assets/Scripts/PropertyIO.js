// Import Logger and create an instance
const Logger = require("./Logger");
const logger = Logger.instance;

// Define getter and setter mappings
const methodMappings = {
    "transform": { get: "getTransform", set: "setTransform", shared: true },
    "localPosition": { get: "getLocalPosition", set: "setLocalPosition" },
    "localScale": { get: "getLocalScale", set: "setLocalScale" },
    "localRotation": { get: "getLocalRotation", set: "setLocalRotation" },
    "localRotationVec3": { get: "getLocalRotationVec3", set: "setLocalRotationVec3" }
};

// Function to retrieve a property value using a path
function getPropertyValue(object, propertyPath) {
    const parts = propertyPath.split('.');

    let currentObj = object;
    parts.forEach((part, index) => {
        if (index === parts.length - 1) return;
        if (methodMappings[part]) {
            currentObj = currentObj[methodMappings[part].get]();
        } else {
            currentObj = currentObj[part];
        }
    });
    return currentObj[parts[parts.length - 1]];
}

// Function to call a setter or assign a value
function callItem(item, value) {    
    if (item.setter) {
        logger.log(`call ${item.obj.getTypeName()}.${item.setter}(${value})`);
        item.obj[item.setter](value);
    } else {
        logger.log(`assign ${item.obj}.${item.propertyName} = ${value}`);
        item.obj[item.propertyName] = value;
    }
}

// Function to set a property value using a path
function setPropertyValue(object, propertyPath, value) {
    function applyChanges(chain, finalValue) {
        logger.begin("Apply", true);
        value = finalValue;        
        
        // Propagate changes back up the chain
        for (let i = chain.length - 1; i >= 0; i--) {
            const item = chain[i];            
            if (item.isTemporary) { //assuming leaf is always temporary
                callItem(item, value);
                value = item.obj;
            }
        }
        logger.end();
    }

    // Function to build a chain of properties and methods
    function buildPropertyChain(object, propertyPath, methodMappings) {
        logger.begin("Property Chain", true);
        const chain = [];
        let currentObj = object;
        const pathParts = propertyPath.split('.');
    
        pathParts.forEach((part, index) => {
            const isLastPart = index === pathParts.length - 1;
            const mapping = methodMappings[part];
            const item = { obj: currentObj, propertyName: part, isTemporary: !mapping };
            if (mapping) {
                logger.log(`${part}: ${currentObj.getTypeName()}.${mapping.get}/${mapping.set}, temporary: ${!mapping.shared}`);
                currentObj = currentObj[mapping.get]();                                   
                item.getter = mapping.get;
                item.setter = mapping.set;                
                item.isTemporary = !mapping.shared;                
            } else {
                logger.log(part);
                currentObj = currentObj[part];
            }
    
            if (!isLastPart || item.isTemporary) {
                chain.push(item);
            }
        });
        logger.end();
    
        return chain;
    }

    logger.begin(`setPropertyValue ${object.getTypeName()}  ${propertyPath} ${value}`, false);
    const propertyChain = buildPropertyChain(object, propertyPath, methodMappings);
    applyChanges(propertyChain, value);
    logger.end();
}

module.exports = {
    getPropertyValue,
    setPropertyValue
};
