class Logger {
    constructor(indentCharacter = '·', indentRepeatCount = 3) {
        this.depth = 0;
        this.history = [{what:"", enabled: true}];
        this.indentCharacter = indentCharacter;
        this.indentRepeatCount = indentRepeatCount;
    }

    begin(what, enabled = true) {        
        if (!this.history[this.depth].enabled) {
            enabled = false;
        }

        this.history.push({what: what, enabled: enabled});
        if (enabled) {
            this.log(`[${what}]`);
        }

        this.depth++;
    }

    end() {
        if (this.depth === 0) {
            console.warn("Logger.end() called more times than Logger.begin().");
            return;
        }

        this.depth--;
        this.history.pop();
    }

    log(message) {        
        if (!this.history[this.depth].enabled) {
            return;
        }

        const indentation = this.indentCharacter.repeat(this.depth * this.indentRepeatCount);
        print(indentation + message);
    }
}

const globalInstance = new Logger()

module.exports = {
    Logger,
    instance: globalInstance
};

// Example usage:
// const logger = new Logger();
// logger.begin("Process A");
// logger.log("Step 1");
// logger.end();