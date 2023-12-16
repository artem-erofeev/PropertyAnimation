// @input SceneObject object
// @input Component component
// @input Asset.AnimationCurve curve
// @input bool useOriginalValueAsFactor

const PropIO = require("./PropertyIO")
const Logger = require("./Logger")
var logger = Logger.instance

if (!script.object && !script.component)
    return 

if(script.object && script.component)
{
    logger.log("Both object and component are set in Controller. Only Object will be used")    
}

var entity = script.object ? script.object : script.component

var proto = Object.getPrototypeOf(entity.getTransform())
proto.getLocalRotationVec3 = function() {
    var rotationQuat = this.getLocalRotation();
    var rotationVec3 = rotationQuat.toEulerAngles();
    return rotationVec3;
}
proto.setLocalRotationVec3 = function(rotationVec3) {    
    var rotationQuat = quat.fromEulerAngles(rotationVec3.x, rotationVec3.y, rotationVec3.z);    
    this.setLocalRotation(rotationQuat);
}

var time = 0;
var event = script.createEvent("UpdateEvent");

if(script.useOriginalValueAsFactor)
{
    logger.begin("Save starting values")
    var originalValues = []
        script.curve.getPropertyKeys().forEach(function(key) {        
            var value = PropIO.getPropertyValue(entity, key)        
            logger.log(key + " = " + value.toString())
            originalValues[key] = value
        })
    logger.end()
}

event.bind(function(eventData) {        
    script.curve.getPropertyKeys().forEach(function(key) {        
        var track = script.curve.getProperty(key)        
        var trackStart = track.getKeyFrame(0).time              
        var trackEnd = track.getKeyFrame(track.keyFrameCount - 1).time        
        var trackLength = trackEnd - trackStart
        var value = track.evaluate(time % trackLength);
        getValue = function(){
            if(script.useOriginalValueAsFactor)
                return originalValues[key] * value
            else
                return value
        }
        PropIO.setPropertyValue(entity, key, getValue())        
    });

    time += (eventData.getDeltaTime() / 2);    
});